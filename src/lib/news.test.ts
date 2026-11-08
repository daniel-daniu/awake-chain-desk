import { describe, expect, it } from 'vitest'
import { parseLgnsNews, parseRss } from '../../functions/_lib/news'

describe('news parsers', () => {
  it('extracts official and community cards without inventing content', () => {
    const html = `
      <a href="/news/76" class="article-card type-official article-item-official">
        <div class="ac-badge">官方</div>
        <div class="ac-title">Official update</div>
        <div class="ac-summary">Published source excerpt</div>
        <span>DAO</span><span>2026-09-01</span><span>100</span>
      </a>
      <a href="/news/79" class="article-card type-community article-item-community">
        <div class="ac-title">Community note</div>
        <span>Contributor</span><span>2026-09-15</span>
      </a>
    `
    const items = parseLgnsNews(html)
    expect(items).toHaveLength(2)
    expect(items[0].category).toBe('announcement')
    expect(items[0].title).toBe('Official update')
    expect(items[0].url).toBe('https://lgns.tech/news/76')
    expect(items[1].category).toBe('news')
  })

  it('parses an RSS item and separates publisher suffix', () => {
    const feed = `
      <rss><channel><item>
        <title><![CDATA[Protocol update - Example Publisher]]></title>
        <link>https://example.com/post</link>
        <description><![CDATA[<p>Short excerpt</p>]]></description>
        <pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate>
      </item></channel></rss>
    `
    const items = parseRss(feed, 'Fallback', 'en')
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Protocol update')
    expect(items[0].source).toBe('Example Publisher')
    expect(items[0].summary).toBe('Short excerpt')
  })
})
