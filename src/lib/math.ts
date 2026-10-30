import type { RiskData, RiskFactor } from '../types'

const scoreBand = (value: number, bands: [number, number][]): number => {
  for (const [threshold, score] of bands) {
    if (value < threshold) return score
  }
  return 100
}

export interface RiskInput {
  anubisPrice: number
  polygonPrice: number | null
  crossChainSpread: number | null
  top1Share: number
  liquidityUsd: number
  marketCap: number
  treasuryDai: number | null
  treasuryConfirmed: boolean
  totalSupply: number
  observedApyHigh: number | null
}

export function computeRisk(input: RiskInput): RiskData {
  const spread = input.crossChainSpread
  const spreadScore =
    spread === null
      ? 50
      : scoreBand(spread, [
          [1.2, 0],
          [2, 40],
          [3, 70],
          [Infinity, 100],
        ])

  let treasuryCoverage: number | null = null
  if (input.treasuryDai && input.marketCap > 0) {
    treasuryCoverage = input.treasuryDai / input.marketCap
  }
  const treasuryScore =
    treasuryCoverage === null
      ? 60
      : scoreBand(treasuryCoverage * 100, [
          [20, 100],
          [50, 70],
          [100, 40],
          [Infinity, 0],
        ])

  const concentrationScore = scoreBand(input.top1Share * 100, [
    [30, 0],
    [50, 40],
    [70, 70],
    [Infinity, 100],
  ])

  const depth = input.marketCap > 0 ? input.liquidityUsd / input.marketCap : 0
  const liquidityScore = scoreBand(depth * 100, [
    [0.2, 100],
    [1, 70],
    [5, 40],
    [Infinity, 0],
  ])

  const emissionsScore =
    input.observedApyHigh === null
      ? 50
      : scoreBand(input.observedApyHigh * 100, [
          [5, 20],
          [15, 40],
          [50, 70],
          [Infinity, 90],
        ])

  const factors: RiskFactor[] = [
    {
      key: 'crosschain',
      label: { zh: '跨链价差', en: 'Cross-chain spread' },
      value: spread === null ? 'N/A' : `${spread.toFixed(2)}×`,
      raw: spread,
      score: spreadScore,
      weight: 25,
      status: spread === null ? 'unknown' : spreadScore >= 70 ? 'danger' : spreadScore >= 40 ? 'warn' : 'ok',
      detail: {
        zh: '同一符号 LGNS 在 Anubis 与 Polygon 两条链上、两个不同合约的链上池价格之比。价差越大，说明两条链之间的流动性与兑付通道越不透明。',
        en: 'Ratio between the on-chain pool prices of LGNS on Anubis and Polygon — same symbol, different contracts. A wider gap means less transparent liquidity and redemption routes between the two chains.',
      },
      source: 'RocketSwap / QuickSwap pair reserves',
    },
    {
      key: 'treasury',
      label: { zh: '可验证资金覆盖率', en: 'Verifiable reserve coverage' },
      value: treasuryCoverage === null ? 'N/A' : `${(treasuryCoverage * 100).toFixed(1)}%`,
      raw: treasuryCoverage,
      score: treasuryScore,
      weight: 20,
      status: treasuryCoverage === null ? 'unknown' : treasuryScore >= 70 ? 'danger' : treasuryScore >= 40 ? 'warn' : 'ok',
      detail: {
        zh: input.treasuryConfirmed
          ? '已确认资金地址的 DAI 余额 / 当前市值。'
          : '没有官方标注的资金地址。若把持有 7,841 万 DAI 的未标注合约视作资金池，覆盖率约三成，仅作上界参考。',
        en: input.treasuryConfirmed
          ? 'Confirmed reserve address DAI balance over current market cap.'
          : 'No labeled reserve address. If the unlabeled contract holding 78.41M DAI is treated as the reserve, coverage is roughly one third — an upper-bound reference only.',
      },
      source: 'Blockscout address balances',
    },
    {
      key: 'concentration',
      label: { zh: '持仓集中度', en: 'Holder concentration' },
      value: `${(input.top1Share * 100).toFixed(1)}%`,
      raw: input.top1Share,
      score: concentrationScore,
      weight: 25,
      status: concentrationScore >= 70 ? 'danger' : concentrationScore >= 40 ? 'warn' : 'ok',
      detail: {
        zh: '第一大地址持仓占比。当前第一大地址为可升级、未开源的代理合约，单独控制近八成供应。',
        en: 'Largest holder share. The top address is an upgradeable, unverified proxy controlling nearly 80% of supply.',
      },
      source: 'Blockscout token holders',
    },
    {
      key: 'liquidity',
      label: { zh: '流动性深度', en: 'Liquidity depth' },
      value: `${(depth * 100).toFixed(2)}%`,
      raw: depth,
      score: liquidityScore,
      weight: 15,
      status: liquidityScore >= 70 ? 'danger' : liquidityScore >= 40 ? 'warn' : 'ok',
      detail: {
        zh: 'Anubis 主池 DAI 储备 / 当前市值。比例越高，单位卖压对价格冲击越小。',
        en: 'Anubis primary pool DAI reserves over market cap. Higher means less price impact per unit of sell pressure.',
      },
      source: 'RocketSwap pair reserves',
    },
    {
      key: 'emissions',
      label: { zh: '利息参数可读性', en: 'Interest parameter readability' },
      value: 'N/A',
      raw: input.observedApyHigh,
      score: emissionsScore,
      weight: 15,
      status: input.observedApyHigh === null ? 'unknown' : emissionsScore >= 70 ? 'danger' : emissionsScore >= 40 ? 'warn' : 'ok',
      detail: {
        zh: '质押合约未开源，利率、复投与解锁参数不可读。claimInterest 只能看到单笔转账，样本窗口很短，无法据此推算年化。',
        en: 'The staking contract is unverified; rate, compounding and unlock parameters cannot be read. claimInterest only shows individual transfers, and the sample window is too short for an annualized estimate.',
      },
      source: 'claimInterest transfer sample',
    },
  ]

  const score = factors.reduce((acc, f) => acc + f.score * (f.weight / 100), 0)
  const hardRule = spread !== null && spread > 3 && input.top1Share > 0.5
  const level: RiskData['level'] =
    hardRule || score >= 75 ? 'extreme' : score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low'

  const confidence = factors.filter((f) => f.raw !== null).reduce((acc, f) => acc + f.weight, 0) / 100
  const base = input.anubisPrice

  return {
    score: Math.round(score * 10) / 10,
    level,
    confidence,
    factors,
    scenarios: [
      {
        key: 'down-50',
        label: { zh: 'Anubis 价格续跌 50%', en: 'Anubis price falls another 50%' },
        price: base * 0.5,
        note: {
          zh: '流动性深度不足时，集中卖出的价格冲击会被放大。',
          en: 'With thin depth, concentrated selling amplifies price impact.',
        },
      },
      {
        key: 'hold',
        label: { zh: '维持当前链上价格', en: 'Hold current on-chain price' },
        price: base,
        note: {
          zh: '价格横盘时，名义价值取决于利息发放速度与代币增发。',
          en: 'If price is flat, nominal value depends on payout speed and token emissions.',
        },
      },
      {
        key: 'up-50',
        label: { zh: 'Anubis 价格反弹 50%', en: 'Anubis price rebounds 50%' },
        price: base * 1.5,
        note: {
          zh: '仅作名义价值换算；跨链价差是否收敛取决于桥与兑付通道。',
          en: 'Nominal conversion only; whether the cross-chain gap converges depends on bridges and redemption routes.',
        },
      },
    ],
    ts: new Date().toISOString(),
  }
}
