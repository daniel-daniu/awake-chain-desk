import type { ChainKey } from './contracts'

export type Lang = 'zh' | 'en'
export type Bi = { zh: string; en: string }
export type SourceKind = 'rpc' | 'explorer' | 'external'
export type Availability = 'live' | 'partial' | 'unreadable' | 'stale'
export type SourceStatus = 'ok' | 'partial' | 'error'

export interface SourceInfo {
  id: string
  name: string
  kind: SourceKind
  url?: string
  status: SourceStatus
  retrievedAt: string
  blockNumber?: number
  note?: Bi
}

export interface ApiWarning {
  code: string
  message: Bi
  source?: string
}

export interface ApiEnvelope<T> {
  ok: boolean
  data?: T
  error?: string
  retrievedAt: string
  stale?: boolean
  sources: SourceInfo[]
  warnings: ApiWarning[]
}

export interface Metric<T> {
  value: T | null
  source: SourceKind
  blockNumber?: number
  observedAt: string
  method?: string
  availability: Availability
  note?: Bi
}

export interface RuleAmount {
  value: number | null
  raw: string | null
  numerator: number | null
  denominator: number | null
  blockNumber: number
}

export interface ChainQuote {
  chain: ChainKey
  chainId: number
  chainName: string
  nativeSymbol: string
  blockNumber: number
  tokenAddress: string
  pairAddress: string
  pairName: string
  priceDai: number | null
  netSellPriceDai: number | null
  daiReserve: number | null
  lgnsReserve: number | null
  totalSupply: number | null
  buyTaxPct: number | null
  sellTaxPct: number | null
  precision: number | null
  buyTaxRaw: string | null
  sellTaxRaw: string | null
  observedAt: string
}

export interface NetworkSnapshot {
  chain: ChainKey
  chainId: number
  chainName: string
  blockNumber: number | null
  blockTimeSec: number | null
  blocksPerDay: number | null
  gasPriceGwei: number | null
  simpleTransferFeeNative: number | null
  blockFeeSampleCount: number
  avgBlockFeeNative: number | null
  estimatedDailyFeesNative: number | null
  blockRewardNative: number | null
  rewardSampleCount: number
  txToday: number | null
  totalTransactions: number | null
  totalAddresses: number | null
  utilizationPct: number | null
  observedAt: string
}

export interface YieldWindow {
  key: '24h' | '7d' | '30d'
  hours: number
  dailyPct: number | null
  annualSimplePct: number | null
  annualCompoundPct: number | null
  startIndex: number | null
  endIndex: number | null
  startBlock: number | null
  endBlock: number | null
  elapsedHours: number | null
  samples: number
  status: Availability
}

export interface ChainYield {
  chain: ChainKey
  contract: string
  latestIndex: number | null
  windows: YieldWindow[]
  observedAt: string
}

export interface RewardStats {
  observedHours: number
  count: number
  totalAmount: number
  medianAmount: number
  minAmount: number
  maxAmount: number
  inspectedTransfers: number
  complete: boolean
  availability: Availability
  from: string | null
  to: string | null
  observedAt: string
}

export interface ChainEvent {
  id: string
  method: string
  amount: number
  timestamp: string
  txHash: string
  counterparty: string
  explorerUrl: string
}

export interface EventsSnapshot {
  chain: ChainKey
  claimInterest: RewardStats
  latest: ChainEvent[]
  observedAt: string
}

export interface HolderConcentration {
  holders: number | null
  top1Pct: number | null
  top10Pct: number | null
  top1Address: string | null
  topHolders: Array<{
    address: string
    value: number
    sharePct: number
    isContract: boolean
    name: string | null
  }>
}

export interface ContractStatus {
  key: string
  address: string
  chain: ChainKey
  role: string
  label: Bi
  verified: boolean | null
  proxyType: string | null
  implementation: string | null
  explorerUrl: string
}

export interface CoreData {
  quotes: ChainQuote[]
  networks: NetworkSnapshot[]
  yields: ChainYield[]
  events: EventsSnapshot[]
  contracts: ContractStatus[]
  concentration: HolderConcentration | null
  observedAt: string
  warnings: ApiWarning[]
}

export interface NewsItem {
  id: string
  title: string
  summary: string | null
  category: 'announcement' | 'news' | 'onchain'
  source: string
  url: string
  publishedAt: string
  language: 'zh' | 'en'
}

export interface NewsData {
  items: NewsItem[]
  sourceState: Array<{
    id: string
    name: string
    status: SourceStatus
    count: number
    message?: string
  }>
  observedAt: string
}

export type HomeData = CoreData

export interface ProductsData {
  core: CoreData
}

export interface AiTokenSnapshot {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: number | null
  holders: number | null
  top1Pct: number | null
  top1Address: string | null
  verified: boolean | null
  proxyType: string | null
  implementation: string | null
}

export interface HelixQuotas {
  daiDepositCap: number | null
  daiDepositRemaining: number | null
  daiPowerCap: number | null
  daiPowerRemaining: number | null
  lgnsBurnPowerCap: number | null
  lgnsBurnPowerRemaining: number | null
  aiBurnPowerCap: number | null
  aiBurnPowerRemaining: number | null
  observedAt: string
}

export interface PairSnapshot {
  address: string
  name: string
  token0: string
  token1: string
  reserve0: number | null
  reserve1: number | null
  priceDaiPerAi: number | null
  observedAt: string
}

export interface EcosystemData {
  aiToken: AiTokenSnapshot | null
  quotas: HelixQuotas
  pairs: PairSnapshot[]
  lgnsDeadBalance: number | null
  deadAddress: string
  contracts: ContractStatus[]
  registryUrl: string
  observedAt: string
  warnings: ApiWarning[]
}

export interface PortfolioBalances {
  native: number | null
  lgns: number | null
  glgns: number | null
  aiLgns: number | null
  lp: number | null
  lpShare: number | null
  poolLgns: number | null
  poolDai: number | null
}

export interface PortfolioData {
  address: string
  anubis: PortfolioBalances
  polygon: PortfolioBalances
  helix: {
    activePower: number | null
    pendingPower: number | null
    totalPower: number | null
    accruedAiLgns: number | null
  }
  observedAt: string
  warnings: ApiWarning[]
}
