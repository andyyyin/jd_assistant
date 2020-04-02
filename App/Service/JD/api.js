import axios from 'axios';
import {API_ROOT} from "../../info"

const available = !!API_ROOT

const waitTime = (time) => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

const jdRequest = async ({url, method, params}) => {
  const headers = {}
  try {
    const response = await axios({
      url: API_ROOT + url,
      headers,
      method,
      data: params
    })
    return response.data
  } catch (e) {
    if (e.response && e.response.data && e.response.data === 'pending') {
      await waitTime(2000)
      console.log('retry') // todo
      return jdRequest({url, method, params})
    } else {
      alert(e.message)
    }
  }
}

const getJD = (url) => {
  // const {data} = await axios.get(API_ROOT + url)
  const method = 'get'
  return jdRequest({url, method})
}
const postJD = (url, params) => {
  // const {data} = await axios.post(API_ROOT + url, params)
  const method = 'post'
  return jdRequest({url, method, params})
}

const getProductMap = async () => {
  return getJD('/')
}

const addProductId = (pid) => {
  return postJD('/add', {pid})
}

const deleteProduct = (pid) => {
  return postJD('/delete', {pid})
}

const loadHistory = (pid) => {
  return getJD(`/${pid}/history`)
}

export default {
  getProductMap,
  addProductId,
  deleteProduct,
  loadHistory,
  available,
}