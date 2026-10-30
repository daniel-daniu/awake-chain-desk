import { ANUBIS, POLYGON, POLYGON_DAI, POLYGON_LGNS, POLYGON_PAIR } from '../config/chain'
import { CONTRACTS } from '../config/contracts'
import type { ChainPrice, NewsItem, PriceData, PriceSource, StakingFlow, StatsData, TokenData } from '../types'
import { addressFromWord, decodeUint, ethCall, polygonCall, rpcCall, SEL, wordAt } from './rpc'

const LGNS = CONTRACTS.lgns.address
const DAI = CONTRACTS.dai.address
const STAKING = CONTRACTS.staking.address
const LGNS_DECIMALS = 9
const CLAIM_INTEREST = '0xd286f3cf'

const withTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> =>
  await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])

async function bs<T>(path: string): Promise<T> {
  const res = await withTimeout(fetch(`${ANUBIS.api}${path}`, { headers: { accept: 'application/json' } }), 8_000)
  if (!res.ok) throw new Error(`blockscout ${res.status}`)
  return (await res.json()) as T
}

interface PairReading {
  address: string
  name: string
  price: number
  daiReserve: number
  lgnsReserve: number
}

async function readPair(address: string, name: string): Promise<PairReading | null> {
  const [t0, t1, reserves] = await Promise.all([
    ethCall(address, SEL.token0),
    ethCall(address, SEL.token1),
    ethCall(address, SEL.getReserves),
  ])
  const token0 = addressFromWord(wordAt(t0, 0)).toLowerCase()
  const token1 = addressFromWord(wordAt(t1, 0)).toLowerCase()
  const r0 = decodeUint(wordAt(reserves, 0))
  const r1 = decodeUint(wordAt(reserves, 1))

  if (token0 === LGNS.toLowerCase() && token1 === DAI.toLowerCase()) {
    const lgnsReserve = Number(r0) / 10 ** LGNS_DECIMALS
    const daiReserve = Number(r1) / 1e18
    return { address, name, lgnsReserve, daiReserve, price: daiReserve / lgnsReserve }
  }
  if (token0 === DAI.toLowerCase() && token1 === LGNS.toLowerCase()) {
    const daiReserve = Number(r0) / 1e18
    const lgnsReserve = Number(r1) / 10 ** LGNS_DECIMALS
    return { address, name, lgnsReserve, daiReserve, price: daiReserve / lgnsReserve }
  }
  return null
}

async function readPolygonPair(): Promise<ChainPrice | null> {
  const [t0, t1, reserves] = await Promise.all([
    polygonCall<string>('eth_call', [{ to: POLYGON_PAIR, data: SEL.token0 }, 'latest']),
    polygonCall<string>('eth_call', [{ to: POLYGON_PAIR, data: SEL.token1 }, 'latest']),
    polygonCall<string>('eth_call', [{ to: POLYGON_PAIR, data: SEL.getReserves }, 'latest']),
  ])
  const token0 = addressFromWord(wordAt(t0, 0)).toLowerCase()
  const token1 = addressFromWord(wordAt(t1, 0)).toLowerCase()
  const r0 = decodeUint(wordAt(reserves, 0))
  const r1 = decodeUint(wordAt(reserves, 1))

  if (token0 === POLYGON_DAI.toLowerCase() && token1 === POLYGON_LGNS.toLowerCase()) {
    const dai = Number(r0) / 1e18
    const lgns = Number(r1) / 10 ** LGNS_DECIMALS
    return {
      chain: 'polygon',
      price: dai / lgns,
      pair: POLYGON_PAIR,
      token: POLYGON_LGNS,
      liquidity: dai,
      reserveToken: lgns,
    }
  }
  if (token1 === POLYGON_DAI.toLowerCase() && token0 === POLYGON_LGNS.toLowerCase()) {
    const dai = Number(r1) / 1e18
    const lgns = Number(r0) / 10 ** LGNS_DECIMALS
    return {
      chain: 'polygon',
      price: dai / lgns,
      pair: POLYGON_PAIR,
      token: POLYGON_LGNS,
      liquidity: dai,
      reserveToken: lgns,
    }
  }
  return null
}

