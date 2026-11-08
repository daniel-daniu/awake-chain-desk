import { readNews } from '../_lib/news'
import { cached, fail, json, warning } from '../_lib/utils'

export const onRequestGet = async (context: any) => {
  return cached(
    context.request,
    300,
    900,
    async () => {
      try {
        const data = await readNews()
        return json(data, {
          ttl: 300,
          swr: 900,
          warnings: data.sourceState
            .filter((source) => source.status === 'error')
            .map((source) =>
              warning(
                `NEWS_${source.id.toUpperCase()}`,
                `${source.name} 暂时不可读。`,
                `${source.name} is temporarily unavailable.`,
                source.name,
              ),
            ),
          sources: data.sourceState.map((source) => ({
            id: source.id,
            name: source.name,
            kind: 'external' as const,
            status: source.status,
            retrievedAt: data.observedAt,
          })),
        })
      } catch (error) {
        return fail('NEWS_UPSTREAM', 503, error instanceof Error ? error.message : 'Unknown error')
      }
    },
    context,
  )
}
