import React, { useState } from 'react'
import { IApi, IProject } from '../store'
import { observer } from 'mobx-react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { observable } from 'mobx'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'
import { ownKeys } from '@/utils'
import TextField from '@material-ui/core/TextField'
import { SwaggerPathResponse } from '../utils/Swagger'

const useStyles = makeStyles((theme) => ({
  monospace: {
    fontFamily: 'Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, monospace, serif',
    minWidth: 500
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 220
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}))

class State {
  @observable overview = true
  @observable route: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get'
  @observable response = '*'
  @observable key = 0
}

export default observer((props: { pattern: string; project: IProject }) => {
  const { pattern, project } = props
  const swaggerJson = project.swaggerJson

  if (!swaggerJson) return <>No swagger loaded</>

  const rest = pattern.toString()
  const restUrl = (swaggerJson.basePath || '') + pattern.toString()

  const path = swaggerJson.paths[rest]
  let api: IApi = project.apis[rest]
  const [state] = useState(() => new State())
  const classes = useStyles()
  const responses = !state.overview ? ownKeys(path[state.route].responses) : []

  if (!api) {
    api = new IApi({} as IApi, swaggerJson.paths[rest], project.getSchemas())
    project.apis[rest] = api
  }

  const check = (api: IApi): void => {
    api.mock = !api.mock
    project.save()
  }

  const strongIf = (route: typeof state.route, text: string): React.ReactNode => {
    return (state.route === route) && !state.overview ? <strong>{text}</strong> : <>{text}</>
  }

  const strongIfTrue = (cond: boolean, text: string): React.ReactNode => {
    return cond ? <strong>{text}</strong> : <>{text}</>
  }

  const route = (route: typeof state.route): void => {
    state.response = '*'
    state.overview = false
    state.route = route
  }

  const responseEditor = (): React.ReactNode => {
    const responseJson = path[state.route].responses[state.response]
    const responseApi = api.methods[state.route].responses[state.response]
    const headers = responseJson.headers ? ownKeys(responseJson.headers) : []

    const getSchema = (response: SwaggerPathResponse): string => {
      if (response.schema) return response.schema.type || response.schema.$ref || ''
      if (response.content && response.content['application/json']) {
        const schema = response.content['application/json'].schema
        if (schema) {
          return schema.type || schema.$ref || ''
        }
      }
      return ''
    }

    const placeholder = getSchema(responseJson)
    const value = responseApi.value

    let validBody = true

    try {
      JSON.parse(responseApi.value)
    } catch (e) {
      validBody = false
    }

    const reset = (): void => {
      responseApi.resetValue(responseJson, project.getSchemas())
      project.save()
      state.key++
    }

    return <div key={state.response}>
      {responseJson.description && <div>Description: {responseJson.description}</div>}
      {headers.map(header => <TextField
        key={header}
        autoFocus
        margin="dense"
        id="name"
        label={'Cookie: ' + header + ' (' + responseJson.headers[header].type + '/' + responseJson.headers[header].format + ')'}
        type="text"
        fullWidth
        defaultValue={responseApi.headers[header].value}
        onChange={(event): void => {
          responseApi.headers[header].value = event.target.value.trim()
          project.save()
        }}
        error={responseApi.headers[header].value.trim() === ''}
      />)}
      {<TextField
        key={state.key}
        id="standard-multiline-static"
        label={'Body: ' + (placeholder || 'no schema provided')}
        multiline
        placeholder={placeholder || 'Any valid JSON'}
        defaultValue={value}
        className={classes.monospace}
        onChange={(event): void => {
          responseApi.value = event.target.value.trim()
          try {
            JSON.parse(responseApi.value)
            project.save()
          } catch (e) {
          }
        }}
        error={!validBody}
      />}
      {!placeholder && <div>Response has no schema</div>}
      <div>
        <Button onClick={reset} color="primary">Reset response body to the latest swagger schema</Button>
      </div>
    </div>
  }

  return <>
    <Typography paragraph>
      {restUrl}
    </Typography>

    <FormControlLabel
      control={<Checkbox checked={api.mock} onChange={(): void => check(api)} name="mock" />}
      label="Mock this API request"
    />

    <div>
      <Button onClick={(): void => { state.overview = true }} color="primary">{strongIfTrue(state.overview, 'OVERVIEW')}</Button>&nbsp;
      {path.get && <><Button onClick={(): void => route('get')} color="primary">{strongIf('get', 'GET')}</Button>&nbsp;</>}
      {path.post && <><Button onClick={(): void => route('post')} color="primary">{strongIf('post', 'POST')}</Button>&nbsp;</>}
      {path.put && <><Button onClick={(): void => route('put')} color="primary">{strongIf('put', 'PUT')}</Button>&nbsp;</>}
      {path.patch && <><Button onClick={(): void => route('patch')} color="primary">{strongIf('patch', 'PATCH')}</Button>&nbsp;</>}
      {path.delete && <><Button onClick={(): void => route('delete')} color="primary">{strongIf('delete', 'DELETE')}</Button>&nbsp;</>}
    </div>

    {state.overview && <div>Click on request method to setup cookies, data and test.</div>}
    {!state.overview && <div>
      <FormControl key='edit' className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Choose response to edit</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={state.response}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(event: any): void => {
            state.response = event.target.value.trim()
          }}
        >
          <MenuItem value={'*'}>Show all responses</MenuItem>
          {responses.map(response => <MenuItem key={response} value={response}>{response}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl key='mock' className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Response to mock on {state.route.toUpperCase()}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={api.methods[state.route].responseToMock}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(event: any): void => {
            api.methods[state.route].responseToMock = event.target.value.trim()
            project.save()
          }}
        >
          <MenuItem value={'*'}>200 or any available</MenuItem>
          {responses.map(response => response !== 'default' && <MenuItem key={response} value={response}>{response}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
    }

    {!state.overview && state.response === '*' && <div style={{ fontSize: '1rem', lineHeight: 1.5 }}>
      <pre key={state.route}>{JSON.stringify(path[state.route], null, ' ')}</pre>
    </div>}

    {state.overview && <div style={{ fontSize: '1rem', lineHeight: 1.5 }}>
      <pre key='overview'>{JSON.stringify(path, null, ' ')}</pre>
    </div>}

    {state.response !== '*' && !state.overview && responseEditor()}
  </>
})
