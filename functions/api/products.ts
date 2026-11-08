import type { ProductsData } from '../../shared/types'
import { buildCoreData } from '../_lib/data'
import { cached, fail, json } from '../_lib/utils'

export const onRequestGet = async (context: any) => {
  return cached(
    context.request,
    900,
    1800,
    async () => {
      try {
        const data: ProductsData = { core: await buildCoreData({ contracts: false, concentration: false }) }
        return json(data, {
          ttl: 900,
          swr: 1800,
          warnings: data.core.warnings,
          sources: [
            {
              id: 'onchain',
              name: 'Anubis / Polygon RPC and Blockscout',
              kind: 'rpc',
              status: 'ok',
              retrievedAt: data.core.observedAt,
            },
          ],
        })
      } catch (error) {
        return fail('PRODUCTS_UPSTREAM', 503, error instanceof Error ? error.message : 'Unknown error')
      }
    },
    context,
  )
}
