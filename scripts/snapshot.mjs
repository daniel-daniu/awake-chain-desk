import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'fallback')

const ANUBIS_RPC = 'https://rpc.anubispace.org'
const ANUBIS_API = 'https://browser.anubispace.org/api/v2'
const POLYGON_RPC = 'https://polygon-bor-rpc.publicnode.com'

const LGNS = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const LGNS_DECIMALS = 9
const DAI = '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14'
const STAKING = '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228'
const CLAIM_INTEREST = '0xd286f3cf'

const POLYGON_PAIR = '0x882df4B0fB50a229C3B4124EB18c759911485bFb'
const POLYGON_LGNS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01'
const POLYGON_DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

const PAIRS = [
  { address: '0x32A4586797E3f561F41C0F47CA57eD08D64f3dC0', name: 'RocketSwap LGNS/DAI primary pool' },
]

const ts = () => new Date().toISOString()

async function getJson(url, timeout = 15000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

async function rpc(url, method, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'rpc error')
  return json.result
}

const ethCall = (to, data) => rpc(ANUBIS_RPC, 'eth_call', [{ to, data }, 'latest'])
const hexToInt = (h) => (h ? Number.parseInt(h, 16) : 0)
const hexToBig = (h) => (h ? BigInt(h) : 0n)
const word = (hex, index) => '0x' + hex.slice(2 + index * 64, 2 + (index + 1) * 64)

const median = (arr) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

async function readPair(pair) {
  const [t0, t1, reserves] = await Promise.all([
    ethCall(pair.address, '0x0dfe1681'),
    ethCall(pair.address, '0xd21220a7'),
    ethCall(pair.address, '0x0902f1ac'),
  ])
  const token0 = '0x' + t0.slice(-40)
  const token1 = '0x' + t1.slice(-40)
  const r0raw = Number(hexToBig(word(reserves, 0)))
  const r1raw = Number(hexToBig(word(reserves, 1)))

  let price = null
  let daiReserve = null
  let lgnsReserve = null
  if (token0.toLowerCase() === LGNS.toLowerCase() && token1.toLowerCase() === DAI.toLowerCase()) {
    lgnsReserve = r0raw / 10 ** LGNS_DECIMALS
    daiReserve = r1raw / 1e18
    price = daiReserve / lgnsReserve
  } else if (token1.toLowerCase() === LGNS.toLowerCase() && token0.toLowerCase() === DAI.toLowerCase()) {
    daiReserve = r0raw / 1e18
    lgnsReserve = r1raw / 10 ** LGNS_DECIMALS
    price = daiReserve / lgnsReserve
  }
  return { ...pair, price, daiReserve, lgnsReserve, token0, token1 }
}

async function readPolygonPair() {
  const [t0, t1, reserves] = await Promise.all([
    rpc(POLYGON_RPC, 'eth_call', [{ to: POLYGON_PAIR, data: '0x0dfe1681' }, 'latest']),
    rpc(POLYGON_RPC, 'eth_call', [{ to: POLYGON_PAIR, data: '0xd21220a7' }, 'latest']),
    rpc(POLYGON_RPC, 'eth_call', [{ to: POLYGON_PAIR, data: '0x0902f1ac' }, 'latest']),
  ])
  const token0 = '0x' + t0.slice(-40)
  const token1 = '0x' + t1.slice(-40)
  const r0 = Number(hexToBig(word(reserves, 0)))
  const r1 = Number(hexToBig(word(reserves, 1)))

  if (token0.toLowerCase() === POLYGON_DAI.toLowerCase() && token1.toLowerCase() === POLYGON_LGNS.toLowerCase()) {
    const dai = r0 / 1e18
    const lgns = r1 / 10 ** LGNS_DECIMALS
    return { price: dai / lgns, liquidity: dai, reserveToken: lgns }
  }
  if (token1.toLowerCase() === POLYGON_DAI.toLowerCase() && token0.toLowerCase() === POLYGON_LGNS.toLowerCase()) {
    const dai = r1 / 1e18
    const lgns = r0 / 10 ** LGNS_DECIMALS
    return { price: dai / lgns, liquidity: dai, reserveToken: lgns }
  }
  throw new Error('unexpected polygon pair tokens')
}

