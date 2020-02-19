import AsyncStorage from "@react-native-community/async-storage"

const LOG_DATA_NAME = 'bg_local_log'
const MAX_LENGTH = 200

export const bgLocalLog = async (logText) => {
  let data = await AsyncStorage.getItem(LOG_DATA_NAME)
  if (!data) {
    data = []
  } else {
    data = JSON.parse(data)
  }
  data.push({time: Date.now(), log: logText || ''})
  if (data.length > MAX_LENGTH) {
    data.shift()
  }
  await AsyncStorage.setItem(LOG_DATA_NAME, JSON.stringify(data))
}

export const loadLocalLog = async () => {
  let dataStr = await AsyncStorage.getItem(LOG_DATA_NAME)
  return JSON.parse(dataStr)
}