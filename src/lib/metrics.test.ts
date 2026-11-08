import { describe, expect, it } from 'vitest'
import { annualize, crossChainSpread, median, ratioToPct, taxAdjusted } from './metrics'

describe('on-chain metric helpers', () => {
  it('normalises index growth to a daily percentage', () => {
    expect(ratioToPct(110, 100)).toBeCloseTo(10)
    expect(ratioToPct(100, 0)).toBeNull()
  })

  it('calculates simple and compound annualisation from a daily percentage', () => {
    const annual = annualize(0.1)
    expect(annual.simple).toBeCloseTo(36.5)
    expect(annual.compound).toBeCloseTo(44.027, 2)
  })

  it('calculates a median without mutating the input', () => {
    const input = [9, 1, 5, 3]
    expect(median(input)).toBe(4)
    expect(input).toEqual([9, 1, 5, 3])
    expect(median([])).toBeNull()
  })

  it('keeps taxes and cross-chain spread explicit', () => {
    expect(taxAdjusted(0.2, 5)).toBeCloseTo(0.19)
    expect(crossChainSpread(0.1, 0.2)).toBeCloseTo(2)
    expect(crossChainSpread(0, 0.2)).toBeNull()
  })
})
