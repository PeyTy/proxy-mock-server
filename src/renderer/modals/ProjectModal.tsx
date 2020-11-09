import { observer } from 'mobx-react'
import TextField from '@material-ui/core/TextField'
import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import * as fs from 'fs'
import { remote } from 'electron'
import { Store } from '../store'

const { dialog } = remote

export const ProjectModal = observer((props: { store: Store }) => {
  const handleClose = (): void => {
    props.store.newProjectModal = false
    props.store.newProjectTitle = ''
    props.store.newProjectStorage = ''
  }

  const handleSave = (): void => {
    props.store.createProject(props.store.newProjectTitle, props.store.newProjectStorage)
    handleClose()
  }

  const isValid = (title: string = props.store.newProjectTitle): boolean => {
    const titled = title.trim()
    if (props.store.existsProject(titled)) return false
    if (titled === '') return false
    return true
  }

  const isValidStorage = (path: string = props.store.newProjectStorage): boolean => {
    return path === '' || fs.existsSync(path)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any): void => {
    props.store.newProjectTitle = event.target.value
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangeStorage = (event: any): void => {
    props.store.newProjectStorage = event.target.value.trim()
  }

  const selectFolder = (): void => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(files => {
      if (files.canceled === false) {
        const file = files.filePaths[0]
        props.store.newProjectStorage = file
      }
    })
  }

  return (
    <div>
      {false && <Button variant="outlined" color="primary" onClick={handleClose}>
        Open form dialog
      </Button>}
      <Dialog open={props.store.newProjectModal} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is just a human-readable project title.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project title"
            type="text"
            fullWidth
            value={props.store.newProjectTitle}
            onChange={handleChange}
            error={!isValid()}
          />
          <TextField
            margin="dense"
            id="name"
            label="Project storage folder full path (optional)"
            type="text"
            fullWidth
            value={props.store.newProjectStorage}
            onChange={handleChangeStorage}
            error={!isValidStorage()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={selectFolder} color="primary">
            Select Folder
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          {isValid() && isValidStorage() && <Button onClick={handleSave} color="primary">
            Save
          </Button>}
        </DialogActions>
      </Dialog>
    </div>
  )
})
