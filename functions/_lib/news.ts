import type { NewsData, NewsItem, SourceStatus } from '../../shared/types'
import { fetchText, fetchTextPartial, isoNow } from './utils'

const decodeEntities = (value: string) =>
  value
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const stripHtml = (value: string) =>
  decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const parseLgnsNews = (html: string): NewsItem[] => {
  const items: NewsItem[] = []
  const blocks = [...html.matchAll(/<a\s+href="(\/news\/(\d+))"([\s\S]*?)<\/a>/gi)]
  for (const block of blocks) {
    const path = block[1]
    const id = block[2]
    const body = block[3]
    const official = /article-item-official|type-official/.test(body)
    const community = /article-item-community|type-community/.test(body)
    if (!official && !community) continue
    const titleMatch =
      body.match(/class="ac-title"[^>]*>([\s\S]*?)<\/div>/i) ||
      body.match(/data-title="([^"]+)"/i)
    const title = stripHtml(titleMatch?.[1] || '')
    if (!title) continue
    const dateMatch = body.match(/(20\d{2}-\d{2}-\d{2})/)
    const summaryMatch = body.match(/class="ac-summary"[^>]*>([\s\S]*?)<\/div>/i)
    const textSpans = [...body.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)]
      .map((match) => stripHtml(match[1]))
      .filter(Boolean)
    const source =
      textSpans.find(
        (text) =>
          text.length < 40 &&
          !/^\d{4}-\d{2}-\d{2}$/.test(text) &&
          !/^\d+$/.test(text) &&
          !text.includes('官方') &&
          !text.includes('社区') &&
          !text.includes('置顶'),
      ) || (official ? 'LGNS 工具站 · 官方分类' : 'LGNS 工具站 · 社区分类')
    const date = dateMatch?.[1] ? new Date(`${dateMatch[1]}T00:00:00+08:00`) : new Date()
    items.push({
      id: `lgns-${id}`,
      title,
      summary: summaryMatch ? stripHtml(summaryMatch[1]).slice(0, 220) || null : null,
      category: official ? 'announcement' : 'news',
      source,
      url: `https://lgns.tech${path}`,
      publishedAt: date.toISOString(),
      language: 'zh',
    })
  }
  return items
}

const pickTag = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match?.[1] || ''
}

export const parseRss = (
  xml: string,
  fallbackSource: string,
  language: 'zh' | 'en',
): NewsItem[] => {
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 30).map((match) => match[0])
  return blocks
    .map((block, index) => {
      let title = stripHtml(pickTag(block, 'title'))
      const link = stripHtml(pickTag(block, 'link'))
      const date = pickTag(block, 'pubDate')
      const description = stripHtml(pickTag(block, 'description')).slice(0, 220)
      if (!title || !link) return null
      let source = fallbackSource
      const publisherDash = title.lastIndexOf(' - ')
      if (publisherDash > 8) {
        source = title.slice(publisherDash + 3).trim()
        title = title.slice(0, publisherDash).trim()
      }
      const published = date ? new Date(date) : new Date()
      return {
        id: `rss-${index}-${link.slice(-20)}`,
        title,
        summary: description || null,
        category: 'news' as const,
        source,
        url: link,
        publishedAt: (Number.isNaN(published.getTime()) ? new Date() : published).toISOString(),
        language,
      }
    })
    .filter(Boolean) as NewsItem[]
}

const normalize = (title: string) => title.toLowerCase().replace(/[\s\p{P}]/gu, '')

export async function readNews(): Promise<NewsData> {
  const sourceState: NewsData['sourceState'] = []
  const all: NewsItem[] = []
  const sources = [
    {
      id: 'lgns-tech',
      name: 'LGNS 工具站',
      language: 'zh' as const,
      run: async () => parseLgnsNews(await fetchTextPartial('https://lgns.tech/news')),
    },
    {
      id: 'medium',
      name: 'Anubis Global · Medium',
      language: 'en' as const,
      run: async () =>
        parseRss(
          await fetchText('https://medium.com/feed/@AnubisGlobal', 10_000),
          'Anubis Global · Medium',
          'en',
        ),
    },
    {
      id: 'google-news',
      name: 'Google News',
      language: 'zh' as const,
      run: async () =>
        parseRss(
          await fetchText(
            'https://news.google.com/rss/search?q=LGNS%20OR%20AWAKE%20OR%20%22Anubis%20Chain%22&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
            10_000,
          ),
          'Google News',
          'zh',
        ),
    },
  ]
  const results = await Promise.allSettled(sources.map((source) => source.run()))
  results.forEach((result, index) => {
    const source = sources[index]
    if (result.status === 'fulfilled') {
      all.push(...result.value)
      sourceState.push({
        id: source.id,
        name: source.name,
        status: result.value.length ? 'ok' : 'partial',
        count: result.value.length,
        message: result.value.length ? undefined : 'No parseable items',
      })
    } else {
      sourceState.push({
        id: source.id,
        name: source.name,
        status: 'error',
        count: 0,
        message: result.reason instanceof Error ? result.reason.message : 'Upstream error',
      })
    }
  })

  const seen = new Set<string>()
  const items = all
    .filter((item) => {
      const key = normalize(item.title)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 60)

  return {
    items,
    sourceState,
    observedAt: isoNow(),
  }
}
