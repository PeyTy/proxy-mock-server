/* eslint-disable @typescript-eslint/member-delimiter-style */
import { action, observable, toJS } from 'mobx'
import * as fs from 'fs'
import * as path from 'path'
import { remote } from 'electron'
import ServerFactory from './server/ServerFactory'
import { ownKeys } from './utils'
import { Swagger, SwaggerPath, SwaggerPathMethod, SwaggerPathResponse, SwaggerPathResponseHeader, SwaggerDefinitions, SwaggerDefinition } from './utils/Swagger'
const { app } = remote
import alert from './utils/alert'

export class IRoute {
  @observable input = '/rest/'
  @observable replace = '/rest/'
  @observable demo = '/rest/'
  @observable uuid = '?'
  @observable enabled = true

  constructor(route: IRoute) {
    this.input = route.input || '/rest/'
    this.replace = route.replace || '/rest/'
    this.demo = route.demo || '/rest/'
    this.uuid = route.uuid || Math.random().toString()
    this.enabled = route.enabled == null ? true : route.enabled
  }
}

export class IFile {
  @observable tunnel = true
  @observable code = 200

  constructor(file: IFile) {
    this.tunnel = file.tunnel == null ? true : file.tunnel
    this.code = file.code == null ? 200 : file.code
  }
}

interface FilesMap {
  [path: string]: IFile
}

export class IApiResponse {
  @observable headers: { [status: string]: { name: string, value: string } } = {}
  @observable value: string

  recursiveSchemaToValue(swagger: SwaggerDefinition, definitions: SwaggerDefinitions): string | number | {} | boolean {
    if (swagger.type === 'object') {
      const result: { [property: string]: {} | number | string | boolean } = {}

      const properties = swagger.properties
      if (properties) {
        ownKeys(properties).map(key => {
          result[key] = this.recursiveSchemaToValue(properties[key], definitions)
        })
      }

      return result
    }

    if (swagger.type === 'array') {
      return []
    }

    if (swagger.type === 'boolean') {
      return false
    }

    if (swagger.type === 'string') {
      return swagger.example && (typeof swagger.example === 'string') ? swagger.example : 'test'
    }

    if (swagger.type === 'integer') {
      return swagger.example && (typeof swagger.example === 'number') ? swagger.example : 0
    }

    const $ref = swagger.$ref
    if ($ref) {
      const definition = definitions[$ref.split('#/definitions/')[1]] || definitions[$ref.split('#/components/schemas/')[1]]
      if (definition) {
        return this.recursiveSchemaToValue(definition, definitions)
      } else {
        console.warn('$ref not found', $ref)
      }
    }

    console.log({ unknown: swagger.type || swagger.$ref, swagger })
    return {}
  }

  schemaToValue(swagger: SwaggerPathResponse, definitions: SwaggerDefinitions): string {
    let schema = swagger.schema

    if (!schema && swagger.content && swagger.content['application/json']) schema = swagger.content['application/json'].schema

    if (!schema) return JSON.stringify({ description: swagger.description || 'no description' })
    // TODO more types
    if (schema.type === 'string') return JSON.stringify(swagger.description || 'description')
    if (schema.type === 'array') return '[]'

    // DTO

    if (schema.$ref) {
      const definition = definitions[schema.$ref.split('#/definitions/')[1]] || definitions[schema.$ref.split('#/components/schemas/')[1]]
      if (definition) {
        return JSON.stringify(this.recursiveSchemaToValue(definition, definitions), null, ' ')
      } else {
        console.warn('$ref not found', schema.$ref, definitions)
      }
    }

    console.warn('Unrecognized schema type', schema)
    return '{}'
  }

  schemaToHeader(swagger: SwaggerPathResponseHeader, name: string): { name: string, value: string } {
    let value = '255'

    if (swagger.format === 'date-time' && swagger.type === 'string') value = new Date().toISOString()

    return {
      name,
      value
    }
  }

  public resetValue(swagger: SwaggerPathResponse, definitions: SwaggerDefinitions): void {
    this.value = this.schemaToValue(swagger, definitions)
  }

  constructor(response: IApiResponse, swagger: SwaggerPathResponse, definitions: SwaggerDefinitions) {
    this.headers = response.headers == null ? {} : response.headers
    this.value = response.value == null ? this.schemaToValue(swagger, definitions) : response.value

    if (swagger.headers) {
      ownKeys(swagger.headers).map(key => {
        this.headers[key] = this.headers[key] || this.schemaToHeader(swagger.headers[key], key)
      })
    }
  }
}

