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



export const compareAndSaveProduct = (product) => {
  const {id, price, p_price, promRank} = data

}

export const getProductData = (id) => {
  return AsyncStorage.getItem(getProductDataKey(id))
}