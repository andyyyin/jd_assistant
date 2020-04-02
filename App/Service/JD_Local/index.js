import api from '../Api';
import analysis from "./analysis"
import {loadJDData, saveJDData, checkAndPushNewRecords, getProductHistory} from "./storage"

const _productMap = {};
const jd = {};
let _storeData = null;

const loadProductIds = async () => {

  // await saveJDData({
  //   idConfig: {
  //     1284887: newConfig(),
  //     851672: newConfig(),
  //     744594: newConfig(),
  //     100004922092: newConfig(),
  //     844099: newConfig(),
  //     3649920: newConfig(),
  //     100003312839: newConfig(),
  //   }
  // })

  if (!_storeData) _storeData = await loadJDData()
  if (!_storeData) {
    _storeData = {idConfig: {}}
    await saveJDData(_storeData)
  }
  const {idConfig} = _storeData
  return Object.keys(idConfig).filter(id => idConfig[id].active)
}

const saveData = () => {
  return saveJDData(_storeData)
}

const getPromotion = promotionData => {
  if (!promotionData || !promotionData.prom || !promotionData.prom.pickOneTag) return null
  const promoList = promotionData.prom.pickOneTag
  if (!promoList.map && !promoList.length) return null
  return promoList.map(({content}) => ({content}))
}

const newConfig = () => {
  return {active: true, start: Date.now()}
}

const saveRecords = async () => {
  const time = Date.now()
  const list = Object.values(_productMap).map(product => {
    let pid = product.id
    let price = product.p_price || product.price
    let prom = product.promRank && product.promRank[0] && product.promRank[0].ratePrice
    if (!prom || prom === price) prom = null
    return {pid, price, prom, time}
  })
  return checkAndPushNewRecords(list)
}



jd.addProductId = async (id) => {
  if (await jd.loadProducts(id)) {
    _storeData.idConfig[id] = newConfig()
    await saveData()
  }
  return _productMap
}

jd.deleteProduct = async (id) => {
  _storeData.idConfig[id].active = false
  _storeData.idConfig[id].delete = Date.now()
  await saveData();
  delete _productMap[id]
  return _productMap
}

jd.getProduct = (id) => _productMap[id]

jd.loadProducts = async (id) => {

  const ids = id ?
    [id] :
    await loadProductIds()

  const product = await api.getProduct2(ids.join(','));
  if (id && !product[id]) {
    /* 未查询到商品 */
    return false
  }
  // console.log(product)
  const priceList = await api.getPrice(ids.join(','))
  // console.log(priceList)

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];

    const name = product[id].name;
    const imgUrl = `https://img10.360buyimg.com/evalpic/s240x240_${product[id].imagePath}`
    const color = product[id].color;

    const info = await api.getExtraInfo(id)
    // console.log(info)
    const cid = info.rank3
    const shop = info.seller
    const shopId = info.shopId

    const priceInfo = priceList.find(p => p.id === 'J_' + id)
    const originPrice = priceInfo.op
    const price = priceInfo.tpp || priceInfo.p
    const isDown = Number(price) < 0
    // todo priceInfo.m 是什么

    const {coupons} = await api.getTicket(id, cid)
    const tickets = []
    coupons.forEach(c => {
      const {quota, discount} = c
      let text = ' - 未知 - '
      if (quota && discount) {
        text = `满${c.quota}减${c.discount}`
      }
      if (!tickets.find(t => t.quota === quota && t.discount === discount)) {
        tickets.push({quota, discount, text})
      }
    })

    const promotionData = await api.getPromotion(id, cid)
    const promotions = getPromotion(promotionData)

    console.log(id + ' done')
    _productMap[id] = {id, name, imgUrl, color, cid, shop, shopId, price, originPrice,
      tickets, promotions, isDown}
  }
  analysis(_productMap)

  await saveRecords(_productMap)

  return _productMap
}

jd.loadHistory = getProductHistory

export default jd;