async function buildPrice() {
  const pairs = []
  for (const p of PAIRS) {
    try {
      pairs.push(await readPair(p))
    } catch (e) {
      console.warn('pair failed', p.address, e.message)
    }
  }
  const valid = pairs.filter((p) => p.price && p.daiReserve)
  if (!valid.length) throw new Error('no valid pairs')

  valid.sort((a, b) => (b.daiReserve || 0) - (a.daiReserve || 0))
  const primary = valid[0]
  const prices = valid.map((p) => p.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)

  let blockscoutPrice = null
  try {
    const token = await getJson(`${ANUBIS_API}/tokens/${LGNS}`)
    blockscoutPrice = token.exchange_rate ? Number(token.exchange_rate) : null
  } catch (e) {
    console.warn('blockscout price failed', e.message)
  }

  let polygon = null
  try {
    const p = await readPolygonPair()
    polygon = {
      chain: 'polygon',
      price: p.price,
      pair: POLYGON_PAIR,
      token: POLYGON_LGNS,
      liquidity: p.liquidity,
      reserveToken: p.reserveToken,
    }
  } catch (e) {
    console.warn('polygon price failed', e.message)
  }

  const sources = valid.map((p) => ({
    name: p.name,
    pair: p.address,
    price: p.price,
    liquidityUsd: p.daiReserve,
    weight: p.daiReserve > 5_000_000 ? 3 : 2,
  }))
  if (blockscoutPrice) {
    sources.push({ name: 'Blockscout quote', price: blockscoutPrice, weight: 2 })
  }
  const all = sources.map((s) => s.price)
  const spread = Math.max(...all) / Math.min(...all)
  const depth = primary.daiReserve || 0

  if (polygon) {
    sources.push({
      name: 'QuickSwap LGNS/DAI (Polygon)',
      pair: POLYGON_PAIR,
      price: polygon.price,
      liquidityUsd: polygon.liquidity,
      weight: 3,
    })
  }

  return {
    primary: primary.price,
    low: Math.min(...all),
    high: Math.max(...all),
    spread,
    confidence: spread < 1.05 && depth > 5_000_000 ? 'high' : spread < 1.2 ? 'medium' : 'low',
    sources,
    polygon,
    crossChainSpread: polygon ? polygon.price / primary.price : undefined,
    ts: ts(),
  }
}

async function buildToken(price) {
  const token = await getJson(`${ANUBIS_API}/tokens/${LGNS}`)
  let holders = []
  try {
    const res = await getJson(`${ANUBIS_API}/tokens/${LGNS}/holders`)
    holders = res.items || []
  } catch (e) {
    console.warn('holders failed', e.message)
  }

  const totalSupply = Number(token.total_supply) / 10 ** LGNS_DECIMALS
  const mapped = holders.map((h) => {
    const value = Number(h.value) / 10 ** LGNS_DECIMALS
    return {
      address: h.address?.hash || '',
      value,
      share: totalSupply ? value / totalSupply : 0,
      isContract: Boolean(h.address?.is_contract),
      name: h.address?.name || null,
    }
  })

  const top10 = mapped.slice(0, 10)
  const eoas = mapped.filter((h) => !h.isContract)

  return {
    address: LGNS,
    symbol: token.symbol || 'LGNS',
    name: token.name || 'Longinus',
    decimals: LGNS_DECIMALS,
    totalSupply,
    holders: Number(token.holders_count || 0),
    price,
    marketCap: totalSupply * price,
    volume24h: Number(token.volume_24h || 0),
    topHolders: top10,
    concentration: {
      top1: top10[0]?.share || 0,
      top10: top10.reduce((a, h) => a + h.share, 0),
      top1Eoa: eoas[0]?.share || 0,
      top10Eoa: eoas.slice(0, 10).reduce((a, h) => a + h.share, 0),
    },
    stakingBalance: top10.find((h) => h.address.toLowerCase() === STAKING.toLowerCase())?.value || 0,
    ts: ts(),
  }
}

async function buildStakingFlow() {
  let items = []
  let params = null
  for (let i = 0; i < 3; i++) {
    const qs = params ? '&' + new URLSearchParams(params).toString() : ''
    const url = `${ANUBIS_API}/addresses/${STAKING}/token-transfers?token=${LGNS}${qs}`
    const d = await getJson(url)
    items = items.concat(d.items || [])
    params = d.next_page_params
    if (!params) break
  }
  if (items.length < 10) return null

  const times = items.map((x) => new Date(x.timestamp).getTime())
  const spanSec = (Math.max(...times) - Math.min(...times)) / 1000
  if (!spanSec || spanSec <= 0) return null

  const claims = items.filter((x) => x.method === CLAIM_INTEREST)
  const amounts = claims.map((x) => Number(x.total?.value || 0) / 10 ** LGNS_DECIMALS)
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
    ts: ts(),
  }
}

