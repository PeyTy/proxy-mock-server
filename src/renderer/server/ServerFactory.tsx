/* eslint-disable @typescript-eslint/member-delimiter-style */
import https from 'https'
import http, { IncomingMessage, ServerResponse } from 'http'
import * as path from 'path'
import * as fs from 'fs'
import mime from 'mime-types'
import { IFile, IProject } from '../store'
import { observable } from 'mobx'
import { ownKeys } from '../utils'
import * as config from '../utils/constants'
import { isMethodWithBody } from '../utils/network'
import { replacers } from '../utils/faker'

export interface LogRecord {
  meta: string
  url: string
}

interface Window {
  serverClosers: Function[]
}

export default class {
  constructor() {
    // Close all previuos unclosed servers if any to free occupied ports
    // eslint-disable-next-line no-lone-blocks
    {
      (window as unknown as Window).serverClosers = (window as unknown as Window).serverClosers || []
      for (const closer of (window as unknown as Window).serverClosers) {
        closer()
      }
      (window as unknown as Window).serverClosers = []
    }
  }

  start(project: IProject): void {
    console.log('start!')
    project.state = 'busy'

    const server = http.createServer((req: IncomingMessage, res: ServerResponse): void => this.handleMockRequest(project, req, res))
    server.listen(project.port, () => {
      // TODO handle fail
      project.state = 'works'
      this.servers.set(project.uuid, server)
    })

    // eslint-disable-next-line no-lone-blocks
    {
      // Fix for react hot reload
      (window as unknown as Window).serverClosers.push(() => server.close())
    }
  }

  stop(project: IProject): void {
    console.log('stop!')
    project.state = 'busy'
    try {
      const server = this.servers.get(project.uuid)
      if (server) server.close()
    } catch (e) {

    }
    project.state = 'stopped'
  }

  log(project: IProject, meta: string, url: string): void {
    const records = this.logs.get(project.uuid) || observable([])
    this.logs.set(project.uuid, records)
    records.push({ meta: meta, url: url })
  }

  servers: Map<string, http.Server> = new Map()
  @observable logs: Map<string, LogRecord[]> = new Map()

  handleMockRequest = (project: IProject, req: IncomingMessage, res: ServerResponse): void => {
    setTimeout(() => this.handleMockRequestDelay(project, req, res), project.delay)
  }

  isTunnelableFile(project: IProject, path: string): boolean {
    path = path.split('\\').join('/')

    const file = project.files[path]
    if (file) {
      return file.tunnel
    } else {
      project.files[path] = new IFile({} as IFile)
    }

    return true
  }

  isMockableApi(project: IProject, path: string): boolean {
    const swaggerJson = project.swaggerJson
    const apis = project.apis || {}

    if (!swaggerJson) return false
    if (swaggerJson.basePath && !path.includes(swaggerJson.basePath)) return false

    const base: string = this.getSwaggerBasePattern(project, path)

    if (swaggerJson.paths[base] && apis[base] && apis[base].mock !== false) return true

    // Handle /api/{abc}/abc

    const pattern = this.resolveSwaggerPattern(project, path)
    if (!pattern) return false
    if (apis[pattern] && apis[pattern].mock === false) return false
    if (swaggerJson.paths[pattern]) return true

    return false
  }

  resolveSwaggerPattern(project: IProject, path: string): string | undefined {
    const swaggerJson = project.swaggerJson
    if (!swaggerJson) return undefined
    path = path.replace((swaggerJson.basePath || '') + '/', '/')

    // Handle /api/{abc}/abc

    const patterns = ownKeys(swaggerJson.paths)

    for (const pattern of patterns) {
      if (!pattern) continue
      try {
        const reg = new RegExp(pattern.replace(new RegExp('(\\{[A-z_0-9]+\\})', 'g'), '[A-z_0-9]+') + '$')
        if (path.match(reg)) {
          return pattern
        }
      } catch (e) {
        console.warn(e)
      }
    }

    return undefined
  }

  getSwaggerBasePattern(project: IProject, path: string): string {
    const swaggerJson = project.swaggerJson
    if (!swaggerJson) return path
    return path.replace((swaggerJson.basePath || '') + '/', '/')
  }

