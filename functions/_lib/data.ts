import { CHAINS, CONTRACTS, HELIX, LGNS } from '../../shared/contracts'
import type { ChainKey } from '../../shared/contracts'
import type {
  AiTokenSnapshot,
  ApiWarning,
  ChainEvent,
  ChainQuote,
  ChainYield,
  ContractStatus,
  CoreData,
  EcosystemData,
  EventsSnapshot,
  HolderConcentration,
  NetworkSnapshot,
  PairSnapshot,
  RewardStats,
  YieldWindow,
} from '../../shared/types'
import {
  addressWord,
  fetchJson,
  formatUnits,
  isoNow,
  median,
  paddedAddress,
  rpcBatch,
  toBigInt,
  warning,
  word,
} from './utils'

const SELECTOR = {
  totalSupply: '0x18160ddd',
  balanceOf: '0x70a08231',
  token0: '0x0dfe1681',
  token1: '0xd21220a7',
  reserves: '0x0902f1ac',
  feeRatio: '0x41744dd4',
  buyFeeRatio: '0xbffad1ad',
  precision: '0xaaf5eb68',
  index: '0x2986c0e5',
  activePowerOf: '0x6cf2fa36',
  pendingPowerOf: '0xaa81a38f',
  totalPowerOf: '0x4f343040',
  accruedOf: '0xea0c88b2',
  daiDepositCap: '0xd29b59c5',
  daiDepositRemaining: '0x7e1a72f0',
  daiPowerRemaining: '0x22ce792d',
  lgnsBurnRemaining: '0xf77c6cce',
  aiBurnRemaining: '0x72df06bd',
  daiPowerCap: '0x30928d3e',
  lgnsBurnCap: '0x5fad1fe4',
  aiBurnCap: '0xb2517e4e',
}

interface PairReading {
  token0: string | null
  token1: string | null
  reserve0: number | null
  reserve1: number | null
}

const rpcUrls = (chain: ChainKey) => CHAINS[chain].rpc
const apiUrl = (path: string) => `${CHAINS.anubis.explorerApi}${path}`
const sameAddress = (actual: string | null, expected: string) =>
  Boolean(actual && actual.toLowerCase() === expected.toLowerCase())

const hexBlock = (number: number) => `0x${Math.max(0, Math.floor(number)).toString(16)}`

async function readPair(chain: ChainKey, pair: string, decimals0 = 18, decimals1 = 18): Promise<PairReading> {
  const result = await rpcBatch(rpcUrls(chain), [
    { method: 'eth_call', params: [{ to: pair, data: SELECTOR.token0 }, 'latest'] },
    { method: 'eth_call', params: [{ to: pair, data: SELECTOR.token1 }, 'latest'] },
    { method: 'eth_call', params: [{ to: pair, data: SELECTOR.reserves }, 'latest'] },
  ])
  const token0 = addressWord(word(result[0], 0))
  const token1 = addressWord(word(result[1], 0))
  const resolved0 = sameAddress(token0, LGNS[chain].token) ? LGNS[chain].decimals : decimals0
  const resolved1 = sameAddress(token1, LGNS[chain].token) ? LGNS[chain].decimals : decimals1
  return {
    token0,
    token1,
    reserve0: result[2] ? formatUnits(toBigInt(word(result[2], 0)), resolved0) : null,
    reserve1: result[2] ? formatUnits(toBigInt(word(result[2], 1)), resolved1) : null,
  }
}

