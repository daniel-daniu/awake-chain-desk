import { json, fail, cached, fetchJson, rpcBatch, word, toBig } from '../_lib/utils'

const A = 'https://rpc.anubispace.org'
const P = 'https://polygon-bor-rpc.publicnode.com'
const PA = 'https://polygon.drpc.org'
const API = 'https://browser.anubispace.org/api/v2'

const LGNS_A = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const DAI_A = '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14'
const PAIR_A = '0x32A4586797E3f561F41C0F47CA57eD08D64f3dC0'
const GLGNS = '0xf140a92C156e76F5A1d3D6f96284b250330F8F4c'
const GPAIR = '0x8c4ea5dac01e2e8fb67f50201aa2e10a6949c58d'
const STAKING_A = '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228'

const LGNS_P = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01'
const DAI_P = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
const PAIR_P = '0x882df4B0fB50a229C3B4124EB18c759911485bFb'
const SLGNS = '0x99a57E6C8558BC6689f894e068733ADf83C19725'

const SEL = {
  token0: '0x0dfe1681',
  token1: '0xd21220a7',
  reserves: '0x0902f1ac',
  totalSupply: '0x18160ddd',
  feeRatio: '0x41744dd4',
  buyFeeRatio: '0xbffad1ad',
  precision: '0xaaf5eb68',
  index: '0x2986c0e5',
}

const hex = (n: number) => '0x' + n.toString(16)
const call = (to: string, data: string, tag = 'latest') => ({ method: 'eth_call', params: [{ to, data }, tag] })
const same = (a: string | null, b: string) => Boolean(a && a.toLowerCase().endsWith(b.slice(2).toLowerCase()))
const pct = (a: number, b: number) => (b ? a / b - 1 : 0)

async function chunked(url: string, calls: any[], size = 16) {
  const out: any[] = []
  for (let i = 0; i < calls.length; i += size) {
    const part = await rpcBatch(url, calls.slice(i, i + size)).catch(() => [])
    out.push(...part)
  }
  return out
}

function pairFrom(results: any[], lgns: string, dai: string) {
  const t0 = word(results[0], 0)
  const t1 = word(results[1], 0)
  const r0 = toBig(word(results[2], 0))
  const r1 = toBig(word(results[2], 1))
  if (same(t0, lgns) && same(t1, dai)) {
    const l = Number(r0) / 1e9
    const d = Number(r1) / 1e18
    return { price: d / l, liquidity: d, reserveToken: l }
  }
  if (same(t0, dai) && same(t1, lgns)) {
    const d = Number(r0) / 1e18
    const l = Number(r1) / 1e9
    return { price: d / l, liquidity: d, reserveToken: l }
  }
  return null
}

