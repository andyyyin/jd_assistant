import axios from 'axios';
import {JD_AREA} from '../Constant'

const api = {};

// api.getProduct = async id => {
//   const cat = encodeURIComponent('6196,6214,14222');
//   const url = `
//     https://c.3.cn/recommend
//     ?methods=accessories
//     &sku=${id}
//     &cat=${cat}
//   `.replace(/\s+/g, "");
//   console.log(url)
//   const result = await axios.get(url);
//   console.log(result)
//   if (result && result.data) {
//     return result.data
//   } else {
//     return null; // todo
//   }
// };

api.getProduct2 = async id => {
  const url = `
    https://yx.3.cn/service/info.action
    ?ids=${id}
  `.replace(/\s+/g, "");
  const result = await axios({
    method: 'get',
    url,
    headers: {
      'Accept': '*/*'
    }
  });
  if (result.status !== 200) {
    console.log(`%c ${id} product ${result.status}`, `color: red`)
  }
  return result.data
}

api.getExtraInfo = async id => {
  const url = `
    https://chat1.jd.com/api/checkChat
    ?callback=checkChatStatuCbA
    &pid=${id}
  `.replace(/\s+/g, "");
  const result = await axios({
    method: 'get',
    url,
    headers: {
      'referer': `https://item.m.jd.com/product/${id}.html`,
    }
  })
  if (result.status !== 200) {
    console.log(`%c ${id} info ${result.status}`, `color: red`)
  }
  const {data} = result
  if (!data || typeof data !== 'string') return data
  return JSON.parse(data.substring(0, data.length - 2).substring(18));
}

api.getPrice = async ids => {
  let idParam;
  if (typeof ids === 'object' && ids.join) {
    idParam = ids.join(',')
  } else {
    idParam = ids;
  }
  const url = `
    https://pe.3.cn/prices/mgets
    ?source=wxsq
    &skuids=${idParam}
  `.replace(/\s+/g, "");
  const result = await axios.get(url);
  if (result.status !== 200) {
    console.log(`%c ${id} price ${result.status}`, `color: red`)
  }
  return result.data
}

api.getTicket = async (id, cid, price) => {
  const url = `
    https://wq.jd.com/bases/couponsoa/avlCoupon
    ?cid=${cid}
    &popId=8888
    &sku=${id}
    ${price ? '&price=' + price : ''}
    &platform=4
  `.replace(/\s+/g, "");
  const result = await axios({
    url,
    method: 'get',
    headers: {
      'referer': `https://item.m.jd.com/product/${id}.html`,
      'cookie': 'pin=jd_7176c6272104f'
    }
  });
  if (result.status !== 200) {
    console.log(`%c ${id} ticket ${result.status}`, `color: red`)
  }
  return result.data
}

api.getPromotion = async (id, cid) => {
  const cat = encodeURIComponent('8888,8888,' + cid);
  const url = `
    https://cd.jd.com/promotion/v2
    ?skuId=${id}
    &area=${JD_AREA}
    &cat=${cat}
  `.replace(/\s+/g, "");

  const result = await axios({
    url,
    method: 'get',
  });
  if (result.status !== 200) {
    console.log(`%c ${id} promotion ${result.status}`, `color: red`)
  }
  return result.data
}


export default api;