async function buildStats() {
  const [stats, latestHex, flow] = await Promise.all([
    getJson(`${ANUBIS_API}/stats`),
    rpc(ANUBIS_RPC, 'eth_blockNumber', []),
    buildStakingFlow().catch((e) => {
      console.warn('flow failed', e.message)
      return null
    }),
  ])

  const latest = hexToInt(latestHex)
  const sampleBlocks = 86400
  const old = latest - sampleBlocks

  const [blockNow, blockOld] = await Promise.all([
    rpc(ANUBIS_RPC, 'eth_getBlockByNumber', ['0x' + latest.toString(16), false]),
    rpc(ANUBIS_RPC, 'eth_getBlockByNumber', ['0x' + old.toString(16), false]),
  ])
  const tNow = hexToInt(blockNow.timestamp)
  const tOld = hexToInt(blockOld.timestamp)
  const span = Math.max(1, tNow - tOld)
  const blocksPerDay = (sampleBlocks / span) * 86400

  let feeSample = 0
  let feeSum = 0
  let blockReward = null
  const blocks = []
  for (let i = 0; i < 12; i++) {
    try {
      const b = await getJson(`${ANUBIS_API}/blocks/${latest - i}`)
      feeSample += 1
      feeSum += Number(b.transaction_fees || 0) / 1e18
      if (i === 0) {
        blockReward = Array.isArray(b.rewards) && b.rewards.length ? Number(b.rewards[0]?.reward || 0) : 0
      }
      if (i < 6) {
        blocks.push({
          height: b.height,
          txs: b.transactions_count ?? null,
          gasUsed: b.gas_used_percentage ?? null,
          timestamp: b.timestamp,
        })
      }
    } catch (e) {
      // skip
    }
  }
  const avgBlockFee = feeSample ? feeSum / feeSample : null

  let polygon = {
    chainId: 137,
    blockNumber: 0,
    gasPriceGwei: 0,
    blockTime: null,
    blocksPerDay: null,
    simpleTransferFee: null,
  }
  try {
    const [ph, gp] = await Promise.all([
      rpc(POLYGON_RPC, 'eth_blockNumber', []),
      rpc(POLYGON_RPC, 'eth_gasPrice', []),
    ])
    const pLatest = hexToInt(ph)
    const pSample = 43200
    const [pNow, pOld] = await Promise.all([
      rpc(POLYGON_RPC, 'eth_getBlockByNumber', ['0x' + pLatest.toString(16), false]),
      rpc(POLYGON_RPC, 'eth_getBlockByNumber', ['0x' + (pLatest - pSample).toString(16), false]),
    ])
    const ptNow = hexToInt(pNow.timestamp)
    const ptOld = hexToInt(pOld.timestamp)
    const pSpan = Math.max(1, ptNow - ptOld)
    const gasGwei = Number(hexToBig(gp)) / 1e9
    polygon = {
      chainId: 137,
      blockNumber: pLatest,
      gasPriceGwei: gasGwei,
      blockTime: pSpan / pSample,
      blocksPerDay: (pSample / pSpan) * 86400,
      simpleTransferFee: (gasGwei * 21000) / 1e9,
    }
  } catch (e) {
    console.warn('polygon failed', e.message)
  }

  return {
    anubis: {
      chainId: 6714,
      blockNumber: Number(stats.total_blocks || latest),
      blockTime: span / sampleBlocks,
      totalAddresses: Number(stats.total_addresses || 0),
      totalTransactions: Number(stats.total_transactions || 0),
      txToday: Number(stats.transactions_today || 0),
      gas: stats.gas_prices || { slow: null, average: null, fast: null },
      utilization: Number(stats.network_utilization_percentage || 0),
      nativePrice: Number(stats.coin_price || 1),
      blocksPerDay,
      blockReward,
      avgBlockFee,
      dailyFee: avgBlockFee !== null ? avgBlockFee * blocksPerDay : null,
      feeSample,
    },
    polygon,
    stakingFlow: flow,
    blocks,
    ts: ts(),
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true })

  const seed = JSON.parse(await fs.readFile(path.join(root, 'shared', 'news-seed.json'), 'utf8'))

  let price = null
  try {
    price = await buildPrice()
    console.log('price', price.primary, 'polygon', price.polygon?.price, 'spread', price.crossChainSpread)
  } catch (e) {
    console.error('price failed', e.message)
  }

  let token = null
  try {
    token = await buildToken(price?.primary || 0)
    console.log('token', token.totalSupply, token.holders)
  } catch (e) {
    console.error('token failed', e.message)
  }

  let stats = null
  try {
    stats = await buildStats()
    console.log(
      'stats',
      stats.anubis.blockNumber,
      'blocks/day',
      stats.anubis.blocksPerDay,
      'claims/day',
      stats.stakingFlow?.claimsPerDay,
    )
  } catch (e) {
    console.error('stats failed', e.message)
  }

  const write = async (name, data) => {
    await fs.writeFile(path.join(outDir, name), JSON.stringify(data, null, 2))
  }

  if (stats) await write('stats.json', { ok: true, data: stats, ts: stats.ts, stale: false })
  if (stats?.stakingFlow) await write('flow.json', { ok: true, data: stats.stakingFlow, ts: stats.stakingFlow.ts, stale: false })
  if (price) await write('price.json', { ok: true, data: price, ts: price.ts, stale: false })
  if (token) await write('token.json', { ok: true, data: token, ts: token.ts, stale: false })
  await write('news.json', {
    ok: true,
    data: { items: seed.items },
    ts: ts(),
    stale: true,
    sources: [{ name: '人工核验 + 官方/媒体公开页面' }],
  })

  console.log('snapshot written to', outDir)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