function pairG(results: any[]) {
  const t0 = word(results[0], 0)
  const t1 = word(results[1], 0)
  const r0 = toBig(word(results[2], 0))
  const r1 = toBig(word(results[2], 1))
  if (same(t0, DAI_A) && same(t1, GLGNS)) {
    const d = Number(r0) / 1e18
    const g = Number(r1) / 1e18
    return { price: d / g, liquidity: d, reserveToken: g }
  }
  if (same(t0, GLGNS) && same(t1, DAI_A)) {
    const d = Number(r1) / 1e18
    const g = Number(r0) / 1e18
    return { price: d / g, liquidity: d, reserveToken: g }
  }
  return null
}

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 600, 1800, async () => {
    try {
      const [aHead, pHead, stats] = await Promise.all([
        rpcBatch(A, [{ method: 'eth_blockNumber', params: [] }]),
        rpcBatch(P, [{ method: 'eth_blockNumber', params: [] }]),
        fetchJson<any>(`${API}/stats`).catch(() => ({})),
      ])
      const aNow = Number.parseInt(aHead[0] as string, 16)
      const pNow = Number.parseInt(pHead[0] as string, 16)
      const aOld = hex(aNow - 86400)
      const pOld = hex(pNow - 57600)
      const aLatest = hex(aNow)
      const pLatest = hex(pNow)

      const [aRes, pRes, pOldRes] = await Promise.all([
        chunked(A, [
          call(PAIR_A, SEL.token0),
          call(PAIR_A, SEL.token1),
          call(PAIR_A, SEL.reserves),
          call(GPAIR, SEL.token0),
          call(GPAIR, SEL.token1),
          call(GPAIR, SEL.reserves),
          call(LGNS_A, SEL.feeRatio),
          call(LGNS_A, SEL.buyFeeRatio),
          call(LGNS_A, SEL.precision),
          call(GLGNS, SEL.feeRatio),
          call(GLGNS, SEL.buyFeeRatio),
          call(GLGNS, SEL.precision),
          call(LGNS_A, SEL.totalSupply, aLatest),
          call(LGNS_A, SEL.totalSupply, aOld),
          call(STAKING_A, SEL.index, aLatest),
          call(STAKING_A, SEL.index, aOld),
        ]),
        chunked(P, [
          call(PAIR_P, SEL.token0),
          call(PAIR_P, SEL.token1),
          call(PAIR_P, SEL.reserves),
          call(LGNS_P, SEL.feeRatio),
          call(LGNS_P, SEL.buyFeeRatio),
          call(LGNS_P, SEL.precision),
          call(LGNS_P, SEL.totalSupply, pLatest),
          call(SLGNS, SEL.totalSupply, pLatest),
          call(SLGNS, SEL.index, pLatest),
          { method: 'eth_gasPrice', params: [] },
        ]),
        chunked(PA, [
          call(LGNS_P, SEL.totalSupply, pOld),
          call(SLGNS, SEL.totalSupply, pOld),
          call(SLGNS, SEL.index, pOld),
        ]),
      ])

      const aPair = pairFrom(aRes.slice(0, 3), LGNS_A, DAI_A)
      const gPair = pairG(aRes.slice(3, 6))
      const pPair = pairFrom(pRes.slice(0, 3), LGNS_P, DAI_P)

      const num = (hexVal: any, dec = 0) => Number(toBig(hexVal)) / 10 ** dec
      const ratioPct = (raw: any, prec: any) => {
        const p = Number(toBig(prec)) || 100000
        return (Number(toBig(raw)) / p) * 100
      }
      const aFee = ratioPct(aRes[6], aRes[8])
      const aBuy = ratioPct(aRes[7], aRes[8])
      const gFee = ratioPct(aRes[9], aRes[11])
      const gBuy = ratioPct(aRes[10], aRes[11])
      const pFee = ratioPct(pRes[3], pRes[5])
      const pBuy = ratioPct(pRes[4], pRes[5])

      const aSupplyNow = num(aRes[12], 9)
      const aSupplyOld = num(aRes[13], 9)
      const aIndexNow = num(aRes[14])
      const aIndexOld = num(aRes[15])
      const pSupplyNow = num(pRes[6], 9)
      const pSupplyOld = num(pOldRes[0], 9)
      const sSupplyNow = num(pRes[7], 9)
      const sSupplyOld = num(pOldRes[1], 9)
      const pIndexNow = num(pRes[8])
      const pIndexOld = num(pOldRes[2])

      const aDaily = pct(aSupplyNow, aSupplyOld)
      const pDaily = pct(pSupplyNow, pSupplyOld)
      const sDaily = pct(sSupplyNow, sSupplyOld)
      const idxDaily = pct(aIndexNow, aIndexOld)

      const gas = stats?.gas_prices || {}
      const aGwei = Number(gas.average || 0)
      const pGwei = num(pRes[9], 9)

      return json(
        {
          prices: {
            anubis: aPair,
            polygon: pPair,
            glgns: gPair,
          },
          taxes: {
            anubis: { feeRatio: aFee, buyRatio: aBuy, precision: 100000, taxPct: aFee, buyTaxPct: aBuy },
            polygon: { feeRatio: pFee, buyRatio: pBuy, precision: 100000, taxPct: pFee, buyTaxPct: pBuy },
            glgns: { feeRatio: gFee, buyRatio: gBuy, precision: 100000, taxPct: gFee, buyTaxPct: gBuy },
          },
          interest: {
            index: {
              now: aIndexNow,
              dayAgo: aIndexOld,
              dailyPct: idxDaily * 100,
              annualSimplePct: idxDaily * 365 * 100,
              annualCompoundPct: ((1 + idxDaily) ** 365 - 1) * 100,
            },
            anubisSupply: {
              now: aSupplyNow,
              dayAgo: aSupplyOld,
              delta: aSupplyNow - aSupplyOld,
              dailyPct: aDaily * 100,
              annualSimplePct: aDaily * 365 * 100,
            },
            polygonSupply: {
              now: pSupplyNow,
              dayAgo: pSupplyOld,
              delta: pSupplyNow - pSupplyOld,
              dailyPct: pDaily * 100,
              annualSimplePct: pDaily * 365 * 100,
            },
            slgnsSupply: {
              now: sSupplyNow,
              dayAgo: sSupplyOld,
              delta: sSupplyNow - sSupplyOld,
              dailyPct: sDaily * 100,
              annualSimplePct: sDaily * 365 * 100,
              annualCompoundPct: ((1 + sDaily) ** 365 - 1) * 100,
            },
            polygonIndex: {
              now: pIndexNow,
              dayAgo: pIndexOld,
              dailyPct: pct(pIndexNow, pIndexOld) * 100,
            },
          },
          gas: {
            anubis: {
              gwei: aGwei,
              simpleFee: (aGwei * 21000) / 1e9,
              contractFee: (aGwei * 150000) / 1e9,
            },
            polygon: {
              gwei: pGwei,
              simpleFee: (pGwei * 21000) / 1e9,
              contractFee: (pGwei * 150000) / 1e9,
            },
          },
          ts: new Date().toISOString(),
        },
        { ttl: 600, swr: 1800, sources: [{ name: 'Anubis RPC' }, { name: 'Polygon RPC' }, { name: 'Blockscout' }] },
      )
    } catch (e) {
      return fail('YIELD_UPSTREAM')
    }
  }, context)
}
