import React from 'react'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import TypoGraphy from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import { observer } from 'mobx-react'
import { ProjectModal } from './modals/ProjectModal'
import { ProjectsGrid } from './ProjectsGrid'
import { Store } from './store'
import { remote } from 'electron'
import * as path from 'path'

const { dialog } = remote

export const Projects = observer((props: { store: Store }) => {
  const newProjectModal = (): void => {
    props.store.newProjectTitle = ''
    props.store.newProjectModal = true
  }

  const electron = process.versions.electron
  const node = process.versions.node
  const platform = require('os').platform()
  const version = require('../../package.json').version

  const importProject = (): void => {
    dialog.showOpenDialog({
      properties: ['openFile']
    }).then(files => {
      if (files.canceled === false) {
        const file = files.filePaths[0]
        if (!file.endsWith('mock-project.json')) {
          alert('Please, choose mock-project.json')
          return
        }
        // Handle file
        const storage = path.resolve(path.join(file, '..'))
        props.store.importProject(storage)
      }
    })
  }

  return (
    <>
      <AppBar color="primary" position="static">
        <Toolbar>
          <TypoGraphy variant="h6"
            color="inherit"
          >
            Choose or create project to mock
          </TypoGraphy>
           &nbsp;
           &nbsp;
           &nbsp;
          <Button variant="contained" color="secondary" onClick={newProjectModal}>
            Create project
          </Button>
           &nbsp;
           &nbsp;
          <Button variant="contained" color="secondary" onClick={importProject} title='Import mock-project.json'>
            Import project
          </Button>
        </Toolbar>

      </AppBar>
      <ProjectsGrid store={props.store} />
      <ProjectModal store={props.store} />
      <div style={{
        width: '100wv',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <span>electron: <span>{electron} </span>
        node: <span>{node} </span>
        platform: <span>{platform} </span>
        version: <span>{version} </span></span>
      </div>
    </>
  )
})