export async function readLgnsQuote(chain: ChainKey): Promise<ChainQuote> {
  const deployment = LGNS[chain]
  const config = CHAINS[chain]
  const [blockHex, values] = await Promise.all([
    rpcBatch(rpcUrls(chain), [{ method: 'eth_blockNumber', params: [] }]),
    rpcBatch(rpcUrls(chain), [
      { method: 'eth_call', params: [{ to: deployment.token, data: SELECTOR.totalSupply }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.token, data: SELECTOR.feeRatio }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.token, data: SELECTOR.buyFeeRatio }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.token, data: SELECTOR.precision }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.pair, data: SELECTOR.token0 }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.pair, data: SELECTOR.token1 }, 'latest'] },
      { method: 'eth_call', params: [{ to: deployment.pair, data: SELECTOR.reserves }, 'latest'] },
    ]),
  ])

  const blockNumber = blockHex[0] ? Number.parseInt(blockHex[0], 16) : 0
  const totalRaw = toBigInt(values[0])
  const feeRaw = toBigInt(values[1])
  const buyRaw = toBigInt(values[2])
  const precisionRaw = toBigInt(values[3])
  const precision = precisionRaw > 0n ? Number(precisionRaw) : null
  const token0 = addressWord(word(values[4], 0))
  const token1 = addressWord(word(values[5], 0))
  const token0Decimals = sameAddress(token0, deployment.token) ? deployment.decimals : deployment.quoteDecimals
  const token1Decimals = sameAddress(token1, deployment.token) ? deployment.decimals : deployment.quoteDecimals
  const reserve0 = formatUnits(toBigInt(word(values[6], 0)), token0Decimals)
  const reserve1 = formatUnits(toBigInt(word(values[6], 1)), token1Decimals)

  let daiReserve: number | null = null
  let lgnsReserve: number | null = null
  if (sameAddress(token0, deployment.quoteToken) && sameAddress(token1, deployment.token)) {
    daiReserve = reserve0
    lgnsReserve = reserve1
  } else if (sameAddress(token0, deployment.token) && sameAddress(token1, deployment.quoteToken)) {
    lgnsReserve = reserve0
    daiReserve = reserve1
  }

  const priceDai =
    daiReserve !== null && lgnsReserve !== null && lgnsReserve > 0
      ? daiReserve / lgnsReserve
      : null
  const sellTaxPct = precision ? (Number(feeRaw) / precision) * 100 : null
  const buyTaxPct = precision ? (Number(buyRaw) / precision) * 100 : null

  return {
    chain,
    chainId: config.id,
    chainName: config.name,
    nativeSymbol: config.native.symbol,
    blockNumber,
    tokenAddress: deployment.token,
    pairAddress: deployment.pair,
    pairName: deployment.pairName,
    priceDai,
    netSellPriceDai:
      priceDai !== null && sellTaxPct !== null ? priceDai * (1 - sellTaxPct / 100) : null,
    daiReserve,
    lgnsReserve,
    totalSupply: totalRaw ? formatUnits(totalRaw, deployment.decimals) : null,
    buyTaxPct,
    sellTaxPct,
    precision,
    buyTaxRaw: values[2],
    sellTaxRaw: values[1],
    observedAt: isoNow(),
  }
}

async function anubisExplorerStats() {
  try {
    return await fetchJson<Record<string, unknown>>(apiUrl('/stats'), 8_000)
  } catch {
    return {}
  }
}

