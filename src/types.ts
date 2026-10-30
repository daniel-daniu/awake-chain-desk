export type Lang = 'zh' | 'en'

export interface SourceRef {
  name: string
  url?: string
  ts?: string
}

export interface Envelope<T> {
  ok: boolean
  data: T
  ts: string
  stale?: boolean
  sources?: SourceRef[]
  error?: string
}

export interface AnubisStats {
  chainId: number
  blockNumber: number
  blockTime: number
  totalAddresses: number
  totalTransactions: number
  txToday: number
  gas: { slow: number; average: number; fast: number }
  utilization: number
  nativePrice: number
  blocksPerDay?: number
  blockReward?: number | null
  avgBlockFee?: number | null
  dailyFee?: number | null
  feeSample?: number
}

export interface PolygonStats {
  chainId: number
  blockNumber: number
  gasPriceGwei: number
  blockTime?: number
  blocksPerDay?: number
  simpleTransferFee?: number | null
}

export interface EcosystemToken {
  key: string
  address: string
  name: string
  symbol: string
  type: string
  supply: number
  holders: number
  transfers: number
  topHolder: string
  topHolderShare: number
  latestTransfer: string | null
  in24h: number
  sample: number
  verified: boolean
  proxy: string | null
}

export interface EcosystemData {
  ailgns: EcosystemToken
  hpnft: EcosystemToken
  helixPower: EcosystemToken
  lgnsBurn: { dead: number; supply: number; pct: number }
  ts: string
}

export interface YieldPair {
  price: number
  liquidity: number
  reserveToken: number
}

export interface YieldTax {
  feeRatio: number
  buyRatio: number
  precision: number
  taxPct: number
  buyTaxPct: number
}

export interface YieldData {
  prices: { anubis: YieldPair; polygon: YieldPair; glgns: YieldPair }
  taxes: { anubis: YieldTax; polygon: YieldTax; glgns: YieldTax }
  interest: {
    index: { now: number; dayAgo: number; dailyPct: number; annualSimplePct: number; annualCompoundPct: number }
    anubisSupply: { now: number; dayAgo: number; delta: number; dailyPct: number; annualSimplePct: number }
    polygonSupply: { now: number; dayAgo: number; delta: number; dailyPct: number; annualSimplePct: number }
    slgnsSupply: {
      now: number
      dayAgo: number
      delta: number
      dailyPct: number
      annualSimplePct: number
      annualCompoundPct: number
    }
    polygonIndex: { now: number; dayAgo: number; dailyPct: number }
  }
  gas: {
    anubis: { gwei: number; simpleFee: number; contractFee: number }
    polygon: { gwei: number; simpleFee: number; contractFee: number }
  }
  ts: string
}

export interface StakingFlow {
  sampled: number
  claims: number
  claimShare: number
  medianClaim: number
  avgClaim: number
  trimmedMeanClaim?: number
  maxClaim: number
  spanSec: number
  ts: string
}

export interface ChainPrice {
  chain: 'anubis' | 'polygon'
  price: number
  pair: string
  token: string
  liquidity: number
  reserveToken: number
}

export interface StatsData {
  anubis: AnubisStats
  polygon: PolygonStats
  stakingFlow?: StakingFlow
  blocks?: { height: number; txs: number | null; gasUsed: number | null; timestamp: string }[]
  ts: string
}

export interface PriceSource {
  name: string
  pair?: string
  price: number
  liquidityUsd?: number
  weight: number
  note?: string
}

export interface PriceData {
  primary: number
  low: number
  high: number
  spread: number
  confidence: 'high' | 'medium' | 'low'
  sources: PriceSource[]
  polygon?: ChainPrice
  crossChainSpread?: number
  ts: string
}

export interface Holder {
  address: string
  value: number
  share: number
  isContract: boolean
  name?: string | null
}

export interface TokenData {
  address: string
  symbol: string
  name: string
  decimals: number
  totalSupply: number
  holders: number
  price: number
  marketCap: number
  volume24h: number
  stakingBalance?: number
  topHolders: Holder[]
  concentration: {
    top1: number
    top10: number
    top1Eoa: number
    top10Eoa: number
  }
  ts: string
}

export type NewsTag = 'official' | 'media' | 'risk' | 'onchain'

export interface NewsItem {
  id: string
  title: { zh: string; en: string }
  summary: { zh: string; en: string }
  source: string
  url: string
  publishedAt: string
  tag: NewsTag
  lang: 'zh' | 'en'
}

export interface RiskFactor {
  key: string
  label: { zh: string; en: string }
  value: string
  raw: number | null
  score: number
  weight: number
  status: 'ok' | 'warn' | 'danger' | 'unknown'
  detail: { zh: string; en: string }
  source?: string
}

export interface RiskData {
  score: number
  level: 'low' | 'medium' | 'high' | 'extreme'
  confidence: number
  factors: RiskFactor[]
  scenarios: {
    key: string
    label: { zh: string; en: string }
    price: number
    note: { zh: string; en: string }
  }[]
  ts: string
}

export interface Balances {
  native: number
  lgns: number
  glgns: number
  lp: number
  lpTotal: number
  lpShare: number
  poolLgns: number
  poolDai: number
}

export interface Product {
  id: string
  name: { zh: string; en: string }
  tagline: { zh: string; en: string }
  description: { zh: string; en: string }
  status: 'live' | 'unverified' | 'info'
  tvlUsd: number | null
  participants: number | null
  contract?: string
  contractVerified: boolean
  chain: 'anubis' | 'polygon' | 'both'
  metrics: { label: { zh: string; en: string }; value: string | { zh: string; en: string }; hint?: { zh: string; en: string } }[]
  mechanics: { zh: string[]; en: string[] }
  risks: { zh: string[]; en: string[] }
  evidence: { label: { zh: string; en: string }; value: string; href?: string }[]
}
