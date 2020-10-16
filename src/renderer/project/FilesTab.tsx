import React from 'react'
import { observer } from 'mobx-react'
import { IProject, IFile } from '../store'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import * as path from 'path'
import * as fs from 'fs'
import { remote } from 'electron'
import { ownKeys } from '../utils'

const { shell } = remote

export default observer((props: { project: IProject }) => {
  const { project } = props
  const platform = require('os').platform()

  const rescanFolderRecursive = (base: string, path: string): void => {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file) => {
        const curPath: string = path + '/' + file
        if (fs.lstatSync(curPath).isDirectory()) {
          rescanFolderRecursive(base, curPath)
        } else {
          const pathFile = curPath.replace(base, 'htdocs').split('\\').join('/')
          const file = project.files[pathFile]
          if (!file) {
            project.files[pathFile] = new IFile({} as IFile)
          }
        }
      })
    }
  }

  const rescan = (): void => {
    const base = path.join(project.storage, 'htdocs')
    rescanFolderRecursive(base, base)
    project.save()
  }

  const cleanUp = (): void => {
    ownKeys(project.files).map(key => {
      const file = path.join(project.storage, key)
      if (!fs.existsSync(file)) delete project.files[key]
    })
    project.save()
  }

  const check = (file: IFile): void => {
    file.tunnel = !file.tunnel
    project.save()
  }

  const openProjectFolder = (): void => {
    const where = 'file:///' + path.resolve(path.join(project.storage, 'htdocs'))
    console.warn({ where, platform, method: 'openExternal ///' })
    shell.openExternal(where)
  }

  const iterate = (): React.ReactNode[] => {
    return ownKeys(project.files).map(pathKey => {
      const file = project.files[pathKey] as IFile

      return <div key={pathKey}>
        <FormControlLabel
          control={<Checkbox checked={file.tunnel} onChange={(): void => check(file)} name="mock" />}
          label={pathKey.replace(/^htdocs\//, '')}
        />
      </div>
    })
  }

  return <>
    <Button variant="contained" color="primary" onClick={rescan}>Rescan htdocs</Button>
    &nbsp;
    <Button variant="contained" color="primary" onClick={openProjectFolder}>Open htdocs folder</Button>
    &nbsp;
    <Button variant="contained" color="primary" onClick={cleanUp}>Remove non-existing</Button>
    {iterate()}
  </>
})