export async function readNetwork(chain: ChainKey): Promise<NetworkSnapshot> {
  const config = CHAINS[chain]
  const initial = await rpcBatch(rpcUrls(chain), [
    { method: 'eth_blockNumber', params: [] },
    { method: 'eth_gasPrice', params: [] },
  ])
  const latest = initial[0] ? Number.parseInt(initial[0], 16) : 0
  const gasPriceGwei = initial[1] ? Number(toBigInt(initial[1])) / 1e9 : null
  const sampleBlocks = chain === 'anubis' ? 900 : 900
  const oldBlock = Math.max(0, latest - sampleBlocks)

  const [blocks, stats, explorerBlocks] = await Promise.all([
    rpcBatch(rpcUrls(chain), [
      {
        method: 'eth_getBlockByNumber',
        params: [hexBlock(latest), false],
      },
      {
        method: 'eth_getBlockByNumber',
        params: [hexBlock(oldBlock), false],
      },
    ]),
    chain === 'anubis' ? anubisExplorerStats() : Promise.resolve({}),
    chain === 'anubis'
      ? fetchJson<Array<Record<string, unknown>>>(apiUrl('/main-page/blocks'), 8_000).catch(() => [])
      : Promise.resolve([]),
  ])

  const latestBlock = blocks[0] ?? null
  const oldBlockData = blocks[1] ?? null
  const timestampNow = latestBlock?.timestamp ? Number.parseInt(latestBlock.timestamp, 16) : 0
  const timestampOld = oldBlockData?.timestamp ? Number.parseInt(oldBlockData.timestamp, 16) : 0
  const span = timestampNow > timestampOld ? timestampNow - timestampOld : 0
  const blockTimeSec = span > 0 ? span / Math.max(1, latest - oldBlock) : null
  const blocksPerDay = blockTimeSec ? 86_400 / blockTimeSec : null

  let avgBlockFeeNative: number | null = null
  let rewardSampleCount = 0
  let blockRewardNative: number | null = null

  const sampledFees = explorerBlocks
    .map((block) => Number(block.transaction_fees || 0) / 1e18)
    .filter(Number.isFinite)
  if (sampledFees.length) {
    avgBlockFeeNative = sampledFees.reduce((sum, value) => sum + value, 0) / sampledFees.length
  } else if (latestBlock && gasPriceGwei !== null) {
    const gasUsed = Number.parseInt(latestBlock.gasUsed || '0x0', 16)
    avgBlockFeeNative = (gasUsed * gasPriceGwei) / 1e9
  }

  const rewardSamples = explorerBlocks
    .map((block) => block.rewards)
    .filter(Array.isArray) as Array<Array<Record<string, unknown>>>
  if (rewardSamples.length) {
    rewardSampleCount = rewardSamples.length
    blockRewardNative =
      rewardSamples.reduce((sum, rewards) => {
        const reward = Number(rewards[0]?.reward || 0)
        return sum + (Number.isFinite(reward) ? reward : 0)
      }, 0) / rewardSamples.length
  }

  const statsRecord = stats as Record<string, unknown>
  const statsNumber = (key: string) => {
    const value = Number(statsRecord[key])
    return Number.isFinite(value) ? value : null
  }

  return {
    chain,
    chainId: config.id,
    chainName: config.name,
    blockNumber: latest || null,
    blockTimeSec,
    blocksPerDay,
    gasPriceGwei,
    simpleTransferFeeNative: gasPriceGwei !== null ? (gasPriceGwei * 21_000) / 1e9 : null,
    blockFeeSampleCount: sampledFees.length,
    avgBlockFeeNative,
    estimatedDailyFeesNative:
      avgBlockFeeNative !== null && blocksPerDay !== null ? avgBlockFeeNative * blocksPerDay : null,
    blockRewardNative,
    rewardSampleCount,
    txToday: statsNumber('transactions_today'),
    totalTransactions: statsNumber('total_transactions'),
    totalAddresses: statsNumber('total_addresses'),
    utilizationPct: statsNumber('network_utilization_percentage'),
    observedAt: isoNow(),
  }
}

async function blockNumberFor(chain: ChainKey) {
  const [result] = await rpcBatch(rpcUrls(chain), [{ method: 'eth_blockNumber', params: [] }])
  return result ? Number.parseInt(result, 16) : 0
}

