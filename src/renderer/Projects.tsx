// MIT License
//
// Copyright(c) 2020 Miraculous Ladybugreport
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
import alert from './utils/alert'
import Brightness7Icon from '@material-ui/icons/Brightness7'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import FlagIcon from '@material-ui/icons/Flag'
import { Select, MenuItem } from '@material-ui/core'
import { languagesList } from './lang/languages'

const { dialog } = remote

export const Projects = observer((props: { store: Store }) => {
  const { store } = props

  const newProjectModal = (): void => {
    store.newProjectTitle = ''
    store.newProjectModal = true
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
        store.importProject(storage)
      }
    })
  }

  const { prefersDarkMode, language } = store.settings

  const toggleDarkMode = (): void => {
    store.settings.prefersDarkMode = !prefersDarkMode
    store.settings.saveSettings(store.whereSettings)
  }

  const handleChangeLanguage = (event: any) => {
    store.settings.language = event.target.value.toString()
    store.settings.saveSettings(store.whereSettings)
    store.loadTranslation()
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
           &nbsp;
           &nbsp;
           &nbsp;
          {prefersDarkMode
            ? <Brightness4Icon className="pointer" onClick={() => toggleDarkMode()}
            />
            : <Brightness7Icon className="pointer" onClick={() => toggleDarkMode()}
            />
          }
           &nbsp;
           &nbsp;
           &nbsp;
          <span>
            <Select
              labelId="language-simple-select-label"
              id="language-simple-select"
              value={language}
              onChange={handleChangeLanguage}
              className="selectFix"
              style={{ color: 'white' }}
            >
              {languagesList.map(language => <MenuItem value={language}><FlagIcon /> <span className="uppercase">{language}</span></MenuItem>)}
            </Select>
          </span>
        </Toolbar>

      </AppBar>
      <ProjectsGrid store={store} />
      <ProjectModal store={store} />
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
