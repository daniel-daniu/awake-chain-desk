import { useQuery } from '@tanstack/react-query'
import { fetchFlowDirect, fetchNewsDirect, fetchPriceDirect, fetchStatsDirect, fetchTokenDirect } from './direct'
import type { EcosystemData, NewsItem, PriceData, StakingFlow, StatsData, TokenData, YieldData } from '../types'

export interface Loaded<T> {
  data: T
  ts: string
  stale: boolean
  origin: 'api' | 'direct' | 'snapshot'
}

interface EnvelopeLike<T> {
  ok?: boolean
  data?: T
  ts?: string
  stale?: boolean
}

async function fetchJson<T>(url: string, timeout = 6000): Promise<EnvelopeLike<T>> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status}`)
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('json')) throw new Error('not json')
    return (await res.json()) as EnvelopeLike<T>
  } finally {
    clearTimeout(timer)
  }
}

async function load<T>(
  apiPath: string,
  fallbackPath: string,
  direct: () => Promise<T>,
): Promise<Loaded<T>> {
  try {
    const json = await fetchJson<T>(`/api${apiPath}`)
    if (json && json.data !== undefined && json.ok !== false) {
      return {
        data: json.data,
        ts: json.ts || new Date().toISOString(),
        stale: Boolean(json.stale),
        origin: 'api',
      }
    }
  } catch {
    // fall through to direct
  }

  try {
    const data = await direct()
    return { data, ts: new Date().toISOString(), stale: false, origin: 'direct' }
  } catch (e) {
    console.warn('[data] direct failed for', apiPath, e)
  }

  const json = await fetchJson<T>(fallbackPath, 8000)
  if (!json.data) throw new Error('no fallback data')
  console.warn('[data] using bundled snapshot for', apiPath)
  return {
    data: json.data,
    ts: json.ts || new Date().toISOString(),
    stale: true,
    origin: 'snapshot',
  }
}

export const usePrice = () =>
  useQuery({
    queryKey: ['price'],
    queryFn: () => load<PriceData>('/price', '/fallback/price.json', fetchPriceDirect),
    refetchInterval: 120_000,
    staleTime: 100_000,
  })

export const useToken = () =>
  useQuery({
    queryKey: ['token'],
    queryFn: () => load<TokenData>('/token', '/fallback/token.json', () => fetchTokenDirect(0)),
    refetchInterval: 600_000,
    staleTime: 480_000,
  })

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: () => load<StatsData>('/stats', '/fallback/stats.json', fetchStatsDirect),
    refetchInterval: 300_000,
    staleTime: 240_000,
  })

export const useEcosystem = () =>
  useQuery({
    queryKey: ['ecosystem'],
    queryFn: async (): Promise<EcosystemData> => {
      const res = await fetch('/api/ecosystem', { headers: { accept: 'application/json' } })
      const json = await res.json()
      if (!json?.data) throw new Error('ecosystem unavailable')
      return json.data as EcosystemData
    },
    refetchInterval: 600_000,
    staleTime: 480_000,
  })

export const useYield = () =>
  useQuery({
    queryKey: ['yield'],
    queryFn: async (): Promise<YieldData> => {
      const res = await fetch('/api/yield', { headers: { accept: 'application/json' } })
      const json = await res.json()
      if (!json?.data) throw new Error('yield unavailable')
      return json.data as YieldData
    },
    refetchInterval: 600_000,
    staleTime: 480_000,
  })

export const useFlow = () =>
  useQuery({
    queryKey: ['flow'],
    queryFn: () => load<StakingFlow>('/flow', '/fallback/flow.json', fetchFlowDirect),
    refetchInterval: 600_000,
    staleTime: 480_000,
  })

export const useNews = () =>
  useQuery({
    queryKey: ['news'],
    queryFn: () => load<{ items: NewsItem[] }>('/news', '/fallback/news.json', fetchNewsDirect),
    refetchInterval: 1_800_000,
    staleTime: 1_200_000,
  })
