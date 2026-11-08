import { CHAINS, HELIX, LGNS } from '../../shared/contracts'
import type { ApiWarning, PortfolioBalances, PortfolioData } from '../../shared/types'
import { addressWord, formatUnits, isoNow, paddedAddress, rpcBatch, toBigInt, warning, word } from '../_lib/utils'

const SELECTOR = {
  balanceOf: '0x70a08231',
  totalSupply: '0x18160ddd',
  token0: '0x0dfe1681',
  token1: '0xd21220a7',
  reserves: '0x0902f1ac',
  activePowerOf: '0x6cf2fa36',
  pendingPowerOf: '0xaa81a38f',
  totalPowerOf: '0x4f343040',
  accruedOf: '0xea0c88b2',
}

const balanceCall = (token: string, owner: string) => ({
  method: 'eth_call',
  params: [{ to: token, data: `${SELECTOR.balanceOf}${paddedAddress(owner)}` }, 'latest'],
})

const emptyBalances = (): PortfolioBalances => ({
  native: null,
  lgns: null,
  glgns: null,
  aiLgns: null,
  lp: null,
  lpShare: null,
  poolLgns: null,
  poolDai: null,
})

function parseNative(value: unknown) {
  return typeof value === 'string' ? formatUnits(toBigInt(value), 18) : null
}

function parseToken(value: unknown, decimals: number) {
  return typeof value === 'string' ? formatUnits(toBigInt(value), decimals) : null
}

async function readAnubis(owner: string): Promise<PortfolioBalances> {
  const values = await rpcBatch(CHAINS.anubis.rpc, [
    { method: 'eth_getBalance', params: [owner, 'latest'] },
    balanceCall(LGNS.anubis.token, owner),
    balanceCall(HELIX.glgns, owner),
    balanceCall(HELIX.token, owner),
    balanceCall(LGNS.anubis.pair, owner),
    { method: 'eth_call', params: [{ to: LGNS.anubis.pair, data: SELECTOR.totalSupply }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.anubis.pair, data: SELECTOR.reserves }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.anubis.pair, data: SELECTOR.token0 }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.anubis.pair, data: SELECTOR.token1 }, 'latest'] },
  ])
  const token0 = addressWord(word(values[7], 0))
  const token1 = addressWord(word(values[8], 0))
  const raw0 = toBigInt(word(values[6], 0))
  const raw1 = toBigInt(word(values[6], 1))
  const lgnsFirst = token0?.toLowerCase() === LGNS.anubis.token.toLowerCase()
  const poolLgns = lgnsFirst ? formatUnits(raw0, 9) : formatUnits(raw1, 9)
  const poolDai = lgnsFirst ? formatUnits(raw1, 18) : formatUnits(raw0, 18)
  const lp = parseToken(values[4], 18)
  const lpTotal = parseToken(values[5], 18)
  return {
    native: parseNative(values[0]),
    lgns: parseToken(values[1], 9),
    glgns: parseToken(values[2], 18),
    aiLgns: parseToken(values[3], 18),
    lp,
    lpShare: lp !== null && lpTotal ? lp / lpTotal : null,
    poolLgns,
    poolDai,
    ...(token0 && token1 ? {} : {}),
  }
}

