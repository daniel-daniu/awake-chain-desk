export const ratioToPct = (current: number, previous: number) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null
  return (current / previous - 1) * 100
}

export const annualize = (dailyPct: number | null) => {
  if (dailyPct === null || !Number.isFinite(dailyPct)) {
    return { simple: null, compound: null }
  }
  const daily = dailyPct / 100
  return {
    simple: daily * 365 * 100,
    compound: (Math.pow(1 + daily, 365) - 1) * 100,
  }
}

export const median = (values: number[]) => {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!valid.length) return null
  const middle = Math.floor(valid.length / 2)
  return valid.length % 2
    ? valid[middle]
    : (valid[middle - 1] + valid[middle]) / 2
}

export const taxAdjusted = (price: number | null, sellTaxPct: number | null) => {
  if (price === null || sellTaxPct === null) return null
  return price * (1 - sellTaxPct / 100)
}

export const crossChainSpread = (anubis: number | null, polygon: number | null) => {
  if (anubis === null || polygon === null || anubis <= 0) return null
  return polygon / anubis
}