export class IApiMethod {
  @observable responses: { [status: string]: IApiResponse } = {}
  @observable responseToMock = '*'

  constructor(method: IApiMethod, swagger: SwaggerPathMethod, definitions: SwaggerDefinitions) {
    this.responseToMock = method.responseToMock == null ? '*' : method.responseToMock
    this.responses = method.responses == null ? {} : method.responses

    if (swagger.responses) {
      ownKeys(swagger.responses).map(key => {
        this.responses[key] = new IApiResponse(this.responses[key] || {}, swagger.responses[key], definitions)
      })
    }
  }
}

export class IApi {
  @observable mock = true
  @observable methods: { [method: string]: IApiMethod } = {}

  constructor(api: IApi, swagger: SwaggerPath, definitions: SwaggerDefinitions) {
    this.mock = api.mock == null ? true : api.mock
    this.methods = api.methods == null ? {} : api.methods

    ownKeys(this.methods).map(key => {
      if (swagger[key]) {
        this.methods[key] = new IApiMethod(this.methods[key] || {}, swagger[key], definitions)
      }
    })

    ownKeys(swagger).map(key => {
      this.methods[key] = this.methods[key] || new IApiMethod({} as IApiMethod, swagger[key], definitions)
    })
  }
}

interface ApisMap {
  [path: string]: IApi
}

export class IProject {
  @observable title = '?'
  @observable uuid = '?'
  @observable swagger = '?'
  @observable swaggerJson: Swagger | null = null
  @observable state: 'busy' | 'works' | 'stopped' = 'stopped'
  @observable port = 3099
  @observable remote = '?'
  @observable storage = '?'
  @observable remotePort = 80
  @observable delay = 0
  @observable tunnel404 = true
  @observable tunnelSave = false
  @observable https = false
  @observable files: FilesMap = {}
  @observable apis: ApisMap = {}
  @observable routes: IRoute[] = []

  constructor(project: IProject, whereDir: string) {
    this.port = project.port || 3099
    this.remotePort = project.remotePort || 80
    this.title = project.title
    this.remote = project.remote || 'duspviz.mit.edu'
    this.swagger = project.swagger || 'https://petstore.swagger.io/v2/swagger.json'
    this.swaggerJson = project.swaggerJson || null
    this.files = project.files || {}
    this.apis = project.apis || {}
    this.uuid = project.uuid
    this.tunnel404 = project.tunnel404 == null ? true : project.tunnel404
    this.tunnelSave = project.tunnelSave == null ? false : project.tunnelSave
    this.https = project.https == null ? false : project.https
    this.storage = ((project.storage == null) || (project.storage === '')) ? path.join(whereDir, project.uuid) : project.storage

    let dir = this.storage
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    dir = path.join(dir, 'htdocs')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const gitkeep = path.join(dir, '.gitkeep')
    if (!fs.existsSync(gitkeep)) {
      fs.writeFileSync(gitkeep, '')
    }

    const swag = path.join(this.storage, 'swagger.json')
    if (fs.existsSync(swag)) {
      this.swaggerJson = JSON.parse(fs.readFileSync(swag).toString())
    }

    // Upgrade APIs
    this.fillApis()

    if (project.routes) {
      for (const route of project.routes) {
        this.routes.push(new IRoute(route))
      }
    } else {
      this.routes = [new IRoute({
        input: '^/rest/v([0-9]+)/',
        replace: '/rest/v$1/',
        demo: '/rest/v256/'
      } as IRoute)]
    }
  }

  getSchemas(): SwaggerDefinitions {
    const swaggerJson = this.swaggerJson
    if (!swaggerJson) return {}

    const schemas: SwaggerDefinitions = {
      ...(swaggerJson.definitions || {}),
      ...((swaggerJson.components || { schemas: {} }).schemas || {})
    }

    return schemas
  }

  fillApis(): void {
    const swaggerJson = this.swaggerJson
    if (swaggerJson) {
      ownKeys(swaggerJson.paths).map(key => {
        this.apis[key] = new IApi(this.apis[key] || {}, swaggerJson.paths[key], this.getSchemas())
      })
    }
  }

  saveSwagger(): void {
    const dir = this.storage
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (!this.swaggerJson) return

    const to = path.join(dir, 'swagger.json')
    fs.writeFileSync(to, JSON.stringify(toJS(this.swaggerJson), null, ' '))
  }

