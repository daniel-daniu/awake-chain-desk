import { CHAINS } from '../../shared/contracts'
import { fetchJson, rpcBatch } from '../_lib/utils'

export const onRequestGet = async () => {
  const checks = await Promise.all([
    rpcBatch(CHAINS.anubis.rpc, [{ method: 'eth_chainId', params: [] }], 8_000)
      .then((result) => ({ name: 'anubis-rpc', ok: result[0] === CHAINS.anubis.hexId }))
      .catch(() => ({ name: 'anubis-rpc', ok: false })),
    rpcBatch(CHAINS.polygon.rpc, [{ method: 'eth_chainId', params: [] }], 8_000)
      .then((result) => ({ name: 'polygon-rpc', ok: result[0] === CHAINS.polygon.hexId }))
      .catch(() => ({ name: 'polygon-rpc', ok: false })),
    fetchJson<Record<string, unknown>>(`${CHAINS.anubis.explorerApi}/stats`, 8_000)
      .then(() => ({ name: 'anubis-explorer', ok: true }))
      .catch(() => ({ name: 'anubis-explorer', ok: false })),
  ])
  return new Response(
    JSON.stringify({
      ok: checks.every((check) => check.ok),
      checks,
      retrievedAt: new Date().toISOString(),
    }),
    {
      status: checks.every((check) => check.ok) ? 200 : 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  )
}
