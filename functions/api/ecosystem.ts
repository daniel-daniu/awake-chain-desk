import { buildEcosystemData } from '../_lib/data'
import { cached, fail, json } from '../_lib/utils'

export const onRequestGet = async (context: any) => {
  return cached(
    context.request,
    300,
    900,
    async () => {
      try {
        const data = await buildEcosystemData()
        return json(data, {
          ttl: 300,
          swr: 900,
          warnings: data.warnings,
          cacheable: data.warnings.length === 0,
          sources: [
            {
              id: 'helix-rpc',
              name: 'Anubis RPC · official Helix contract registry',
              kind: 'rpc',
              status: data.aiToken ? 'ok' : 'partial',
              retrievedAt: data.observedAt,
              url: data.registryUrl,
            },
            {
              id: 'helix-explorer',
              name: 'Anubis Blockscout',
              kind: 'explorer',
              status: data.aiToken ? 'ok' : 'error',
              retrievedAt: data.observedAt,
            },
          ],
        })
      } catch (error) {
        return fail('ECOSYSTEM_UPSTREAM', 503, error instanceof Error ? error.message : 'Unknown error')
      }
    },
    context,
  )
}
