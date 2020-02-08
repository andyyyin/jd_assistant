import api from '../Api';
import analysis from "./analysis"
import {loadJDData, saveJDData} from "./storage"

const _productMap = {};
const jd = {};
let _storeData = null;

const loadProductIds = async () => {

  // await saveJDData({
  //   idList: [
  //     1284887,
  //     851672,
  //     744594,
  //     100004922092,
  //     844099,
  //     3649920,
  //   ]
  // })

  if (!_storeData) _storeData = await loadJDData()
  if (!_storeData) await saveJDData({idList: []})
  return _storeData.idList
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

jd.addProductId = async (id) => {
  _storeData.idList.push(id)
  await saveData()
  // todo 同步
}

jd.getProduct = (id) => _productMap[id]

jd.loadProducts = async () => {

  const ids = await loadProductIds()

  const product = await api.getProduct2(ids.join(','));
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
  return _productMap
}



export default jd;
