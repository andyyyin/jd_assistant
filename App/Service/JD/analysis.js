import {plusOrZero, toMoney, numberFix2} from "../Method"

// const promReg = /每?满(\d+)元.*?减(\d+)[元%]/i
const promReg = /每?满([\d\.]+)([元件]).*?[减打]([\d\.]+)([元%折])/i


const fillMoneyOffs = (product) => {
  if (!product.promotions) return

  const price = Number(product.price)

  const moneyOffs = []
  product.promotions.forEach(({content}) => {
    let match = []
    while (content && (match = content.match(promReg)) && match[0]) {
      const text = match[0]
      const least = Number(match[1])
      const unit1 = match[2]
      const off = Number(match[3])
      const unit2 = match[4]

      const isCount = unit1 === '件'
      const repeat = text.startsWith('每')
      const percent = unit2 === '%'
      const isDaZhe = unit2 === '折'

      let productOff = 0;
      let supply = 0;

      if (least <= price && !repeat && !percent && !isDaZhe) {
        productOff = off;
      } else if (percent || isDaZhe) {
        const percentRate = isDaZhe ? ((10 - off) / 10) : (off / 100)
        productOff = toMoney(price * percentRate)
        supply = plusOrZero(least - price)
      } else {
        productOff = toMoney(price * off / least)
        let realLeast = least > price ? least : price + (least - price % least)
        supply = plusOrZero(realLeast - price)
      }

      if (isCount) supply = least - 1

      let ratePrice = numberFix2(price - productOff)
      moneyOffs.push({text, least, off, percent, repeat, isCount, isDaZhe, productOff, supply, ratePrice})
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
  console.log(rank)
  while ((deleteIndex = rank.findIndex((p, i) => i > 0 && p.supply >= rank[i - 1].supply)) && deleteIndex > 0) {
    rank.splice(deleteIndex, 1)
  }
  product.promRank = rank
  let noSupply = rank.find(p => p.supply === 0)
  if (noSupply) product.p_price = noSupply.ratePrice
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
