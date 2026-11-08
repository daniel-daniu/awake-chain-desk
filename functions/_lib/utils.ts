export interface EnvelopeOptions {
  ttl?: number
  swr?: number
  stale?: boolean
  sources?: { name: string; url?: string }[]
}

export const json = (data: unknown, opts: EnvelopeOptions = {}) => {
  const { ttl = 60, swr = 300, stale = false, sources = [] } = opts
  return new Response(
    JSON.stringify({ ok: true, data, ts: new Date().toISOString(), stale, sources }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, s-maxage=${ttl}, stale-while-revalidate=${swr}`,
        'access-control-allow-origin': '*',
      },
    },
  )
}

export const fail = (code: string, status = 503) =>
  new Response(JSON.stringify({ ok: false, error: code, ts: new Date().toISOString() }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  })

export interface CacheContext {
  waitUntil?: (promise: Promise<unknown>) => void
}

/** In-flight de-duplication so concurrent visitors on the same isolate share one upstream call. */
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
      const res = await fn()
      if (!res.ok) return res
      // Store a copy that outlives ttl so we can serve it stale while revalidating.
      const body = await res.clone().text()
      const headers = new Headers(res.headers)
      headers.set('cache-control', `public, s-maxage=${ttl + swr}`)
      headers.set('x-awake-cached-at', String(Date.now()))
      const copy = new Response(body, { status: res.status, headers })
      await cache.put(key, copy).catch(() => {})
      return res
    })().finally(() => inflight.delete(key.url))

    inflight.set(key.url, task)
    return task
  }

  try {
    const hit = await cache.match(key)
    if (!hit) return await refresh()

    const storedAt = Number(hit.headers.get('x-awake-cached-at') || 0)
    const age = storedAt ? (Date.now() - storedAt) / 1000 : ttl + swr + 1

    if (age <= ttl) return hit

    if (age <= ttl + swr) {
      // Stale but usable: answer now, refresh in the background.
      const job = refresh().catch(() => hit)
      if (ctx?.waitUntil) ctx.waitUntil(job)
      else void job
      const headers = new Headers(hit.headers)
      // 过期窗口内至少让边缘缓存 30 秒，避免每个请求都回源到函数
      const remaining = Math.max(30, Math.round(ttl - age))
      headers.set('cache-control', `public, s-maxage=${remaining}, stale-while-revalidate=0`)
      return new Response(await hit.text(), { status: hit.status, headers })
    }

    return await refresh()
  } catch {
    return fn()
  }
}

export async function fetchJson<T>(url: string, timeout = 8000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 (compatible; AwakeChainDesk/1.0)',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchText(url: string, timeout = 8000): Promise<string> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: 'application/rss+xml,application/xml,text/xml,text/html,*/*',
        'user-agent': 'Mozilla/5.0 (compatible; AwakeChainDesk/1.0)',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

export async function rpcBatch(
  url: string,
  calls: { method: string; params: unknown[] }[],
  timeout = 12000,
) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 (compatible; AwakeChainDesk/1.0)' },
      body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: '2.0', id: i + 1, ...c }))),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`rpc ${res.status}`)
    const arr = (await res.json()) as { id: number; result?: any; error?: unknown }[]
    return calls.map((_, i) => arr.find((x) => x.id === i + 1)?.result ?? null)
  } finally {
    clearTimeout(timer)
  }
}

/** 依次尝试多个 RPC 端点，直到拿到至少一个有效结果 */
export async function rpcBatchAny(
  urls: string[],
  calls: { method: string; params: unknown[] }[],
  timeout = 12000,
) {
  for (const url of urls) {
    try {
      const out = await rpcBatch(url, calls, timeout)
      if (out.some((v) => v !== null)) return out
    } catch {
      // try next endpoint
    }
  }
  return calls.map(() => null)
}

export const word = (hex: string | null, index: number) =>
  hex ? '0x' + hex.slice(2 + index * 64, 2 + (index + 1) * 64) : null

export const toBig = (hex: string | null) => (hex ? BigInt(hex) : 0n)

export const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
}