export async function readYield(chain: ChainKey, blockTimeSec: number | null): Promise<ChainYield> {
  const latestBlock = await blockNumberFor(chain)
  const specs: Array<{ key: '24h' | '7d' | '30d'; hours: number; intervals: number }> = [
    { key: '24h', hours: 24, intervals: 1 },
    { key: '7d', hours: 7 * 24, intervals: 1 },
    { key: '30d', hours: 30 * 24, intervals: 1 },
  ]
  const latestTag = hexBlock(latestBlock)
  const windowTags = specs.map((spec) => {
    const tags: string[] = []
    for (let index = spec.intervals; index >= 1; index--) {
      const blocksAgo =
        blockTimeSec && blockTimeSec > 0
          ? Math.round((spec.hours * 3600 * (index / spec.intervals)) / blockTimeSec)
          : 0
      tags.push(hexBlock(latestBlock - blocksAgo))
    }
    return tags
  })
  const uniqueTags = [...new Set([...windowTags.flat(), latestTag])]

  try {
    const [indexResults, blockResults] = await Promise.all([
      rpcBatch(
        rpcUrls(chain),
        uniqueTags.map((tag) => ({
          method: 'eth_call',
          params: [{ to: LGNS[chain].indexContract, data: SELECTOR.index }, tag],
        })),
        15_000,
      ),
      rpcBatch(
        rpcUrls(chain),
        uniqueTags.map((tag) => ({
          method: 'eth_getBlockByNumber',
          params: [tag, false],
        })),
        15_000,
      ),
    ])
    const indexByTag = new Map(
      uniqueTags.map((tag, index) => [
        tag,
        indexResults[index] ? Number(toBigInt(indexResults[index])) : null,
      ]),
    )
    const timeByTag = new Map(
      uniqueTags.map((tag, index) => [
        tag,
        blockResults[index]?.timestamp
          ? Number.parseInt(String(blockResults[index].timestamp), 16)
          : null,
      ]),
    )
    const latestIndex = indexByTag.get(latestTag) ?? null

    const windows: YieldWindow[] = specs.map((spec, specIndex) => {
      const tags = windowTags[specIndex]
      const points = [...tags.map((tag) => indexByTag.get(tag) ?? null), latestIndex]
      const times = [...tags.map((tag) => timeByTag.get(tag) ?? null), timeByTag.get(latestTag) ?? null]
      const dailyRates: number[] = []
      for (let index = 1; index < points.length; index++) {
        const before = points[index - 1]
        const after = points[index]
        const beforeTime = times[index - 1]
        const afterTime = times[index]
        if (!before || !after || !beforeTime || !afterTime || afterTime <= beforeTime) continue
        const intervalHours = (afterTime - beforeTime) / 3600
        dailyRates.push((Math.pow(after / before, 24 / intervalHours) - 1) * 100)
      }
      const dailyPct = median(dailyRates)
      if (dailyPct === null) {
        return {
          key: spec.key,
          hours: spec.hours,
          dailyPct: null,
          annualSimplePct: null,
          annualCompoundPct: null,
          startIndex: points[0] ?? null,
          endIndex: latestIndex,
          startBlock: Number.parseInt(tags[0], 16),
          endBlock: latestBlock,
          elapsedHours: null,
          samples: 0,
          status: 'unreadable',
        }
      }
      const elapsedHours =
        times[0] && times[times.length - 1] && times[times.length - 1]! > times[0]!
          ? (times[times.length - 1]! - times[0]!) / 3600
          : spec.hours
      return {
        key: spec.key,
        hours: spec.hours,
        dailyPct,
        annualSimplePct: dailyPct * 365,
        annualCompoundPct: (Math.pow(1 + dailyPct / 100, 365) - 1) * 100,
        startIndex: points[0] ?? null,
        endIndex: latestIndex,
        startBlock: Number.parseInt(tags[0], 16),
        endBlock: latestBlock,
        elapsedHours,
        samples: dailyRates.length,
        status: 'live',
      }
    })

    return {
      chain,
      contract: LGNS[chain].indexContract,
      latestIndex,
      windows,
      observedAt: isoNow(),
    }
  } catch {
    return {
      chain,
      contract: LGNS[chain].indexContract,
      latestIndex: null,
      windows: specs.map((spec) => ({
        key: spec.key,
        hours: spec.hours,
        dailyPct: null,
        annualSimplePct: null,
        annualCompoundPct: null,
        startIndex: null,
        endIndex: null,
        startBlock: null,
        endBlock: latestBlock,
        elapsedHours: null,
        samples: 0,
        status: 'unreadable',
      })),
      observedAt: isoNow(),
    }
  }
}

const emptyRewardStats = (): RewardStats => ({
  observedHours: 24,
  count: 0,
  totalAmount: 0,
  medianAmount: 0,
  minAmount: 0,
  maxAmount: 0,
  inspectedTransfers: 0,
  complete: false,
  availability: 'unreadable',
  from: null,
  to: null,
  observedAt: isoNow(),
})