  save(): void {
    // Do not place swagger & other device specific data into project's json
    const swag = this.swaggerJson
    this.swaggerJson = null
    const storage = this.storage
    this.storage = '?'

    const to = path.join(storage, 'mock-project.json')
    fs.writeFileSync(to, JSON.stringify(toJS(this), null, ' '))

    this.storage = storage
    this.swaggerJson = swag
  }
}

export class Store {
  @observable route: 'projects' | 'project' = 'projects'
  @observable subroute: 'project' | 'log' | 'rest' | 'routes' | 'swagger' | 'files' = 'project'
  @observable rest = '?'
  @observable projects: IProject[] = []
  @observable projectList: string[] = []
  readonly whereDir: string = path.join(app.getPath('appData'), 'com.github.peyty.mocker')
  readonly where: string = path.join(this.whereDir, 'project-list.json')
  @observable newProjectModal = false
  @observable newProjectTitle = ''
  @observable newProjectStorage = ''
  @observable deleteProjectModal: IProject | null = null
  @observable currentProject: IProject = null as unknown as IProject
  @observable serverFactory!: ServerFactory

  constructor() {
    // Upgrade 1.0.0 -> 1.1.0
    const outdated = path.join(this.whereDir, 'projects.json')
    if (fs.existsSync(outdated)) {
      const projectList: string[] = []
      const projects: IProject[] = JSON.parse(fs.readFileSync(outdated).toString())

      projects.map(project => {
        projectList.push(project.storage)
        const reproj = new IProject(project, this.whereDir)
        reproj.save()
        reproj.saveSwagger()
      })

      fs.writeFileSync(this.where, JSON.stringify(projectList, null, ' '))
      fs.unlinkSync(outdated)
    }

    this.serverFactory = new ServerFactory()

    if (!fs.existsSync(this.whereDir)) {
      fs.mkdirSync(this.whereDir, { recursive: true })
    }

    if (!fs.existsSync(this.where)) {
      fs.writeFileSync(this.where, '[]')
    }

    this.projectList = JSON.parse(fs.readFileSync(this.where).toString())
    this.projectList = this.projectList.filter(storage => fs.existsSync(path.join(storage, 'mock-project.json')))
    this.projects = observable(
      this.projectList.map(storage => {
        const mock = path.join(storage, 'mock-project.json')
        const json = JSON.parse(fs.readFileSync(mock).toString())
        return new IProject({ ...json, storage }, this.whereDir)
      })
    )
  }

  @action.bound deleteProject(uuid: string): void {
    const index = this.projects.findIndex(project => project.uuid === uuid)
    if (index === -1) return
    const project = this.projects[index]
    this.serverFactory.stop(project)
    this.projects.splice(index, 1)
    this.projectList.splice(index, 1)
    this.saveProjectList()
  }

  @action.bound createProject(title: string, storage: string): void {
    if (this.existsProject(title)) return

    // Let's create sub folder for mocker
    if (storage) {
      storage = path.join(storage, 'mock-data')
      if (!fs.existsSync(storage)) {
        fs.mkdirSync(storage, { recursive: true })
      }
    }

    let uuid = '_'

    do {
      uuid = ('_' + Math.random() + '_' + Math.random()).replace('.', '_').replace('.', '_')
    } while (this.existsProjectUUID(uuid))

    let port = 4000
    this.projects.map(project => {
      port = Math.min(port, project.port)
    })
    port -= 1

    const project = new IProject({ title, uuid, storage, port } as IProject, this.whereDir)
    project.save()
    this.projects.push(project)
    this.projectList.push(project.storage)
    this.saveProjectList()
  }

  existsProject(title: string): boolean {
    const index = this.projects.findIndex(project => project.title === title)
    return index !== -1
  }

  existsProjectUUID(uuid: string): boolean {
    const index = this.projects.findIndex(project => project.uuid === uuid)
    return index !== -1
  }

  @action.bound saveProjectList(): void {
    fs.writeFileSync(this.where, JSON.stringify(toJS(this.projectList), null, ' '))
  }

  importProject(storage: string): void {
    if (this.projectList.includes(storage)) {
      alert('This project already exists')
      return
    }
    const mock = path.join(storage, 'mock-project.json')
    const json = JSON.parse(fs.readFileSync(mock).toString())
    const project = new IProject({ ...json, storage }, this.whereDir)
    this.projects.push(project)
    this.projectList.push(storage)
    this.saveProjectList()
  }
}
