import React, { useState } from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { observer } from 'mobx-react'
import Project from './Project'
import { Projects } from './Projects'
import { Store } from './store'

const App = observer(() => {
  const [store] = useState(() => new Store())

  const backToProjects = (): void => {
    store.route = 'projects'
  }

  return (
    <>
      {store.route === 'projects' && <Projects store={store} />}
      {store.route === 'project' && <Project store={store} key={store.currentProject.uuid} backToProjects={backToProjects} />}
    </>
  )
})

export default hot(App)