export async function readClaimEvents(): Promise<EventsSnapshot> {
  const cutoff = Date.now() - 24 * 3600 * 1000
  let nextPage: Record<string, unknown> | null = null
  const items: Array<Record<string, any>> = []
  let pages = 0
  let complete = false

  while (pages < 2) {
    const queryString: string = nextPage
      ? `&${new URLSearchParams(nextPage as Record<string, string>).toString()}`
      : ''
    const url: string = `${apiUrl(`/addresses/${LGNS.anubis.stakingContract}/token-transfers`)}?token=${LGNS.anubis.token}${queryString}`
    const page = await fetchJson<{
      items?: Array<Record<string, any>>
      next_page_params?: Record<string, unknown> | null
    }>(url, 12_000)
    const pageItems: Array<Record<string, any>> = page.items ?? []
    items.push(...pageItems)
    pages++
    const oldest = pageItems.length
      ? Math.min(...pageItems.map((item: Record<string, any>) => new Date(item.timestamp).getTime()))
      : Date.now()
    nextPage = page.next_page_params ?? null
    if (!nextPage || oldest < cutoff) {
      complete = true
      break
    }
  }

  const inWindow = items.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime()
    return Number.isFinite(timestamp) && timestamp >= cutoff
  })
  const claims = inWindow.filter((item) => {
    const method = String(item.method || '').toLowerCase()
    return method === 'claiminterest' || method === '0xd286f3cf'
  })
  const amounts = claims
    .map((item) => formatUnits(toBigInt(String(item.total?.value || '0')), LGNS.anubis.decimals))
    .filter(Number.isFinite)
  const latest: ChainEvent[] = inWindow.slice(0, 6).map((item) => ({
    id: String(item.transaction_hash || item.tx_hash || `${item.timestamp}-${item.method}`),
    method: String(item.method || 'transfer'),
    amount: formatUnits(toBigInt(String(item.total?.value || '0')), LGNS.anubis.decimals),
    timestamp: String(item.timestamp),
    txHash: String(item.transaction_hash || item.tx_hash || ''),
    counterparty: String(item.to?.hash || item.from?.hash || ''),
    explorerUrl: item.transaction_hash
      ? `${CHAINS.anubis.explorer}/tx/${item.transaction_hash}`
      : CHAINS.anubis.explorer,
  }))

  const observedFrom = inWindow.length
    ? Math.min(...inWindow.map((item) => new Date(item.timestamp).getTime()))
    : null
  const observedTo = inWindow.length
    ? Math.max(...inWindow.map((item) => new Date(item.timestamp).getTime()))
    : null
  const observedHours =
    observedFrom !== null && observedTo !== null
      ? Math.max((observedTo - observedFrom) / 3_600_000, 1 / 60)
      : 0

  return {
    chain: 'anubis',
    claimInterest: {
      observedHours,
      count: claims.length,
      totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
      medianAmount: median(amounts) ?? 0,
      minAmount: amounts.length ? Math.min(...amounts) : 0,
      maxAmount: amounts.length ? Math.max(...amounts) : 0,
      inspectedTransfers: items.length,
      complete,
      availability: claims.length ? 'live' : complete ? 'partial' : 'unreadable',
      from: observedFrom !== null ? new Date(observedFrom).toISOString() : null,
      to: observedTo !== null ? new Date(observedTo).toISOString() : null,
      observedAt: isoNow(),
    },
    latest,
    observedAt: isoNow(),
  }
}

export async function readConcentration(): Promise<HolderConcentration | null> {
  try {
    const [token, holders] = await Promise.all([
      fetchJson<{ holders_count?: string; total_supply?: string }>(apiUrl(`/tokens/${LGNS.anubis.token}`)),
      fetchJson<{
        items?: Array<{
          address?: { hash?: string; is_contract?: boolean; name?: string | null }
          value?: string
        }>
      }>(apiUrl(`/tokens/${LGNS.anubis.token}/holders`), 12_000),
    ])
    const total = Number(token.total_supply || 0) / 1e9
    const mapped = (holders.items ?? []).slice(0, 10).map((holder) => {
      const value = Number(holder.value || 0) / 1e9
      return {
        address: holder.address?.hash ?? '',
        value,
        sharePct: total > 0 ? (value / total) * 100 : 0,
        isContract: Boolean(holder.address?.is_contract),
        name: holder.address?.name ?? null,
      }
    })
    return {
      holders: token.holders_count ? Number(token.holders_count) : null,
      top1Pct: mapped[0]?.sharePct ?? null,
      top10Pct: mapped.reduce((sum, holder) => sum + holder.sharePct, 0),
      top1Address: mapped[0]?.address ?? null,
      topHolders: mapped,
    }
  } catch {
    return null
  }
}

export async function readContractStatuses(keys?: string[]): Promise<ContractStatus[]> {
  const selected = keys?.length
    ? CONTRACTS.filter((contract) => keys.includes(contract.key))
    : CONTRACTS
  return await Promise.all(
    selected.map(async (contract) => {
      let verified: boolean | null = null
      let proxyType: string | null = null
      let implementation: string | null = null
      if (contract.chain === 'anubis') {
        try {
          const address = await fetchJson<{
            is_verified?: boolean
            proxy_type?: string | null
            implementations?: Array<{ address_hash?: string }>
          }>(apiUrl(`/addresses/${contract.address}`), 8_000)
          verified = Boolean(address.is_verified)
          proxyType = address.proxy_type ?? null
          implementation = address.implementations?.[0]?.address_hash ?? null
        } catch {
          verified = null
        }
      }
      const explorerUrl =
        contract.chain === 'anubis'
          ? `${CHAINS.anubis.explorer}/address/${contract.address}`
          : `${CHAINS.polygon.explorer}/address/${contract.address}`
      return {
        ...contract,
        verified,
        proxyType,
        implementation,
        explorerUrl,
      }
    }),
  )
}

