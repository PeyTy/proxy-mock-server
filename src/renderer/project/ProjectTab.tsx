import React, { useState } from 'react'
import { Store, IProject } from '../store'
import TextField from '@material-ui/core/TextField'
import { observer } from 'mobx-react'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { observable } from 'mobx'
import { remote } from 'electron'
import * as path from 'path'

const { shell } = remote

class State {
  // Only for validation
  @observable title = ''
  @observable port = ''
  @observable remote = ''
  @observable delay = ''
  @observable remotePort = ''

  constructor(project: IProject) {
    this.title = project.title
    this.port = project.port + ''
    this.remote = project.remote
    this.delay = project.delay + ''
    this.remotePort = project.remotePort + ''
  }
}

export default observer((props: { store: Store }) => {
  const { store } = props
  const [state] = useState(() => new State(store.currentProject))
  const platform = require('os').platform()

  const isValidTitle = (): boolean => {
    const title = state.title
    if (title === '') return false
    if (store.currentProject.title === title) return true
    if (store.existsProject(title)) return false
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeTitle = (event: any): void => {
    state.title = event.target.value.trim()
    if (!isValidTitle()) return
    store.currentProject.title = state.title
    store.currentProject.save()
  }

  const isValidPort = (): boolean => {
    return parseInt(state.port.trim()) > 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangePort = (event: any): void => {
    state.port = event.target.value.trim()
    if (!isValidPort()) return
    store.currentProject.port = parseInt(state.port)
    store.currentProject.save()
  }

  const isValidRemotePort = (): boolean => {
    return parseInt(state.remotePort.trim()) > 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeRemotePort = (event: any): void => {
    state.remotePort = event.target.value.trim()
    if (!isValidRemotePort()) return
    store.currentProject.remotePort = parseInt(state.remotePort)
    store.currentProject.save()
  }

  const isValidRemote = (): boolean => {
    return state.remote.trim().length > 0 && state.remote.includes('.') && !state.remote.endsWith('.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeRemote = (event: any): void => {
    state.remote = event.target.value.trim().replace('https://', '').replace('/', '')
    if (!isValidRemote()) return
    store.currentProject.remote = state.remote
    store.currentProject.save()
  }

  const isValidDelay = (): boolean => {
    return parseInt(state.delay.trim()) >= 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeDelay = (event: any): void => {
    state.delay = event.target.value.trim()
    if (!isValidDelay()) return
    store.currentProject.delay = parseInt(state.delay)
    store.currentProject.save()
  }

  const startProject = (): void => {
    store.serverFactory.start(store.currentProject)
  }

  const stopProject = (): void => {
    store.serverFactory.stop(store.currentProject)
  }

  const openProjectFolder = (): void => {
    if (platform === 'win32') {
      const folder = 'file://' + path.resolve(path.join(store.currentProject.storage, 'htdocs'))
      console.warn({ folder, platform, method: 'openExternal' })
      shell.openExternal(folder)
    } else {
      const folder = path.resolve(path.join(store.currentProject.storage, 'htdocs'))
      console.warn({ folder, platform, method: 'showItemInFolder' })
      shell.showItemInFolder(folder)
    }
  }

  const openBrowser = (): void => {
    shell.openExternal('http://localhost:' + store.currentProject.port)
  }

  const handleChangeTunnel404 = (): void => {
    store.currentProject.tunnel404 = !store.currentProject.tunnel404
    store.currentProject.save()
  }

  const handleChangeTunnelSave = (): void => {
    store.currentProject.tunnelSave = !store.currentProject.tunnelSave
    store.currentProject.save()
  }

  const handleChangeHttps = (): void => {
    store.currentProject.https = !store.currentProject.https
    store.currentProject.save()
  }

  const text = store.text

  return <>
    <TextField
      margin="dense"
      id="name"
      label={text("Project title")}
      type="text"
      fullWidth
      defaultValue={store.currentProject.title}
      onChange={handleChangeTitle}
      error={!isValidTitle()}
    />
    <TextField
      margin="dense"
      id="name"
      label={text("Local port")}
      type="text"
      fullWidth
      defaultValue={store.currentProject.port}
      onChange={handleChangePort}
      error={!isValidPort()}
    />
    <TextField
      autoFocus
      margin="dense"
      id="name"
      label={text("Remote host for tunneling")}
      type="text"
      fullWidth
      defaultValue={store.currentProject.remote}
      onChange={handleChangeRemote}
      error={!isValidRemote()}
    />
    <TextField
      margin="dense"
      id="name"
      label={text("Remote port for tunneling (443 for HTTPS)")}
      type="text"
      fullWidth
      defaultValue={store.currentProject.remotePort}
      onChange={handleChangeRemotePort}
      error={!isValidRemotePort()}
    />
    <TextField
      margin="dense"
      id="name"
      label={text("Simulated response delay in milliseconds")}
      type="text"
      fullWidth
      defaultValue={'0'}
      onChange={handleChangeDelay}
      error={!isValidDelay()}
    />
    <div>
      <FormControlLabel
        control={<Checkbox checked={store.currentProject.tunnel404} onChange={handleChangeTunnel404} name="tunnel404" />}
        label={text("Tunnel first, re-route & mock only on 404")}
      />
      <FormControlLabel
        control={<Checkbox checked={store.currentProject.https} onChange={handleChangeHttps} name="https" />}
        label={text("Use HTTPS protocol for remote")}
      />
    </div>
    <div>
      <FormControlLabel
        control={<Checkbox checked={store.currentProject.tunnelSave} onChange={handleChangeTunnelSave} name="tunnelSave" />}
        label={text("Save tunneled files to htdocs")}
      />
    </div>
    <div>
      {store.currentProject.state === 'stopped' && <Button variant="contained" color="primary" onClick={startProject}>{text("Start server")}</Button>}
      {store.currentProject.state === 'works' && <Button variant="contained" color="secondary" onClick={stopProject}>{text("Stop server")}</Button>}
      {store.currentProject.state === 'busy' && <Button variant="contained" color="primary">{text("Please wait")}</Button>}
      &nbsp;
      <Button variant="contained" color="primary" onClick={openProjectFolder}>{text("Open htdocs folder")}</Button>
      &nbsp;
      <Button variant="contained" color="primary" onClick={openBrowser}>{text("Open in browser")}</Button>
    </div>
  </>
})
