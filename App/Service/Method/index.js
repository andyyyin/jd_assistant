
export const toMoney = (value) => {
  if (isNaN(value)) return null
  return Math.floor(value * 100) / 100
}

export const numberFix2 = (value) => {
  if (isNaN(value)) return null
  return Number(value).toFixed(2)
}

export const plusOrZero = (value) => value > 0 ? value : 0