export async function buildCoreData(
  options: { contracts?: boolean; concentration?: boolean } = {},
): Promise<CoreData> {
  const includeContracts = options.contracts ?? true
  const includeConcentration = options.concentration ?? true
  const warnings: ApiWarning[] = []
  const [
    anubisQuoteResult,
    polygonQuoteResult,
    anubisNetworkResult,
    polygonNetworkResult,
    anubisYieldResult,
    polygonYieldResult,
    eventsResult,
    concentrationResult,
    contractsResult,
  ] = (await Promise.allSettled([
    readLgnsQuote('anubis'),
    readLgnsQuote('polygon'),
    readNetwork('anubis'),
    readNetwork('polygon'),
    readYield('anubis', 1),
    readYield('polygon', 1.5),
    readClaimEvents(),
    includeConcentration ? readConcentration() : Promise.resolve(null),
    includeContracts ? readContractStatuses() : Promise.resolve([]),
  ])) as [
    PromiseSettledResult<ChainQuote>,
    PromiseSettledResult<ChainQuote>,
    PromiseSettledResult<NetworkSnapshot>,
    PromiseSettledResult<NetworkSnapshot>,
    PromiseSettledResult<ChainYield>,
    PromiseSettledResult<ChainYield>,
    PromiseSettledResult<EventsSnapshot>,
    PromiseSettledResult<HolderConcentration | null>,
    PromiseSettledResult<ContractStatus[]>,
  ]

  const quotes: ChainQuote[] = []
  if (anubisQuoteResult.status === 'fulfilled') quotes.push(anubisQuoteResult.value)
  if (polygonQuoteResult.status === 'fulfilled') quotes.push(polygonQuoteResult.value)
  const networks: NetworkSnapshot[] = []
  if (anubisNetworkResult.status === 'fulfilled') networks.push(anubisNetworkResult.value)
  if (polygonNetworkResult.status === 'fulfilled') networks.push(polygonNetworkResult.value)
  const yields: ChainYield[] = []
  if (anubisYieldResult.status === 'fulfilled') yields.push(anubisYieldResult.value)
  if (polygonYieldResult.status === 'fulfilled') yields.push(polygonYieldResult.value)
  const events = eventsResult.status === 'fulfilled' ? [eventsResult.value] : []
  const concentration =
    concentrationResult.status === 'fulfilled' ? concentrationResult.value : null
  const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value : []

  if (anubisQuoteResult.status === 'rejected') {
    warnings.push(warning('ANUBIS_LGNS', 'Anubis LGNS 数据暂时不可读。', 'Anubis LGNS data is unavailable.', 'Anubis RPC'))
  }
  if (polygonQuoteResult.status === 'rejected') {
    warnings.push(warning('POLYGON_LGNS', 'Polygon LGNS 数据暂时不可读。', 'Polygon LGNS data is unavailable.', 'Polygon RPC'))
  }
  if (anubisNetworkResult.status === 'rejected') {
    warnings.push(warning('ANUBIS_NETWORK', 'Anubis 网络数据暂时不可读。', 'Anubis network data is unavailable.', 'Anubis RPC'))
  }
  if (polygonNetworkResult.status === 'rejected') {
    warnings.push(warning('POLYGON_NETWORK', 'Polygon 网络数据暂时不可读。', 'Polygon network data is unavailable.', 'Polygon RPC'))
  }
  if (anubisYieldResult.status === 'rejected') {
    warnings.push(warning('ANUBIS_YIELD', 'Anubis 历史 index 暂时不可读。', 'Historical Anubis index is unavailable.', 'Anubis RPC'))
  }
  if (polygonYieldResult.status === 'rejected') {
    warnings.push(warning('POLYGON_YIELD', 'Polygon 历史 index 暂时不可读。', 'Historical Polygon index is unavailable.', 'Polygon RPC'))
  }
  for (const [key, result] of [
    ['anubis', anubisQuoteResult],
    ['polygon', polygonQuoteResult],
  ] as const) {
    if (
      result.status === 'fulfilled' &&
      (result.value.priceDai === null ||
        result.value.buyTaxPct === null ||
        result.value.sellTaxPct === null)
    ) {
      warnings.push(
        warning(
          `${key.toUpperCase()}_PARTIAL_QUOTE`,
          `${key === 'anubis' ? 'Anubis' : 'Polygon'} 价格或税费字段部分不可读。`,
          `${key === 'anubis' ? 'Anubis' : 'Polygon'} price or tax fields are partially unavailable.`,
          `${key === 'anubis' ? 'Anubis' : 'Polygon'} RPC`,
        ),
      )
    }
  }
  for (const [key, result] of [
    ['anubis', anubisYieldResult],
    ['polygon', polygonYieldResult],
  ] as const) {
    if (
      result.status === 'fulfilled' &&
      result.value.windows.some((window) => window.status === 'unreadable')
    ) {
      warnings.push(
        warning(
          `${key.toUpperCase()}_YIELD_PARTIAL`,
          `${key === 'anubis' ? 'Anubis' : 'Polygon'} 部分收益窗口不可读。`,
          `Some ${key === 'anubis' ? 'Anubis' : 'Polygon'} yield windows are unavailable.`,
          `${key === 'anubis' ? 'Anubis' : 'Polygon'} RPC`,
        ),
      )
    }
  }
  if (eventsResult.status === 'rejected') {
    warnings.push(warning('EVENTS', '最近 24 小时领取事件暂时不可读。', 'Recent 24h claim events are unavailable.', 'Anubis explorer'))
  }
  if (includeConcentration && !concentration) {
    warnings.push(warning('HOLDER_INDEX', 'LGNS 持仓索引暂时不可读。', 'The LGNS holder index is unavailable.', 'Anubis explorer'))
  }
  if (includeContracts && !contracts.length) {
    warnings.push(warning('CONTRACT_STATUS', '合约验证状态暂时不可读。', 'Contract verification state is unavailable.', 'Anubis explorer'))
  }

  return {
    quotes,
    networks,
    yields,
    events,
    contracts,
    concentration,
    observedAt: isoNow(),
    warnings,
  }
}

