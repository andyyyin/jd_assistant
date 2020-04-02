import AsyncStorage from '@react-native-community/async-storage';

const DATA_NAME = 'JD_DATA'
const PRODUCT_DATA_PREV = 'JD_P_'

const getProductDataKey = id => PRODUCT_DATA_PREV + id

export const loadJDData = async () => {
  const data = await AsyncStorage.getItem(DATA_NAME)
  if (!data) return null
  return JSON.parse(data)
}

export const saveJDData = (data) => {
  if (typeof data === 'string') {
    return AsyncStorage.setItem(DATA_NAME, data)
  } else {
    return AsyncStorage.setItem(DATA_NAME, JSON.stringify(data))
  }
}

export const clearJDData = () => AsyncStorage.removeItem(DATA_NAME)



// const checkAndPushNewRecord = async (record) => {
//
//   const dataKey = getProductDataKey(record.pid + '')
//   let history = await AsyncStorage.getItem(dataKey)
//   if (!history) {
//     history = [record]
//   } else {
//     let last = history[history.length - 1]
//     if (!last || last.price !== record.price || last.prom !== record.prom) {
//       history.push(record)
//     }
//     if (history.length > 100) {
//       history.shift()
//     }
//   }
//   return AsyncStorage.setItem(dataKey, history)
// }


export const checkAndPushNewRecords = async (records) => {
  if (!records || !records.length) return null
  await Promise.all(records.map(async (record) => {
    const dataKey = getProductDataKey(record.pid + '')
    let history = await AsyncStorage.getItem(dataKey)
    if (!history) {
      history = [record]
    } else {
      history = JSON.parse(history)
      let last = history[history.length - 1]
      if (!last || last.price !== record.price || last.prom !== record.prom) {
        history.push(record)
      }
      if (history.length > 100) {
        history.shift()
      }
    }
    return AsyncStorage.setItem(dataKey, JSON.stringify(history))
  }))
}



export const getProductHistory = async (id) => {

  let rawData = await AsyncStorage.getItem(getProductDataKey(id))
  rawData = JSON.parse(rawData)
  const result = []
  rawData.forEach(({price, prom, time}, index) => {
    if (!prom) prom = price
    // const dateObj = new Date(parseInt(time))
    // const month = dateObj.getMonth() + 1
    // const day = dateObj.getDate()
    // const date = month + '.' + day
    const dayTime = new Date(new Date(parseInt(time)).setHours(0, 0, 0, 0)).getTime()

    const prev = result[result.length - 1]
    if (!prev || prev.dayTime !== dayTime) {
      result.push({price, prom, dayTime})
    } else {
      if (Number(price) < Number(prev.price)) prev.price = price
      if (Number(prom) < Number(prev.prom)) prev.prom = prom

      /* 如果一条数据是当天的最后一条，而它的值与当天最低值不相等，并且下一条数据不是第二天的
      * 那么就造一条第二天的数据，值等于当前数据，防止第二天的数据被当天的最低数据覆盖 */

      const nextData = rawData[index + 1]
      const targetDayTime = dayTime + (1000 * 60 * 60 * 24 * 2)
      const nextDayTime = dayTime + (1000 * 60 * 60 * 24)

      const isToday = Date.now() < nextDayTime
      const hasDataBeforeTarget = nextData && parseInt(nextData.time) < targetDayTime

      if (!isToday && !hasDataBeforeTarget && (prev.price !== price || prev.prom !== prom)) {
        result.push({price, prom, dayTime: nextDayTime})
      }
    }
  })
  return result
}