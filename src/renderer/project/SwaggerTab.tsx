import React, { useState } from 'react'
import { IProject } from '../store'
import TextField from '@material-ui/core/TextField'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import * as fs from 'fs'
import { remote } from 'electron'
import { parse } from 'url'
import https from 'https'
import http from 'http'
import { ownKeys } from '../utils'
import * as config from '../utils/constants'

const { dialog } = remote

class State {
  // Only for validation
  @observable remote = ''

  constructor(remote: string) {
    this.remote = remote
  }
}

export default observer((props: { project: IProject }) => {
  const { project } = props
  const [state] = useState(() => new State(project.swagger))

  const isValid = (): boolean => {
    return state.remote !== ''
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any): void => {
    state.remote = event.target.value.trim()
    if (!isValid()) return
    project.swagger = state.remote
    project.save()
  }

  const handleImport = (json: string): void => {
    const backup = project.swaggerJson

    try {
      const payload = JSON.parse(json)
      payload.paths = payload.paths || {}
      project.swaggerJson = payload
      project.fillApis()
      project.saveSwagger()
    } catch (e) {
      project.swaggerJson = backup
      console.warn('Using backup Swagger', e)
      alert('Cannot parse swagger: ' + e.message)
    }

    project.save()
  }

  const handleImportUrl = (): void => {
    const url = state.remote
    const parsed = parse(url)
    const isHTTPS = url.includes('https:')
    const subs = url
      .replace('https://', '')
      .replace('http://', '')
      .split('/')
    subs.shift()

    const protocol = isHTTPS ? https : http
    const options = {
      hostname: parsed.hostname,
      port: parseInt(parsed.port || (isHTTPS ? '443' : '80')),
      path: '/' + subs.join('/'),
      method: 'GET',
      headers: {
        'User-Agent': config.defaultUserAgent
      }
    }

    const req = protocol.request(options, res => {
      let json = ''

      res.on('data', chunk => {
        json += chunk.toString()
      })

      res.on('end', () => {
        handleImport(json)
      })
    })

    req.on('error', error => {
      console.error(error)
      alert('Cannot get swagger: ' + error.message)
    })

    req.end()
  }

  const handleImportFile = (): void => {
    dialog.showOpenDialog({
      properties: ['openFile']
    }).then(files => {
      if (files.canceled === false) {
        // handle files
        handleImport(fs.readFileSync(files.filePaths[0]).toString())
      }
    })
  }

  return <>
    <TextField
      autoFocus
      margin="dense"
      id="name"
      label="Path to Swagger host"
      type="text"
      fullWidth
      defaultValue={state.remote}
      onChange={handleChange}
      error={!isValid()}
    />
    <Button onClick={handleImportUrl} color="primary">
      Import URL
    </Button>
    <Button onClick={handleImportFile} color="primary">
      Import file
    </Button>
    <Typography paragraph>
      {!project.swaggerJson && 'Imported Swagger description from JSON will be here'}
      {project.swaggerJson &&
        'Paths: ' + ownKeys(project.swaggerJson.paths).map(pathKey => {
          const path = ' ' + pathKey.toString()
          return path
        }).join(', ') + ' check the side bar for path settings.'
      }
    </Typography>
    {project.swaggerJson && <Typography paragraph>Base path: {project.swaggerJson.basePath || '/'}</Typography>}
  </>
})