export async function fetchPriceDirect(): Promise<PriceData> {
  const readings: PairReading[] = []
  try {
    const primary = await readPair(CONTRACTS.pairPrimary.address, 'RocketSwap LGNS/DAI primary pool')
    if (primary) readings.push(primary)
  } catch {
    // fall back to explorer quote
  }

  const [token, polygon] = await Promise.all([
    bs<{ exchange_rate?: string }>(`/tokens/${LGNS}`),
    readPolygonPair().catch(() => null),
  ])
  const blockscoutPrice = token.exchange_rate ? Number(token.exchange_rate) : null

  const sources: PriceSource[] = readings.map((r) => ({
    name: r.name,
    pair: r.address,
    price: r.price,
    liquidityUsd: r.daiReserve,
    weight: r.daiReserve > 5_000_000 ? 3 : 2,
  }))
  if (blockscoutPrice) sources.push({ name: 'Blockscout quote', price: blockscoutPrice, weight: 2 })
  if (!sources.length) throw new Error('no price sources')

  const prices = sources.map((s) => s.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const spread = high / low
  const base = readings[0]?.price ?? blockscoutPrice ?? 0

  return {
    primary: base,
    low,
    high,
    spread,
    confidence: spread < 1.05 ? 'high' : spread < 1.2 ? 'medium' : 'low',
    sources,
    polygon: polygon || undefined,
    crossChainSpread: polygon ? polygon.price / base : undefined,
    ts: new Date().toISOString(),
  }
}

interface RawHolder {
  address?: { hash?: string; is_contract?: boolean; name?: string | null }
  value?: string
}

export async function fetchTokenDirect(_price = 0): Promise<TokenData> {
  const [token, holdersRes] = await Promise.all([
    bs<{ symbol?: string; name?: string; total_supply?: string; holders_count?: string; volume_24h?: string }>(
      `/tokens/${LGNS}`,
    ),
    bs<{ items?: RawHolder[] }>(`/tokens/${LGNS}/holders`).catch(() => ({ items: [] })),
  ])

  const totalSupply = Number(token.total_supply || 0) / 10 ** LGNS_DECIMALS
  const holders = (holdersRes.items || []).map((h) => {
    const value = Number(h.value || 0) / 10 ** LGNS_DECIMALS
    return {
      address: h.address?.hash || '',
      value,
      share: totalSupply ? value / totalSupply : 0,
      isContract: Boolean(h.address?.is_contract),
      name: h.address?.name || null,
    }
  })

  const top10 = holders.slice(0, 10)
  const eoas = holders.filter((h) => !h.isContract)

  return {
    address: LGNS,
    symbol: token.symbol || 'LGNS',
    name: token.name || 'Longinus',
    decimals: LGNS_DECIMALS,
    totalSupply,
    holders: Number(token.holders_count || 0),
    price: 0,
    marketCap: 0,
    volume24h: Number(token.volume_24h || 0),
    topHolders: top10,
    concentration: {
      top1: top10[0]?.share || 0,
      top10: top10.reduce((a, h) => a + h.share, 0),
      top1Eoa: eoas[0]?.share || 0,
      top10Eoa: eoas.slice(0, 10).reduce((a, h) => a + h.share, 0),
    },
    stakingBalance: holders.find((h) => h.address.toLowerCase() === STAKING.toLowerCase())?.value || 0,
    ts: new Date().toISOString(),
  }
}

const median = (arr: number[]) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export async function fetchFlowDirect(): Promise<StakingFlow> {
  let items: any[] = []
  let params: Record<string, unknown> | null = null
  for (let i = 0; i < 1; i++) {
    const qs: string = params ? '&' + new URLSearchParams(params as any).toString() : ''
    const d: { items?: any[]; next_page_params?: Record<string, unknown> } = await bs<{ items?: any[]; next_page_params?: Record<string, unknown> }>(
      `/addresses/${STAKING}/token-transfers?token=${LGNS}${qs}`,
    )
    items = items.concat(d.items || [])
    params = d.next_page_params || null
    if (!params) break
  }
  if (items.length < 10) throw new Error('flow sample empty')

  const times = items.map((x) => new Date(x.timestamp).getTime())
  const spanSec = (Math.max(...times) - Math.min(...times)) / 1000
  if (!spanSec || spanSec <= 0) throw new Error('flow span empty')

  const claims = items.filter((x) => x.method === CLAIM_INTEREST)
  const amounts = claims.map((x) => Number(x.total?.value || 0) / 1e9)
  const total = amounts.reduce((a, b) => a + b, 0)
  const sorted = [...amounts].sort((a, b) => a - b)
  const trimmed = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.95)))
  const trimmedMean = trimmed.length ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length : 0
  const med = median(amounts)
  return {
    sampled: items.length,
    claims: claims.length,
    claimShare: claims.length / items.length,
    medianClaim: med,
    avgClaim: amounts.length ? total / amounts.length : 0,
    trimmedMeanClaim: trimmedMean,
    maxClaim: amounts.length ? Math.max(...amounts) : 0,
    spanSec,
    ts: new Date().toISOString(),
  }
}

