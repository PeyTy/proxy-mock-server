import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
ReactDOM.render(<App />, document.getElementById('root'))
