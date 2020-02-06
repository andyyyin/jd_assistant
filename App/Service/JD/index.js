import api from '../Api';
import analysis from "./analysis"

const _productMap = {};
const jd = {};

jd.getProductIds = () => {
  // todo
  return [
    // 1284887,
    // 851672,
    744594,
    100004922092,
    844099
  ]
}

jd.getProduct = id => {
  return _productMap[id]
}

jd.loadProducts = async () => {

  const ids = jd.getProductIds()

  const product = await api.getProduct2(ids.join(','));
  // console.log(product)

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

    const priceList = await api.getPrice(id)
    // console.log(price)
    const priceInfo = priceList.find(p => p.id === 'J_' + id)
    const price = priceInfo.tpp || priceInfo.p
    const originPrice = priceInfo.op
    // todo priceInfo.m 是什么

    const {coupons} = await api.getTicket(id, cid)
    const tickets = coupons.map(c => {
      const {quota, discount} = c
      let text = ' - 未知 - '
      if (quota && discount) {
        text = `满${c.quota}减${c.discount}`
      }
      return {quota, discount, text}
    })

    const promotionData = await api.getPromotion(id, cid)
    const promotions = getPromotion(promotionData)

    console.log(id + ' done')
    _productMap[id] = {id, name, imgUrl, color, cid, shop, shopId, price, originPrice, tickets, promotions}
  }
  analysis(_productMap)
  return _productMap
};

const getPromotion = promotionData => {
  if (!promotionData || !promotionData.prom || !promotionData.prom.pickOneTag) return null
  const promoList = promotionData.prom.pickOneTag
  if (!promoList.map && !promoList.length) return null
  return promoList.map(({content}) => ({content}))
}



export default jd;