export async function readAiToken(): Promise<AiTokenSnapshot | null> {
  try {
    const [token, address] = await Promise.all([
      fetchJson<{
        name?: string
        symbol?: string
        decimals?: string
        total_supply?: string
        holders_count?: string
      }>(apiUrl(`/tokens/${HELIX.token}`), 10_000),
      fetchJson<{
        is_verified?: boolean
        proxy_type?: string | null
        implementations?: Array<{ address_hash?: string }>
      }>(apiUrl(`/addresses/${HELIX.token}`), 10_000),
    ])
    let top1Pct: number | null = null
    let top1Address: string | null = null
    try {
      const holders = await fetchJson<{
        items?: Array<{ address?: { hash?: string }; value?: string }>
      }>(apiUrl(`/tokens/${HELIX.token}/holders`), 10_000)
      const total = Number(token.total_supply || 0)
      const top = holders.items?.[0]
      if (top && total > 0) {
        top1Pct = (Number(top.value || 0) / total) * 100
        top1Address = top.address?.hash ?? null
      }
    } catch {
      // Holder list is optional.
    }
    return {
      address: HELIX.token,
      name: token.name || 'AiLGNS',
      symbol: token.symbol || 'AiLGNS',
      decimals: Number(token.decimals || 18),
      totalSupply: token.total_supply ? Number(token.total_supply) / 1e18 : null,
      holders: token.holders_count ? Number(token.holders_count) : null,
      top1Pct,
      top1Address,
      verified: Boolean(address.is_verified),
      proxyType: address.proxy_type ?? null,
      implementation: address.implementations?.[0]?.address_hash ?? null,
    }
  } catch {
    return null
  }
}

