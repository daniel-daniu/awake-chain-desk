import { json } from '../_lib/utils'

const checks = [
  { name: 'anubis-blockscout', url: 'https://browser.anubispace.org/api/v2/stats' },
  { name: 'anubis-rpc', url: 'https://rpc.anubispace.org' },
  { name: 'polygon-rpc', url: 'https://polygon-bor-rpc.publicnode.com' },
]

export const onRequestGet = async () => {
  const results = await Promise.allSettled(
    checks.map(async (c) => {
      const started = Date.now()
      const res =
        c.name === 'anubis-rpc'
          ? await fetch(c.url, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
            })
          : c.name === 'polygon-rpc'
            ? await fetch(c.url, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
              })
            : await fetch(c.url)
      return { name: c.name, ok: res.ok, status: res.status, ms: Date.now() - started }
    }),
  )

  return json(
    {
      ok: results.every((r) => r.status === 'fulfilled' && r.value.ok),
      checks: results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, status: 0 })),
      ts: new Date().toISOString(),
    },
    { ttl: 30, swr: 60 },
  )
}
