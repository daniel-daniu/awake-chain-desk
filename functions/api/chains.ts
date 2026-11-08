import type { CoreData, SourceInfo } from '../../shared/types'
import { buildCoreData } from '../_lib/data'
import { cached, fail, json } from '../_lib/utils'

export const onRequestGet = async (context: any) => {
  return cached(
    context.request,
    600,
    1800,
    async () => {
      try {
        const data: CoreData = await buildCoreData()
        if (!data.quotes.length && !data.networks.length) return fail('ALL_CHAIN_SOURCES_UNAVAILABLE')
        const sources: SourceInfo[] = [
          {
            id: 'anubis-rpc',
            name: 'Anubis RPC',
            kind: 'rpc',
            url: 'https://rpc.anubispace.org',
            status: 'ok',
            retrievedAt: data.observedAt,
            blockNumber: data.quotes.find((quote) => quote.chain === 'anubis')?.blockNumber,
          },
          {
            id: 'polygon-rpc',
            name: 'Polygon RPC',
            kind: 'rpc',
            url: 'https://polygon.drpc.org',
            status: data.quotes.some((quote) => quote.chain === 'polygon') ? 'ok' : 'error',
            retrievedAt: data.observedAt,
            blockNumber: data.quotes.find((quote) => quote.chain === 'polygon')?.blockNumber,
          },
          {
            id: 'anubis-explorer',
            name: 'Anubis Blockscout',
            kind: 'explorer',
            url: 'https://browser.anubispace.org',
            status: data.events.length ? 'ok' : 'partial',
            retrievedAt: data.observedAt,
          },
        ]
        return json(data, { ttl: 600, swr: 1800, sources, warnings: data.warnings })
      } catch (error) {
        return fail('CHAINS_UPSTREAM', 503, error instanceof Error ? error.message : 'Unknown error')
      }
    },
    context,
  )
}