async function readPolygon(owner: string): Promise<PortfolioBalances> {
  const values = await rpcBatch(CHAINS.polygon.rpc, [
    { method: 'eth_getBalance', params: [owner, 'latest'] },
    balanceCall(LGNS.polygon.token, owner),
    balanceCall(LGNS.polygon.pair, owner),
    { method: 'eth_call', params: [{ to: LGNS.polygon.pair, data: SELECTOR.totalSupply }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.polygon.pair, data: SELECTOR.reserves }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.polygon.pair, data: SELECTOR.token0 }, 'latest'] },
    { method: 'eth_call', params: [{ to: LGNS.polygon.pair, data: SELECTOR.token1 }, 'latest'] },
  ])
  const token0 = addressWord(word(values[5], 0))
  const lgnsFirst = token0?.toLowerCase() === LGNS.polygon.token.toLowerCase()
  const raw0 = toBigInt(word(values[4], 0))
  const raw1 = toBigInt(word(values[4], 1))
  const poolLgns = lgnsFirst ? formatUnits(raw0, 9) : formatUnits(raw1, 9)
  const poolDai = lgnsFirst ? formatUnits(raw1, 18) : formatUnits(raw0, 18)
  const lp = parseToken(values[2], 18)
  const lpTotal = parseToken(values[3], 18)
  return {
    native: parseNative(values[0]),
    lgns: parseToken(values[1], 9),
    glgns: null,
    aiLgns: null,
    lp,
    lpShare: lp !== null && lpTotal ? lp / lpTotal : null,
    poolLgns,
    poolDai,
  }
}

async function readHelixPower(owner: string) {
  const calls = [
    SELECTOR.activePowerOf,
    SELECTOR.pendingPowerOf,
    SELECTOR.totalPowerOf,
    SELECTOR.accruedOf,
  ]
  const values = await rpcBatch(
    CHAINS.anubis.rpc,
    calls.map((selector) => ({
      method: 'eth_call',
      params: [{ to: HELIX.ledger, data: `${selector}${paddedAddress(owner)}` }, 'latest'],
    })),
  )
  return {
    activePower: parseToken(values[0], 18),
    pendingPower: parseToken(values[1], 18),
    totalPower: parseToken(values[2], 18),
    accruedAiLgns: parseToken(values[3], 18),
  }
}

export const onRequestGet = async (context: any) => {
  const url = new URL(context.request.url)
  const address = url.searchParams.get('address') || ''
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'INVALID_ADDRESS',
        retrievedAt: isoNow(),
        sources: [],
        warnings: [],
      }),
      {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      },
    )
  }

  const warnings: ApiWarning[] = []
  const [anubisResult, polygonResult, helixResult] = await Promise.allSettled([
    readAnubis(address),
    readPolygon(address),
    readHelixPower(address),
  ])

  if (anubisResult.status === 'rejected') {
    warnings.push(warning('ANUBIS_WALLET', 'Anubis 仓位暂时不可读。', 'Anubis positions are unavailable.', 'Anubis RPC'))
  }
  if (polygonResult.status === 'rejected') {
    warnings.push(warning('POLYGON_WALLET', 'Polygon 仓位暂时不可读。', 'Polygon positions are unavailable.', 'Polygon RPC'))
  }
  if (helixResult.status === 'rejected') {
    warnings.push(warning('HELIX_WALLET', 'HELIX Power 暂时不可读。', 'HELIX Power is unavailable.', 'Anubis RPC'))
  }

  const data: PortfolioData = {
    address,
    anubis: anubisResult.status === 'fulfilled' ? anubisResult.value : emptyBalances(),
    polygon: polygonResult.status === 'fulfilled' ? polygonResult.value : emptyBalances(),
    helix:
      helixResult.status === 'fulfilled'
        ? helixResult.value
        : { activePower: null, pendingPower: null, totalPower: null, accruedAiLgns: null },
    observedAt: isoNow(),
    warnings,
  }

  return new Response(
    JSON.stringify({
      ok: true,
      data,
      retrievedAt: data.observedAt,
      stale: false,
      sources: [
        {
          id: 'anubis-rpc',
          name: 'Anubis RPC',
          kind: 'rpc',
          status: anubisResult.status === 'fulfilled' ? 'ok' : 'error',
          retrievedAt: data.observedAt,
        },
        {
          id: 'polygon-rpc',
          name: 'Polygon RPC',
          kind: 'rpc',
          status: polygonResult.status === 'fulfilled' ? 'ok' : 'error',
          retrievedAt: data.observedAt,
        },
      ],
      warnings,
    }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, no-store',
      },
    },
  )
}
