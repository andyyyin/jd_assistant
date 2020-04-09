import {Clipboard} from "react-native"

export const copyText = (str) => {
  if (typeof str !== 'string') {
    alert('content is not string')
    return
  }
  Clipboard.setString(str+'')
  alert('copy: '+ str)
}

export const checkClipboardForPid = async () => {
  const str = await Clipboard.getString()
  if (!str) return
  const match = str.match(/https:\/\/item.m.jd.com\/product\/(\d+)\.html/i)
  return match && match[1]
}