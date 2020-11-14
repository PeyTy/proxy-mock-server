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

import React, { useState } from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { observer } from 'mobx-react'
import Project from './Project'
import { Projects } from './Projects'
import { Store } from './store'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

const App = observer(() => {
  const [store] = useState(() => new Store())

  const { prefersDarkMode } = store.settings

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light'
        }
      }),
    [prefersDarkMode]
  )

  const backToProjects = (): void => {
    store.route = 'projects'
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {store.route === 'projects' && <Projects store={store} key={store.settings.language} />}
      {store.route === 'project' && <Project store={store} key={store.currentProject.uuid} backToProjects={backToProjects} />}
    </ThemeProvider>
  )
})

export default hot(App)
