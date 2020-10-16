import React from 'react'
import { observer } from 'mobx-react'
import { Store } from '../store'
import Button from '@material-ui/core/Button'
import { LogRecord } from '../server/ServerFactory'

export default observer((props: { store: Store }) => {
  const { store } = props
  const uuid = store.currentProject.uuid
  const records = store.serverFactory.logs.get(uuid)

  const clear = (): void => {
    if (records) records.length = 0
  }

  return <>
    <Button variant="contained" color="primary" onClick={clear}>Clear log</Button>
    <div style={{ fontSize: '1rem', lineHeight: 1.5 }}>
      {records && records.map((record: LogRecord, i) => <div key={record.url + i}><strong>{record.meta}</strong> {record.url}</div>)}
    </div>
  </>
})
