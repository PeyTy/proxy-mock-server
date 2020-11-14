import React from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import { Grid, Typography } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import { AreYouSureModal } from './modals/AreYouSureModal'
import { Store, IProject } from './store'
import Button from '@material-ui/core/Button'
import TypoGraphy from '@material-ui/core/Typography'
import { observer } from 'mobx-react'

export const ProjectsGrid = observer((props: { store: Store }) => {
  const { store } = props

  const deleteProject = (project: IProject): void => {
    store.deleteProjectModal = project
  }

  const deleteProjectYes = (): void => {
    const uuid = store.deleteProjectModal ? store.deleteProjectModal.uuid : ''
    store.deleteProjectModal = null
    store.deleteProject(uuid)
  }

  const deleteProjectNo = (): void => {
    store.deleteProjectModal = null
  }

  const openProject = (project: IProject): void => {
    store.currentProject = project
    store.route = 'project'
  }

  const startProject = (project: IProject): void => {
    store.serverFactory.start(project)
  }

  const stopProject = (project: IProject): void => {
    store.serverFactory.stop(project)
  }

  const text = store.text

  return (
    <div style={{ marginTop: 20, padding: 30 }}>
      <Grid container spacing={1} justify="center">
        {store.projects.map(project => (
          <Grid item key={project.uuid}>
            <Card>
              <CardActionArea onClick={(): void => { openProject(project) }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {project.title}
                  </Typography>
                  <Typography component="p" color="primary">{text('Hosted at')} :{project.port}</Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                {project.state === 'stopped' && <Button size="small" color="primary" onClick={(): void => { startProject(project) }}>
                  {text('Start')}
                </Button>}
                {project.state === 'works' && <Button size="small" color="primary" onClick={(): void => { stopProject(project) }}>
                  {text('Stop')}
                </Button>}
                {project.state === 'busy' && <Button size="small" color="primary" onClick={(): void => { /* No-op */ }}>
                  {text('Wait')}
                </Button>}
                <Button size="small" color="secondary" onClick={(): void => { deleteProject(project) }}>
                  {text('Delete')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {
          store.projects.length === 0 && <TypoGraphy variant="h6"
            color="inherit"
          >
            No projects yet
          </TypoGraphy>
        }
      </Grid>

      <AreYouSureModal
        open={store.deleteProjectModal != null}
        title={'Delete project ' + (store.deleteProjectModal || { title: '...' }).title}
        yes={deleteProjectYes}
        no={deleteProjectNo}
      />

      <Box component="span" m={12}>
        {false && <Button variant="contained" color="primary">
          Create project
        </Button>}
      </Box>
    </div>
  )
})