  handleMockRequestDelay = (project: IProject, req: IncomingMessage, res: ServerResponse): void => {
    if (project.tunnel404) {
      req.url = (req.url || '')
      const relativePath = path.join('htdocs', req.url.split('?')[0].split('/').join(path.sep))
      const filePath = path.join(project.storage, relativePath)
      this.tunnelRequest(project, req, res, filePath, (): void => this.performMock(project, req, res, false))
    } else {
      this.performMock(project, req, res, true)
    }
  }

  performMock = (project: IProject, req: IncomingMessage, res: ServerResponse, tunnel: boolean): void => {
    req.method = (req.method || 'GET').toUpperCase()
    req.url = (req.url || '')
    this.log(project, req.method, req.url)

    project.routes.map((route) => {
      try {
        if (route.enabled) {
          req.url = (req.url || '').replace(new RegExp(route.input), route.replace)
        }
      } catch (e) {
        // ignore
      }
    })

    const relativePath = path.join('htdocs', req.url.split('?')[0].split('/').join(path.sep))
    const filePath = path.join(project.storage, relativePath)

    const isDir = fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()
    const indexRelative = path.join(relativePath, 'index.html')
    const index = path.join(filePath, 'index.html')

    if (isDir && fs.existsSync(index) && this.isTunnelableFile(project, indexRelative)) {
      this.htdocsRequest(project, req, res, index)
    } else if (!isDir && fs.existsSync(filePath) && this.isTunnelableFile(project, relativePath)) {
      this.htdocsRequest(project, req, res, filePath)
    } else if (this.isMockableApi(project, req.url.split('?')[0])) {
      this.mockRequest(project, req, res)
    } else if (tunnel) {
      this.tunnelRequest(project, req, res, filePath, null)
    } else {
      this.log(project, 'UNHANDLED [404]', req.url)
      res.writeHead(404, {
        ...config.defaultHeaders,
        'Content-Type': 'text/html'
      })
      res.write('404 Not Found')
      res.end()
    }
  }

  tunnelRequest = (project: IProject, req: IncomingMessage, res: ServerResponse, filePath: string, fallback404: (() => void) | null): void => {
    const agent = new http.Agent({
      keepAlive: true,
      maxSockets: 1,
      keepAliveMsecs: 60000
    })

    req.headers = req.headers || {}
    const cookies = req.headers.Cookie || req.headers.cookie

    const headers: http.OutgoingHttpHeaders = {
      Cookie: cookies,
      'User-Agent': (req.headers || {})['User-Agent'] || (req.headers || {})['user-agent'] || config.defaultUserAgent,
      'Access-Control-Allow-Origin': '*',
      Connection: 'keep-alive'
    }

    const options: http.RequestOptions = {
      agent: agent,
      hostname: project.remote,
      method: req.method,
      port: project.remotePort,
      path: req.url,
      headers: headers
    }

    if (isMethodWithBody(req.method)) {
      headers['Content-Length'] = req.headers['content-length'] || req.headers['Content-Length']
      headers['Content-Type'] = req.headers['content-type'] || req.headers['Content-Type']
    }

    if (project.https) delete options.agent
    if (!cookies) delete headers.Cookie

    const buffers: Buffer[] = []

    const callback = (response: IncomingMessage): void => {
      if (fallback404 && [404, 301].includes(response.statusCode || 404)) {
        fallback404()
        return
      }

      const head: http.OutgoingHttpHeaders = {
        ...config.defaultHeaders,
        'Content-Type': response.headers['Content-Type'] || response.headers['content-type'],
        Date: response.headers.Date || response.headers.date,
        Server: response.headers.Server || response.headers.server || 'tunnel'
      }

      const presentHeaders = ownKeys(head).map(header => header.toLowerCase())

      ownKeys(response.headers).map(header => {
        const lower = header.toLowerCase()
        if (config.nonTunnelledHeadersLowercase.includes(lower)) return
        if (presentHeaders.includes(lower)) return

        head[header] = response.headers[header]
      })

      const cookies = response.headers['Set-Cookie'] || response.headers['set-cookie']

      if (cookies) {
        // ; domain=.stackoverflow.com;
        //  TODO Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value> i.e.trim()$ and [Dd]
        const reg = new RegExp('; [dD]+omain=[\\.A-z0-9_\\-@]+;')
        const cookiesNoDomain = []
        for (const cookie of cookies) {
          const noDomain = cookie.trim().replace(reg, ';')
          cookiesNoDomain.push(noDomain)
        }
        res.setHeader('Set-Cookie', cookiesNoDomain)
      }

      res.writeHead(response.statusCode || 200, head)

      const chunks: Buffer[] = []

      // another chunk of data has been received, so append it to `str`
      response.on('data', (chunk: Buffer) => {
        if (project.tunnelSave === true) chunks.push(chunk)
        res.write(chunk)
      })

      // the whole response has been received, so we just print it out here
      response.on('end', () => {
        this.log(project, 'TUNNEL [' + response.statusCode + ']', req.url + '')
        if (project.tunnelSave === true && config.tunnelSaveExtensions.includes(path.extname(filePath))) {
          const dir = path.join(filePath, '..')
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(filePath, Buffer.concat(chunks))
        }
        res.end()
      })
    }

    const _req = (project.https ? https : http).request(options, callback)

    if (isMethodWithBody(req.method)) {
      req.on('data', (chunk: Buffer) => {
        buffers.push(chunk)
      })

      req.on('end', () => {
        _req.write(Buffer.concat(buffers))
        _req.end()
      })
    } else {
      _req.end()
    }
  }

