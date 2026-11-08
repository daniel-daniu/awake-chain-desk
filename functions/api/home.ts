import type { HomeData, SourceInfo } from '../../shared/types'
import { buildCoreData } from '../_lib/data'
import { cached, fail, json } from '../_lib/utils'

export const onRequestGet = async (context: any) => {
  return cached(
    context.request,
    300,
    1800,
    async () => {
      try {
        const core = await buildCoreData({ contracts: false, concentration: false })
        if (!core.quotes.length && !core.networks.length) {
          return fail('ALL_ONCHAIN_SOURCES_UNAVAILABLE')
        }
        const warnings = [...core.warnings]
        const sources: SourceInfo[] = [
          {
            id: 'anubis-rpc',
            name: 'Anubis RPC',
            kind: 'rpc',
            url: 'https://rpc.anubispace.org',
            status: core.quotes.some((quote) => quote.chain === 'anubis') ? 'ok' : 'error',
            retrievedAt: core.observedAt,
            blockNumber: core.quotes.find((quote) => quote.chain === 'anubis')?.blockNumber,
          },
          {
            id: 'polygon-rpc',
            name: 'Polygon RPC',
            kind: 'rpc',
            url: 'https://polygon.drpc.org',
            status: core.quotes.some((quote) => quote.chain === 'polygon') ? 'ok' : 'error',
            retrievedAt: core.observedAt,
            blockNumber: core.quotes.find((quote) => quote.chain === 'polygon')?.blockNumber,
          },
          {
            id: 'anubis-explorer',
            name: 'Anubis Blockscout',
            kind: 'explorer',
            url: 'https://browser.anubispace.org',
            status: core.events.length ? 'ok' : 'partial',
            retrievedAt: core.observedAt,
          },
        ]
        const data: HomeData = { ...core, warnings }
        return json(data, { ttl: 300, swr: 1800, sources, warnings })
      } catch (error) {
        return fail('HOME_UPSTREAM', 503, error instanceof Error ? error.message : 'Unknown error')
      }
    },
    context,
  )
}
