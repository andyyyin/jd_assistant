import {plusOrZero, toMoney, numberFix2} from "../Function"

// const promReg = /每?满(\d+)元.*?减(\d+)[元%]/i
const promReg = /每?满([\d\.]+)([元件]).*?[减打]([\d\.]+)([元%折])/i


const fillMoneyOffs = (product) => {
  if (!product.promotions) return

  const price = Number(product.price)

  const moneyOffs = []
  product.promotions.forEach(({content}) => {
    let match = []
    while (content && (match = content.match(promReg)) && match[0]) {
      const unit1 = match[2]
      const unit2 = match[4]
      const text = match[0]
      const params = {
        price,
        text,
        least: Number(match[1]),
        off: Number(match[3]),
        isCount: unit1 === '件',
        repeat: text.startsWith('每'),
        percent: unit2 === '%',
        isDaZhe: unit2 === '折'
      }
      moneyOffs.push(buildMoneyOff(params))
      // repeat情况可能需产生两条money off，在此追加一条
      if (params.repeat && params.least < price) {
        params.repeat = false
        params.least = price - (price % params.least)
        moneyOffs.push(buildMoneyOff(params))
      }
      content = content.split(params.text)[1]
    }
  })

  product.moneyOffs = moneyOffs
}

const buildMoneyOff = (params) => {
  const {price, text, least, off, isCount, repeat, percent, isDaZhe} = params

  let productOff = 0;
  let supply = 0;
  let pureOff = 0;

  if (least <= price && !repeat && !percent && !isDaZhe) {
    productOff = off;

    // pure off add
    if (!isCount || least === 1) {
      pureOff = off;
    }
  } else if (percent || isDaZhe) {
    const percentRate = isDaZhe ? ((10 - off) / 10) : (off / 100)
    productOff = toMoney(price * percentRate)
    supply = plusOrZero(least - price)

    // pure off add
    if (isCount && least === 1) {
      pureOff = productOff
    } else if (!isCount) {
      let realOff = least * percentRate
      pureOff = plusOrZero(realOff - supply)
    }
  } else {
    productOff = toMoney(price * off / least)
    let realLeast = least > price ? least : price + (least - price % least)
    supply = plusOrZero(realLeast - price)

    // pure off add
    if (!isCount) {
      let realOff = repeat ? off * (realLeast / least) : off
      pureOff = plusOrZero(realOff - supply)
    }
  }

  if (isCount) {
    supply = least - 1
  }

  let ratePrice = numberFix2(price - productOff)
  return {text, least, off, percent, repeat, isCount, isDaZhe, productOff, supply, ratePrice, pureOff}
}

const fillTickets = (product) => {
  const price = Number(product.price)

  if (product.tickets && product.tickets.length) {
    product.tickets = product.tickets.map(({quota, discount, text}) => {
      let productOff = 0
      let supply = 0
      let pureOff = 0
      if (quota <= price) {
        productOff = discount
        pureOff = discount
      } else {
        productOff = toMoney(price * discount / quota)
        supply = quota - price
        if (supply < discount) {
          pureOff = discount - supply
        }
      }
      let ratePrice = numberFix2(price - productOff)
      return {quota, discount, text, productOff, supply, ratePrice, pureOff}
    })
  }
}

const fillCombos = (product) => {
  const {moneyOffs, tickets} = product
  if (!moneyOffs || !moneyOffs.length || !tickets || !tickets.length) return

  const price = Number(product.price)

  let combos = []
  moneyOffs.forEach(p => {
    tickets.forEach(t => {
      let least = p.least
      if (p.isCount) least = price
      if (t.quota > least) least = t.quota
      let off = p.off + t.discount
      if (p.percent) off = (least > price ? least : price) * p.off / 100 + t.discount
      if (p.repeat) {
        let repeatCountRaw = least / p.least
        off = p.off * Math.floor(repeatCountRaw) + t.discount
        if (repeatCountRaw % 1 > 0) {
          let least2 = p.least * Math.ceil(repeatCountRaw)
          let off2 = p.off * Math.ceil(repeatCountRaw) + t.discount
          if (off2 / least2 > off / least) {
            off = off2
            least = least2
          }
        }
      }
      let supply = plusOrZero(least - price)
      let productOff = toMoney(price * off / least)
      let ratePrice = numberFix2(price - productOff)

      // pure off add
      let pureOff = 0
      if (!p.isCount || (p.isCount && p.least === 1)) {
        pureOff = plusOrZero(off - supply)
      }
      combos.push({least, off, supply, productOff, ratePrice, pureOff})
    })
  })
  if (combos.length > 1) {
    product.combos = combos.filter(c => !combos.find(c2 => c2.productOff > c.productOff && c2.supply < c.supply))
  } else {
    product.combos = combos
  }
}

const fillRankAndPrice = (product) => {
  const {moneyOffs, tickets, combos} = product

  const price = Number(product.price)

  const all = []
  if (moneyOffs && moneyOffs.length) all.push(...moneyOffs)
  if (tickets && tickets.length) all.push(...tickets)
  if (combos && combos.length) all.push(...combos)
  let rank = all.sort((a, b) => b.productOff - a.productOff)
  let deleteIndex
  while ((deleteIndex = rank.findIndex((p, i) => i > 0 && p.supply >= rank[i - 1].supply)) && deleteIndex > 0) {
    rank.splice(deleteIndex, 1)
  }
  product.promRank = rank
  // let noSupply = rank.find(p => p.supply === 0)
  // if (noSupply) product.p_price = noSupply.ratePrice
  all.forEach(p => {
    if (!p.pureOff) return
    let p_price = price - p.pureOff
    if (p_price < (product.p_price || price)) product.p_price = p_price
  })
  if (product.p_price) product.p_price = numberFix2(product.p_price)
  console.log(product)
}


export default (_productMap) => {
  if (!_productMap) return
  const list = Object.values(_productMap)
  list.filter(p => !p.analyzed).map(product => {
    fillMoneyOffs(product)
    fillTickets(product)
    fillCombos(product)
    fillRankAndPrice(product)
    product.analyzed = true
  })
}
