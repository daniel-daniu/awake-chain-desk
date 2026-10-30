import { json, fail, cached, fetchJson, rpcBatch, word, toBig } from '../_lib/utils'

const ANUBIS_RPC = 'https://rpc.anubispace.org'
const POLYGON_RPC = 'https://polygon-bor-rpc.publicnode.com'
const API = 'https://browser.anubispace.org/api/v2'

const LGNS = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const DAI = '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14'
const ANUBIS_PAIR = '0x32A4586797E3f561F41C0F47CA57eD08D64f3dC0'
const LGNS_DECIMALS = 9

const POLYGON_LGNS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01'
const POLYGON_DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
const POLYGON_PAIR = '0x882df4B0fB50a229C3B4124EB18c759911485bFb'

const pairCalls = (pair: string) => [
  { method: 'eth_call', params: [{ to: pair, data: '0x0dfe1681' }, 'latest'] },
  { method: 'eth_call', params: [{ to: pair, data: '0xd21220a7' }, 'latest'] },
  { method: 'eth_call', params: [{ to: pair, data: '0x0902f1ac' }, 'latest'] },
]

const same = (a: string | null, b: string) => Boolean(a && a.toLowerCase().endsWith(b.slice(2).toLowerCase()))

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 120, 600, async () => {
    try {
      const [token, aRpc, pRpc] = await Promise.all([
        fetchJson<{ exchange_rate?: string }>(`${API}/tokens/${LGNS}`),
        rpcBatch(ANUBIS_RPC, pairCalls(ANUBIS_PAIR)).catch(() => [null, null, null]),
        rpcBatch(POLYGON_RPC, pairCalls(POLYGON_PAIR)).catch(() => [null, null, null]),
      ])

      let anubisPrice: number | null = null
      let anubisDai = 0
      const a0 = word(aRpc[0], 0)
      const a1 = word(aRpc[1], 0)
      const ar0 = toBig(word(aRpc[2], 0))
      const ar1 = toBig(word(aRpc[2], 1))
      if (same(a0, LGNS) && same(a1, DAI)) {
        anubisDai = Number(ar1) / 1e18
        anubisPrice = anubisDai / (Number(ar0) / 10 ** LGNS_DECIMALS)
      } else if (same(a0, DAI) && same(a1, LGNS)) {
        anubisDai = Number(ar0) / 1e18
        anubisPrice = anubisDai / (Number(ar1) / 10 ** LGNS_DECIMALS)
      }

      let polygon: any = null
      const p0 = word(pRpc[0], 0)
      const p1 = word(pRpc[1], 0)
      const pr0 = toBig(word(pRpc[2], 0))
      const pr1 = toBig(word(pRpc[2], 1))
      if (same(p0, POLYGON_DAI) && same(p1, POLYGON_LGNS)) {
        const dai = Number(pr0) / 1e18
        const lgns = Number(pr1) / 10 ** LGNS_DECIMALS
        polygon = { price: dai / lgns, liquidity: dai, reserveToken: lgns }
      } else if (same(p0, POLYGON_LGNS) && same(p1, POLYGON_DAI)) {
        const dai = Number(pr1) / 1e18
        const lgns = Number(pr0) / 10 ** LGNS_DECIMALS
        polygon = { price: dai / lgns, liquidity: dai, reserveToken: lgns }
      }

      const explorerPrice = token.exchange_rate ? Number(token.exchange_rate) : null
      const sources: any[] = []
      if (anubisPrice) {
        sources.push({
          name: 'RocketSwap LGNS/DAI primary pool',
          pair: ANUBIS_PAIR,
          price: anubisPrice,
          liquidityUsd: anubisDai,
          weight: 3,
        })
      }
      if (explorerPrice) {
        sources.push({ name: 'Blockscout quote', price: explorerPrice, weight: 2 })
      }
      if (!sources.length) return fail('NO_PRICE')

      const prices = sources.map((s) => s.price)
      const low = Math.min(...prices)
      const high = Math.max(...prices)
      const spread = high / low
      const primary = anubisPrice ?? explorerPrice ?? 0

      const polygonOut = polygon
        ? {
            chain: 'polygon',
            price: polygon.price,
            pair: POLYGON_PAIR,
            token: POLYGON_LGNS,
            liquidity: polygon.liquidity,
            reserveToken: polygon.reserveToken,
          }
        : undefined

      if (polygonOut) {
        sources.push({
          name: 'QuickSwap LGNS/DAI (Polygon)',
          pair: POLYGON_PAIR,
          price: polygonOut.price,
          liquidityUsd: polygonOut.liquidity,
          weight: 3,
        })
      }

      return json(
        {
          primary,
          low,
          high,
          spread,
          confidence: spread < 1.05 ? 'high' : spread < 1.2 ? 'medium' : 'low',
          sources,
          polygon: polygonOut,
          crossChainSpread: polygonOut ? polygonOut.price / primary : undefined,
          ts: new Date().toISOString(),
        },
        {
          ttl: 120,
          swr: 600,
          sources: [{ name: 'Anubis RPC' }, { name: 'Polygon RPC' }, { name: 'Blockscout' }],
        },
      )
    } catch (e) {
      return fail('PRICE_UPSTREAM')
    }
  }, context)
}