const hexToInt = (h: string | null | undefined) => (h ? Number.parseInt(h, 16) : 0)

export async function fetchStatsDirect(): Promise<StatsData> {
  const [stats, blocks, latestHex] = await Promise.all([
    bs<Record<string, string | number | null>>('/stats'),
    bs<any[]>('/main-page/blocks').catch(() => []),
    rpcCall<string>('eth_blockNumber', []),
  ])

  const latest = hexToInt(latestHex)
  const sampleBlocks = 86400
  let blocksPerDay: number | null = null
  let blockTime: number | null = null
  if (latest > sampleBlocks) {
    const [nowBlock, oldBlock] = await Promise.all([
      rpcCall<any>('eth_getBlockByNumber', ['0x' + latest.toString(16), false]),
      rpcCall<any>('eth_getBlockByNumber', ['0x' + (latest - sampleBlocks).toString(16), false]),
    ])
    const span = Math.max(1, hexToInt(nowBlock?.timestamp) - hexToInt(oldBlock?.timestamp))
    blocksPerDay = (sampleBlocks / span) * 86400
    blockTime = span / sampleBlocks
  }

  const fees = (blocks || [])
    .map((b: any) => Number(b.transaction_fees || 0) / 1e18)
    .filter((n: number) => Number.isFinite(n))
  const avgBlockFee = fees.length ? fees.reduce((a, b) => a + b, 0) / fees.length : null
  const rewardLists = (blocks || []).map((b: any) => b.rewards).filter(Array.isArray)
  const blockReward = rewardLists.length
    ? rewardLists.some((r: any[]) => r.length > 0)
      ? rewardLists.reduce((acc: number, r: any[]) => acc + Number(r[0]?.reward || 0), 0) / rewardLists.length
      : 0
    : null

  let polygon = {
    chainId: 137,
    blockNumber: 0,
    gasPriceGwei: 0,
    blockTime: null as number | null,
    blocksPerDay: null as number | null,
    simpleTransferFee: null as number | null,
  }
  try {
    const pLatest = hexToInt(await polygonCall<string>('eth_blockNumber', []))
    const [gp, pNow, pOld] = await Promise.all([
      polygonCall<string>('eth_gasPrice', []),
      polygonCall<any>('eth_getBlockByNumber', ['0x' + pLatest.toString(16), false]),
      polygonCall<any>('eth_getBlockByNumber', ['0x' + (pLatest - 43200).toString(16), false]),
    ])
    const gasGwei = Number(BigInt(gp)) / 1e9
    const pSpan = Math.max(1, hexToInt(pNow?.timestamp) - hexToInt(pOld?.timestamp))
    polygon = {
      chainId: 137,
      blockNumber: pLatest,
      gasPriceGwei: gasGwei,
      blockTime: pSpan / 43200,
      blocksPerDay: (43200 / pSpan) * 86400,
      simpleTransferFee: (gasGwei * 21000) / 1e9,
    }
  } catch {
    // keep zeros
  }

  return {
    anubis: {
      chainId: ANUBIS.id,
      blockNumber: Number(stats.total_blocks || latest),
      blockTime: blockTime ?? Number(stats.average_block_time || 1000) / 1000,
      totalAddresses: Number(stats.total_addresses || 0),
      totalTransactions: Number(stats.total_transactions || 0),
      txToday: Number(stats.transactions_today || 0),
      gas: (stats.gas_prices as unknown as StatsData['anubis']['gas']) || { slow: 0, average: 0, fast: 0 },
      utilization: Number(stats.network_utilization_percentage || 0),
      nativePrice: Number(stats.coin_price || 1),
      blocksPerDay: blocksPerDay ?? undefined,
      blockReward,
      avgBlockFee,
      dailyFee: avgBlockFee !== null && blocksPerDay ? avgBlockFee * blocksPerDay : null,
      feeSample: fees.length,
    },
    polygon: {
      ...polygon,
      blockTime: polygon.blockTime ?? undefined,
      blocksPerDay: polygon.blocksPerDay ?? undefined,
      simpleTransferFee: polygon.simpleTransferFee ?? undefined,
    },
    ts: new Date().toISOString(),
  }
}

export async function fetchNewsDirect(): Promise<{ items: NewsItem[] }> {
  const res = await withTimeout(fetch('/fallback/news.json'), 6000)
  if (!res.ok) throw new Error('news fallback missing')
  const json = await res.json()
  return json.data as { items: NewsItem[] }
}
