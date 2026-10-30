import { json, cached, fetchText } from '../_lib/utils'
import seed from '../../shared/news-seed.json'

interface NewsItem {
  id: string
  title: { zh: string; en: string }
  summary: { zh: string; en: string }
  source: string
  url: string
  publishedAt: string
  tag: 'official' | 'media' | 'risk' | 'onchain'
  lang: 'zh' | 'en'
}

const FEEDS = [
  {
    url: 'https://medium.com/feed/@AnubisGlobal',
    source: 'Anubis Global · Medium',
    tag: 'official' as const,
    lang: 'en' as const,
  },
  {
    url: 'https://news.google.com/rss/search?q=LGNS%20OR%20AWAKE%20OR%20%22Anubis%20Chain%22%20OR%20%E8%B5%B7%E6%BA%90%20LGNS&hl=zh-CN&gl=CN&ceid=CN:zh-Hans',
    source: 'Google News',
    tag: 'media' as const,
    lang: 'zh' as const,
  },
]

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')

const strip = (s: string) =>
  decode(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const pickTag = (block: string, name: string): string => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? m[1] : ''
}

function parseFeed(xml: string, source: string, tag: NewsItem['tag'], lang: NewsItem['lang']): NewsItem[] {
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 20).map((m) => m[0])
  return blocks
    .map((block, i) => {
      let title = strip(pickTag(block, 'title'))
      const link = strip(pickTag(block, 'link'))
      const date = pickTag(block, 'pubDate')
      const desc = strip(pickTag(block, 'description')).slice(0, 220)
      if (!title || !link) return null
      // Google News appends " - Publisher"; keep the publisher separately.
      let publisher = source
      const dash = title.lastIndexOf(' - ')
      if (source === 'Google News' && dash > 8) {
        publisher = title.slice(dash + 3).trim()
        title = title.slice(0, dash).trim()
      }
      const parsed = date ? new Date(date) : new Date()
      return {
        id: `${tag}-${i}-${link.slice(-24)}`,
        title: { zh: title, en: title },
        summary: { zh: desc || title, en: desc || title },
        source: publisher,
        url: link,
        publishedAt: (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString(),
        tag,
        lang,
      } as NewsItem
    })
    .filter(Boolean) as NewsItem[]
}

const normalize = (s: string) => s.toLowerCase().replace(/[\s\p{P}]/gu, '')

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 1800, 3600, async () => {
    const fetched = await Promise.allSettled(
      FEEDS.map(async (f) => {
        const xml = await fetchText(f.url, 9000)
        return parseFeed(xml, f.source, f.tag, f.lang)
      }),
    )

    const auto = fetched.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    const pinned = (seed.items as NewsItem[]) || []
    const all = [...pinned, ...auto]

    const seen = new Set<string>()
    const deduped = all
      .filter((item) => {
        const key = normalize(item.title.zh || item.title.en)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 24)

    return json(
      { items: deduped },
      {
        ttl: 1800,
        swr: 3600,
        stale: false,
        sources: [
          { name: 'Official Medium' },
          { name: 'Google News RSS' },
          { name: 'Manually verified seed' },
        ],
      },
    )
  }, context)
}
