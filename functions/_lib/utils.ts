import type { ApiWarning, Bi, SourceInfo } from '../../shared/types'

export interface EnvelopeOptions {
  ttl?: number
  swr?: number
  stale?: boolean
  sources?: SourceInfo[]
  warnings?: ApiWarning[]
  private?: boolean
}

export function json<T>(data: T, options: EnvelopeOptions = {}) {
  const {
    ttl = 300,
    swr = 900,
    stale = false,
    sources = [],
    warnings = [],
    private: privateResponse = false,
  } = options
  return new Response(
    JSON.stringify({
      ok: true,
      data,
      retrievedAt: new Date().toISOString(),
      stale,
      sources,
      warnings,
    }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': privateResponse
          ? 'private, no-store'
          : `public, s-maxage=${ttl}, stale-while-revalidate=${swr}`,
      },
    },
  )
}

export function fail(code: string, status = 503, detail?: string) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: code,
      detail,
      retrievedAt: new Date().toISOString(),
      sources: [],
      warnings: [],
    }),
    {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  )
}

interface CacheContext {
  waitUntil?: (promise: Promise<unknown>) => void
}

const inflight = new Map<string, Promise<Response>>()

export async function cached(
  request: Request,
  ttl: number,
  swr: number,
  fn: () => Promise<Response>,
  ctx?: CacheContext,
) {
  const cache = (globalThis as unknown as { caches?: { default: Cache } }).caches?.default
  if (!cache) return fn()

  const key = new Request(request.url, { method: 'GET' })

  const refresh = async (): Promise<Response> => {
    const existing = inflight.get(key.url)
    if (existing) return existing
    const task = (async () => {
      const response = await fn()
      if (!response.ok) return response
      const body = await response.clone().text()
      const headers = new Headers(response.headers)
      headers.set('cache-control', `public, s-maxage=${ttl + swr}`)
      headers.set('x-awake-stored-at', String(Date.now()))
      await cache.put(key, new Response(body, { status: response.status, headers })).catch(() => undefined)
      return response
    })().finally(() => inflight.delete(key.url))
    inflight.set(key.url, task)
    return task
  }

  try {
    const hit = await cache.match(key)
    if (!hit) return await refresh()

    const storedAt = Number(hit.headers.get('x-awake-stored-at') || 0)
    const age = storedAt ? (Date.now() - storedAt) / 1000 : ttl + swr + 1

    if (age <= ttl) return hit

    if (age <= ttl + swr) {
      const job = refresh().catch(() => hit)
      if (ctx?.waitUntil) ctx.waitUntil(job)
      else void job
      const headers = new Headers(hit.headers)
      headers.set('x-awake-stale', '1')
      headers.set('cache-control', 'public, s-maxage=30, stale-while-revalidate=0')
      return new Response(await hit.text(), { status: hit.status, headers })
    }

    try {
      return await refresh()
    } catch {
      if (storedAt && Date.now() - storedAt < 6 * 60 * 60 * 1000) {
        const headers = new Headers(hit.headers)
        headers.set('x-awake-stale', '1')
        headers.set('cache-control', 'private, no-store')
        return new Response(await hit.text(), { status: hit.status, headers })
      }
      throw new Error('no fresh or stale response')
    }
  } catch {
    return fn()
  }
}

export async function fetchJson<T>(url: string, timeout = 10_000, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 (compatible; AwakeChainDesk/2.0)',
        ...(init?.headers ?? {}),
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchText(url: string, timeout = 10_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml,application/xml,text/xml,text/html,*/*',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchTextPartial(
  url: string,
  minArticleCards = 8,
  maxBytes = 220_000,
  timeout = 24_000,
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!response.body) return await response.text()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let text = ''
    let received = 0
    while (received < maxBytes) {
      const chunk = await reader.read()
      if (chunk.done) break
      received += chunk.value.byteLength
      text += decoder.decode(chunk.value, { stream: true })
      const cardCount = (text.match(/<a\s+href="\/news\/\d+"/gi) || []).length
      const closeCount = (text.match(/<\/a>/gi) || []).length
      if (cardCount >= minArticleCards && closeCount >= minArticleCards) break
    }
    text += decoder.decode()
    await reader.cancel().catch(() => undefined)
    return text
  } finally {
    clearTimeout(timer)
  }
}

export interface RpcCall {
  method: string
  params: unknown[]
}

export async function rpcBatch(
  urls: string[],
  calls: RpcCall[],
  timeout = 12_000,
): Promise<Array<any>> {
  if (!calls.length) return []
  let lastError: unknown

  for (const url of urls) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (compatible; AwakeChainDesk/2.0)',
        },
        body: JSON.stringify(calls.map((call, index) => ({ jsonrpc: '2.0', id: index + 1, ...call }))),
      })
      if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)
      const payload = (await response.json()) as Array<{
        id?: number
        result?: string | null
        error?: { message?: string }
      }>
      if (!Array.isArray(payload)) throw new Error('RPC response is not a batch')
      const byId = new Map(payload.map((item) => [item.id, item]))
      const values = calls.map((_, index) => byId.get(index + 1)?.result ?? null)
      if (values.some((value) => value !== null)) return values
      lastError = new Error('RPC returned no usable result')
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All RPC endpoints failed')
}

export const paddedAddress = (address: string) =>
  address.toLowerCase().replace(/^0x/, '').padStart(64, '0')

export const addressWord = (word: string | null) =>
  word ? `0x${word.slice(-40)}` : null

export const word = (hex: string | null | undefined, index: number) => {
  if (!hex) return null
  const body = hex.startsWith('0x') ? hex.slice(2) : hex
  const part = body.slice(index * 64, (index + 1) * 64)
  return part.length === 64 ? `0x${part}` : null
}

export const toBigInt = (hex: string | null | undefined) => {
  if (!hex || hex === '0x') return 0n
  try {
    return BigInt(hex)
  } catch {
    return 0n
  }
}

export const formatUnits = (raw: bigint, decimals: number): number => {
  const base = 10n ** BigInt(decimals)
  const whole = raw / base
  const fraction = raw % base
  const fractionText = fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
  return Number(fractionText ? `${whole}.${fractionText}` : whole.toString())
}

export const median = (values: number[]): number | null => {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!valid.length) return null
  const middle = Math.floor(valid.length / 2)
  return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2
}

export const warning = (
  code: string,
  zh: string,
  en: string,
  source?: string,
): ApiWarning => ({
  code,
  message: { zh, en } satisfies Bi,
  source,
})

export const isoNow = () => new Date().toISOString()
