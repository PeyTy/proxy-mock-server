import { remote } from 'electron'
const { getCurrentWindow } = remote

// Focus lost fix
export default (messageText: string) => {
  alert(messageText)
  // getCurrentWindow().blurWebView()
  getCurrentWindow().blur()
  // getCurrentWindow().focusOnWebView()
  getCurrentWindow().focus()
}
