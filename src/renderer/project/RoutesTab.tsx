import React from 'react'
import { IProject, IRoute } from '../store'
import TextField from '@material-ui/core/TextField'
import { observer } from 'mobx-react'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default observer((props: { project: IProject }) => {
  const { project } = props

  const isValid = (regular: string): boolean => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const reg = new RegExp(regular)
    } catch (e) {
      return false
    }
    if (regular.trim() === '') return false
    return true
  }

  const isValidReplace = (pattern: string): boolean => {
    return pattern.trim() !== ''
  }

  const handleChangeInput = (route: IRoute, regular: string): void => {
    route.input = regular
    if (isValid(regular)) {
      project.save()
    }
  }

  const handleChangeReplace = (route: IRoute, regular: string): void => {
    route.replace = regular
    if (isValidReplace(regular)) {
      project.save()
    }
  }

  const handleChangeDemo = (route: IRoute, regular: string): void => {
    route.demo = regular
    project.save()
  }

  const handleChangeEnabled = (route: IRoute): void => {
    route.enabled = !route.enabled
    project.save()
  }

  const removeRoute = (route: IRoute): void => {
    const index = project.routes.findIndex(find => route.uuid === find.uuid)
    project.routes.splice(index, 1)
    project.save()
  }

  const testDemo = (route: IRoute): string => {
    try {
      return route.demo.replace(new RegExp(route.input), route.replace)
    } catch (e) {
    }
    return ''
  }

  const addRoute = (): void => {
    project.routes.push(new IRoute({
      input: '^/rest/v([0-9]+)/',
      replace: '/rest/v$1/',
      demo: '/rest/v256/'
    } as IRoute))
  }

  return <>
    {project.routes.map((route) => {
      const enabled = route.enabled !== false

      return <div key={route.uuid}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Input route global regular expression"
          type="text"
          fullWidth
          defaultValue={route.input}
          onChange={(event): void => handleChangeInput(route, event.target.value.trim())}
          error={!isValid(route.input)}
          disabled={!enabled}
        />
        {enabled && <TextField
          margin="dense"
          id="name"
          label="Replacing pattern"
          type="text"
          fullWidth
          defaultValue={route.replace}
          onChange={(event): void => handleChangeReplace(route, event.target.value.trim())}
          error={!isValidReplace(route.replace)}
        />}
        {enabled && <TextField
          margin="dense"
          id="name"
          label="Testing url"
          type="text"
          fullWidth
          defaultValue={route.demo}
          onChange={(event): void => handleChangeDemo(route, event.target.value.trim())}
          error={false}
        />}
        {enabled && <TextField
          margin="dense"
          id="name"
          label="Resulting url"
          type="text"
          fullWidth
          disabled
          value={testDemo(route)}
          onChange={(): void => {
            // Nothing
          }}
          error={false}
        />}
        <div>
          <FormControlLabel
            control={<Checkbox checked={enabled} onChange={(): void => handleChangeEnabled(route)} name="enabled" />}
            label="Enable"
          />
          <Button variant="contained" color="primary" onClick={(): void => removeRoute(route)}>Remove route</Button>
        </div>
        <hr></hr>
      </div>
    })}
    <div>
      <Button variant="contained" color="primary" onClick={addRoute}>Add route</Button>
    </div>
  </>
})
