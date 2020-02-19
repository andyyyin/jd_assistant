import {Clipboard} from "react-native"

export const copyText = (str) => {
  if (typeof str !== 'string') {
    alert('copy param not string')
    return
  }
  Clipboard.setString(str+'')
  alert('copy: '+ str)
}