  htdocsRequest = (project: IProject, req: IncomingMessage, res: ServerResponse, filePath: string): void => {
    const head: http.OutgoingHttpHeaders = {
      ...config.defaultHeaders,
      'Content-Type': mime.lookup(filePath) || 'application/octet-stream',
      Server: 'htdocs'
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, head)
        this.log(project, 'HTDOCS [500]', req.url + '')
        res.write('500 Internal Server Error')
        res.end()
        console.error(err)
      }
      this.log(project, 'HTDOCS [200]', req.url + '')
      res.writeHead(200, head)
      res.write(data)
      res.end()
    })
  }

  mockRequest = (project: IProject, req: IncomingMessage, res: ServerResponse): void => {
    const head: http.OutgoingHttpHeaders = {
      ...config.defaultHeaders,
      'Content-Type': 'application/json',
      Server: 'swagger'
    }

    const url = (req.url || '').split('?')[0]
    const method = (req.method || 'get').toLowerCase()
    const pattern = this.resolveSwaggerPattern(project, url) || 'undefined'
    const base = this.getSwaggerBasePattern(project, url)
    const swaggerJson = project.swaggerJson
    if (!swaggerJson) return

    head.Pattern = base
    let code = 200
    let content = '{}'

    let api = project.apis[base]
    if (!api || !api.mock) {
      api = project.apis[pattern]
      head.Pattern = pattern
    }
    const apiMethod = api ? api.methods[method] : null

    if (apiMethod) {
      let response = apiMethod.responses['200']

      if (apiMethod.responseToMock === '*' && !response) {
        const pathKey = ownKeys(apiMethod.responses)[0]
        response = apiMethod.responses[pathKey]
        code = parseInt(pathKey) || 200
      }

      if (apiMethod.responseToMock !== '*') {
        response = apiMethod.responses[apiMethod.responseToMock]
        code = parseInt(apiMethod.responseToMock) || 400
      }

      if (response) {
        content = response.value || '{}'
        if (response.headers) {
          ownKeys(response.headers).map(pathKey => {
            const header = response.headers[pathKey]
            head[header.name] = header.value
          })
        }
      } else {
        code = 500
      }
    }

    // faker
    ownKeys(replacers).map(pathKey => {
      const replacer: () => string = (replacers as any)[pathKey]
      const pattern = '{{' + pathKey + '}}'
      while (content.includes(pattern)) content = content.replace(pattern, replacer())
    })

    this.log(project, 'MOCK [' + code + ']', pattern)
    res.writeHead(code, head)
    res.write(content)
    res.end()
  }
}
