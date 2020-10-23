import { remote } from 'electron'
const { getCurrentWindow } = remote

// Focus lost fix
export default (messageText: string): boolean => {
  const result = confirm(messageText)
  getCurrentWindow().blur()
  getCurrentWindow().focus()
  return result
}
