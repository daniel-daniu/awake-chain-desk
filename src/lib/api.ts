import { useQuery } from '@tanstack/react-query'
import type {
  ApiEnvelope,
  CoreData,
  EcosystemData,
  HomeData,
  NewsData,
  PortfolioData,
  ProductsData,
} from '../types'

export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status = 0, code = 'API_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, timeout = 30_000): Promise<ApiEnvelope<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(`/api${path}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
    if (!response.ok || !payload?.ok) {
      throw new ApiError(
        payload?.error || `HTTP ${response.status}`,
        response.status,
        payload?.error || 'REQUEST_FAILED',
      )
    }
    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 0, 'TIMEOUT')
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  } finally {
    clearTimeout(timer)
  }
}

export const useHome = () =>
  useQuery({
    queryKey: ['home'],
    queryFn: () => request<HomeData>('/home'),
    refetchInterval: 10 * 60_000,
    staleTime: 8 * 60_000,
    retry: 1,
  })

export const useChains = () =>
  useQuery({
    queryKey: ['chains'],
    queryFn: () => request<CoreData>('/chains'),
    refetchInterval: 15 * 60_000,
    staleTime: 12 * 60_000,
    retry: 1,
  })

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => request<ProductsData>('/products'),
    refetchInterval: 30 * 60_000,
    staleTime: 24 * 60_000,
    retry: 1,
  })

export const useEcosystem = () =>
  useQuery({
    queryKey: ['ecosystem'],
    queryFn: () => request<EcosystemData>('/ecosystem'),
    refetchInterval: 10 * 60_000,
    staleTime: 8 * 60_000,
    retry: 1,
  })

export const useNews = () =>
  useQuery({
    queryKey: ['news'],
    queryFn: () => request<NewsData>('/news?scope=latest', 60_000),
    refetchInterval: 15 * 60_000,
    staleTime: 10 * 60_000,
    retry: 1,
  })

export const usePortfolio = (address: string | null) =>
  useQuery({
    queryKey: ['portfolio', address?.toLowerCase()],
    queryFn: () => request<PortfolioData>(`/portfolio?address=${encodeURIComponent(address!)}`, 20_000),
    enabled: Boolean(address),
    refetchInterval: 90_000,
    staleTime: 60_000,
    retry: 1,
  })
