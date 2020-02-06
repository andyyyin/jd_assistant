import {plusOrZero, toMoney, numberFix2} from "../Method"

const promReg = /每?满(\d+)元.*?减(\d+)[元%]/i


const fillMoneyOffs = (product) => {
  if (!product.promotions) return

  const price = Number(product.price)

  const moneyOffs = []
  product.promotions.forEach(({content}) => {
    let match = []
    while (content && (match = content.match(promReg)) && match[0]) {
      const text = match[0]
      const least = Number(match[1])
      const off = Number(match[2])
      const repeat = text.startsWith('每')
      const percent = text.endsWith('%')

      let productOff = 0;
      let supply = 0;

      if (least <= price && !repeat && !percent) {
        productOff = off;
      } else if (percent) {
        productOff = toMoney(price * off / 100)
        supply = plusOrZero(least - price)
      } else {
        productOff = toMoney(price * off / least)
        let realLeast = least > price ? least : price + (least - price % least)
        supply = realLeast - price
      }

      let ratePrice = numberFix2(price - productOff)
      moneyOffs.push({text, least, off, percent, repeat, productOff, supply, ratePrice})
      content = content.split(text)[1]
    }
  })

  product.moneyOffs = moneyOffs
}

const fillTickets = (product) => {
  const price = Number(product.price)

  if (product.tickets && product.tickets.length) {
    product.tickets = product.tickets.map(({quota, discount, text}) => {
      let productOff = 0
      let supply = 0
      if (quota <= price) {
        productOff = discount
      } else {
        productOff = toMoney(price * discount / quota)
        supply = quota - price
      }
      let ratePrice = numberFix2(price - productOff)
      return {quota, discount, text, productOff, supply, ratePrice}
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
      if (t.quota > least) least = t.quota
      let off = p.off + t.discount
      if (p.percent) off = least * p.off / 100 + t.discount
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
      let supply = least - price
      let productOff = toMoney(price * off / least)
      let ratePrice = numberFix2(price - productOff)
      combos.push({least, off, supply, productOff, ratePrice})
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
  const all = []
  if (moneyOffs && moneyOffs.length) all.push(...moneyOffs)
  if (tickets && tickets.length) all.push(...tickets)
  if (combos && combos.length) all.push(...combos)
  let rank = all.sort((a, b) => b.productOff - a.productOff)
  let deleteIndex
  while ((deleteIndex = rank.find((p, i) => i > 0 && p.supply >= rank[i - 1].supply))) {
    rank.splice(deleteIndex, 1)
  }
  product.promRank = rank
  let noSupply = rank.find(p => p.supply === 0)
  if (noSupply) product.p_price = noSupply.ratePrice
  console.log(product.promRank)
}


export default (_productMap) => {
  if (!_productMap) return
  const list = Object.values(_productMap)
  list.map(product => {
    fillMoneyOffs(product)
    fillTickets(product)
    fillCombos(product)
    fillRankAndPrice(product)
  })
}
