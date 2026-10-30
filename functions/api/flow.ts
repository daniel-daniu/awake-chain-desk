import { json, fail, cached, fetchJson } from '../_lib/utils'

const API = 'https://browser.anubispace.org/api/v2'
const LGNS = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const STAKING = '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228'
const CLAIM_INTEREST = '0xd286f3cf'

const median = (arr: number[]) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

async function buildStakingFlow() {
  let items: any[] = []
  let params: Record<string, unknown> | null = null
  for (let i = 0; i < 1; i++) {
    const qs = params ? '&' + new URLSearchParams(params as any).toString() : ''
    const d = await fetchJson<{ items?: any[]; next_page_params?: Record<string, unknown> }>(
      `${API}/addresses/${STAKING}/token-transfers?token=${LGNS}${qs}`,
      12000,
    )
    items = items.concat(d.items || [])
    params = d.next_page_params || null
    if (!params) break
  }
  if (items.length < 10) return null

  const times = items.map((x) => new Date(x.timestamp).getTime())
  const spanSec = (Math.max(...times) - Math.min(...times)) / 1000
  if (!spanSec || spanSec <= 0) return null

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

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 600, 1800, async () => {
    try {
      const flow = await buildStakingFlow()
      if (!flow) return fail('FLOW_EMPTY')
      return json(flow, {
        ttl: 600,
        swr: 1800,
        sources: [{ name: 'claimInterest transfer sample' }, { name: 'Blockscout' }],
      })
    } catch (e) {
      console.error('FLOW_ERR', e)
      return fail('FLOW_UPSTREAM')
    }
  }, context)
}