export async function readHelixQuotas() {
  const result = await rpcBatch(CHAINS.anubis.rpc, [
    { method: 'eth_call', params: [{ to: HELIX.lens, data: SELECTOR.daiDepositCap }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.lens, data: SELECTOR.daiDepositRemaining }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.lens, data: SELECTOR.daiPowerRemaining }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.lens, data: SELECTOR.lgnsBurnRemaining }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.lens, data: SELECTOR.aiBurnRemaining }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.ledger, data: SELECTOR.daiPowerCap }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.ledger, data: SELECTOR.lgnsBurnCap }, 'latest'] },
    { method: 'eth_call', params: [{ to: HELIX.ledger, data: SELECTOR.aiBurnCap }, 'latest'] },
  ])
  const at = (index: number) => (result[index] ? formatUnits(toBigInt(result[index]), 18) : null)
  return {
    daiDepositCap: at(0),
    daiDepositRemaining: at(1),
    daiPowerRemaining: at(2),
    lgnsBurnPowerRemaining: at(3),
    aiBurnPowerRemaining: at(4),
    daiPowerCap: at(5),
    lgnsBurnPowerCap: at(6),
    aiBurnPowerCap: at(7),
    observedAt: isoNow(),
  }
}

async function readHelixPair(address: string, name: string): Promise<PairSnapshot> {
  const pair = await readPair('anubis', address)
  let priceDaiPerAi: number | null = null
  if (pair.reserve0 !== null && pair.reserve1 !== null) {
    if (sameAddress(pair.token0, HELIX.token) && sameAddress(pair.token1, HELIX.dai) && pair.reserve0 > 0) {
      priceDaiPerAi = pair.reserve1 / pair.reserve0
    } else if (
      sameAddress(pair.token1, HELIX.token) &&
      sameAddress(pair.token0, HELIX.dai) &&
      pair.reserve1 > 0
    ) {
      priceDaiPerAi = pair.reserve0 / pair.reserve1
    }
  }
  return {
    address,
    name,
    token0: pair.token0 || '',
    token1: pair.token1 || '',
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    priceDaiPerAi,
    observedAt: isoNow(),
  }
}

export async function buildEcosystemData(): Promise<EcosystemData> {
  const warnings: ApiWarning[] = []
  const [aiToken, quotaResult, pairsResult, deadResult, contractsResult] = await Promise.allSettled([
    readAiToken(),
    readHelixQuotas(),
    Promise.all([
      readHelixPair(HELIX.aiDaiPair, 'AiLGNS / DAI'),
      readHelixPair(HELIX.aiLgnsPair, 'AiLGNS / LGNS'),
    ]),
    rpcBatch(CHAINS.anubis.rpc, [
      {
        method: 'eth_call',
        params: [
          {
            to: LGNS.anubis.token,
            data: `${SELECTOR.balanceOf}${paddedAddress(HELIX.dead)}`,
          },
          'latest',
        ],
      },
    ]),
    readContractStatuses(['ailgns', 'helix-ledger', 'helix-lens', 'helix-nft']),
  ])

  if (aiToken.status === 'rejected' || !aiToken.value) {
    warnings.push(warning('AI_TOKEN', 'AiLGNS 代币数据暂时不可读。', 'AiLGNS token data is unavailable.', 'Anubis explorer'))
  }
  if (quotaResult.status === 'rejected') {
    warnings.push(warning('HELIX_QUOTA', 'HELIX 每日额度暂时不可读。', 'HELIX daily quotas are unavailable.', 'Anubis RPC'))
  }
  if (pairsResult.status === 'rejected') {
    warnings.push(warning('HELIX_PAIRS', 'HELIX 池子数据暂时不可读。', 'HELIX pool data is unavailable.', 'Anubis RPC'))
  }

  const emptyQuotas = {
    daiDepositCap: null,
    daiDepositRemaining: null,
    daiPowerCap: null,
    daiPowerRemaining: null,
    lgnsBurnPowerCap: null,
    lgnsBurnPowerRemaining: null,
    aiBurnPowerCap: null,
    aiBurnPowerRemaining: null,
    observedAt: isoNow(),
  }

  return {
    aiToken: aiToken.status === 'fulfilled' ? aiToken.value : null,
    quotas: quotaResult.status === 'fulfilled' ? quotaResult.value : emptyQuotas,
    pairs: pairsResult.status === 'fulfilled' ? pairsResult.value : [],
    lgnsDeadBalance:
      deadResult.status === 'fulfilled' && deadResult.value[0]
        ? formatUnits(toBigInt(deadResult.value[0]), LGNS.anubis.decimals)
        : null,
    deadAddress: HELIX.dead,
    contracts: contractsResult.status === 'fulfilled' ? contractsResult.value : [],
    registryUrl: 'https://awakehelix.io/#/docs/chapter-16',
    observedAt: isoNow(),
    warnings,
  }
}
