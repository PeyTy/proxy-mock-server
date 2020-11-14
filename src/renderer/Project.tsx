/* eslint-disable @typescript-eslint/member-delimiter-style */
import React from 'react'
import clsx from 'clsx'
import { fade, makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import MailIcon from '@material-ui/icons/Mail'
import Build from '@material-ui/icons/Build'
import CallSplit from '@material-ui/icons/CallSplit'
import FlipToBack from '@material-ui/icons/FlipToBack'
import FlipToFront from '@material-ui/icons/FlipToFront'
import CreateNewFolder from '@material-ui/icons/CreateNewFolder'
import SearchIcon from '@material-ui/icons/Search'
import InputBase from '@material-ui/core/InputBase'

import Button from '@material-ui/core/Button'

import { Store } from './store'
import { observer } from 'mobx-react'
import { ownKeys } from './utils'

import LogTab from './project/LogTab'
import ProjectTab from './project/ProjectTab'
import RestTab from './project/RestTab'
import RoutesTab from './project/RoutesTab'
import SwaggerTab from './project/SwaggerTab'
import FilesTab from './project/FilesTab'

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    hide: {
      display: 'none'
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      overflowX: 'hidden',
      width: drawerWidth
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end'
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      marginLeft: -drawerWidth
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto'
      }
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '16ch',
        '&:focus': {
          width: '20ch'
        }
      }
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    }
  })
)

interface Props {
  store: Store
  backToProjects: () => void
}

export default observer((props: Props) => {
  const classes = useStyles()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const { store, backToProjects } = props

  const handleDrawerOpen = (): void => {
    setOpen(true)
  }

  const handleDrawerClose = (): void => {
    setOpen(false)
  }

  const route = (where: typeof store.subroute, rest = ''): void => {
    store.subroute = where
    store.rest = rest
  }

  const backToProjectList = (): void => {
    store.subroute = 'project'
    store.rest = ''
    backToProjects()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchRest = (event: any): void => {
    const value: string = event.target.value.trim()
    if (value === '') return
    const swaggerJson = store.currentProject.swaggerJson
    if (!swaggerJson) return

    for (const pathKey of ownKeys(swaggerJson.paths)) {
      if (pathKey.includes(value)) {
        route('rest', pathKey)
        break
      }
    }
  }

  const text = store.text

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {store.currentProject.title}
          </Typography>
          &nbsp;
          &nbsp;
          &nbsp;
          <Button variant="contained" color="secondary" onClick={backToProjectList}>
            {text('Back to projects')}
          </Button>
          {store.currentProject.swaggerJson && <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder={text("Search") + " REST…"}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
              onChange={(event: object): void => searchRest(event)}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>}
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>

          <ListItem button key={'Project'} onClick={(): void => route('project')} selected={store.subroute === 'project'}>
            <ListItemIcon><Build /></ListItemIcon>
            <ListItemText primary={text('Project')} />
          </ListItem>

          <ListItem button key={'Log'} onClick={(): void => route('log')} selected={store.subroute === 'log'}>
            <ListItemIcon><MailIcon /></ListItemIcon>
            <ListItemText primary={text('Log')} />
          </ListItem>

          <ListItem button key={'Swagger'} title="Also known as OpenAPI" onClick={(): void => route('swagger')} selected={store.subroute === 'swagger'}>
            <ListItemIcon><InboxIcon /></ListItemIcon>
            <ListItemText primary={'Swagger'} />
          </ListItem>

          <ListItem button key={'Routes'} onClick={(): void => route('routes')} selected={store.subroute === 'routes'}>
            <ListItemIcon><CallSplit /></ListItemIcon>
            <ListItemText primary={text('Routes')} />
          </ListItem>

        </List>
        <Divider />
        <List>

          <ListItem button key={'Files'} onClick={(): void => route('files')} selected={store.subroute === 'files'}>
            <ListItemIcon><CreateNewFolder /></ListItemIcon>
            <ListItemText primary={text('Files')} />
          </ListItem>

          {store.currentProject.swaggerJson && ownKeys(store.currentProject.swaggerJson.paths).map(pathKey => {
            const path = '' + pathKey.toString()
            const api = store.currentProject.apis[path] || {}

            return (
              <ListItem button key={path} title={path} onClick={(): void => route('rest', path)} selected={store.rest === path}>
                <ListItemIcon>{api.mock === false ? <FlipToBack /> : <FlipToFront />}</ListItemIcon>
                <ListItemText primary={path} />
              </ListItem>
            )
          })}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open
        })}
      >
        <div className={classes.drawerHeader} />
        <>
          {store.subroute === 'log' && <LogTab store={store} />}
          {store.subroute === 'project' && <ProjectTab store={store} />}
          {store.subroute === 'rest' && <RestTab key={store.rest} pattern={store.rest} project={store.currentProject} />}
          {store.subroute === 'routes' && <RoutesTab project={store.currentProject} />}
          {store.subroute === 'swagger' && <SwaggerTab project={store.currentProject} />}
          {store.subroute === 'files' && <FilesTab project={store.currentProject} />}
        </>
      </main>
    </div>
  )
})
