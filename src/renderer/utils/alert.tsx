import { remote } from 'electron'
const { getCurrentWindow } = remote

// Focus lost fix
export default (messageText: string) => {
  alert(messageText)
  getCurrentWindow().blur()
  getCurrentWindow().focus()
}
