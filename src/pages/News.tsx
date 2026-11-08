import { useMemo, useState } from 'react'
import { useNews } from '../lib/api'
import { useI18n } from '../lib/i18n'
import type { NewsItem } from '../types'
import { Icon } from '../components/Icons'
import { NewsFeed } from '../components/dataViews'
import { ErrorView, LoadingView, PageIntro, Pill, SourceStrip, UpdatedAt, WarningList } from '../components/ui'

type Filter = 'all' | 'announcement' | 'news'

export default function News() {
  const { lang, pick } = useI18n()
  const query = useNews()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const items = query.data?.data?.items ?? []
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.summary || '').toLowerCase().includes(q)
      )
    })
  }, [filter, items, search])
  const sourceName = (id: string, fallback: string) => {
    if (lang !== 'en') return fallback
    if (id === 'lgns-tech') return 'LGNS Tools'
    if (id === 'medium') return 'Anubis Global · Medium'
    if (id === 'google-news') return 'Google News'
    return fallback
  }

  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView rows={5} />
      </div>
    )
  }
  if (query.isError || !query.data) {
    return (
      <div className="container-page py-10">
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'EXTERNAL SOURCES', en: 'EXTERNAL SOURCES' })}
        title={pick({ zh: '新闻与公告', en: 'News & announcements' })}
        desc={pick({
          zh: '这里只聚合外部标题、来源和链接。英文页面保留原语言标题；公告是否兑现、说法是否成立，需要回到链上自行核对。',
          en: 'Only external titles, sources and links are aggregated. English view preserves original-language headlines. Whether an announcement is delivered or a statement holds must be checked on-chain.',
        })}
        action={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <UpdatedAt
              timestamp={query.data?.retrievedAt}
              partial={query.data?.data?.sourceState.some((source) => source.status !== 'ok') ?? false}
              maxAgeMinutes={20}
              onRefresh={() => void query.refetch()}
              refreshing={query.isFetching}
            />
            <SourceStrip sources={query.data?.sources ?? []} />
          </div>
        }
      />
      <WarningList items={query.data.warnings} />

      <div className="mt-6 card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5">
            {([
              ['all', { zh: '全部', en: 'All' }],
              ['announcement', { zh: '公告', en: 'Announcements' }],
              ['news', { zh: '新闻', en: 'News' }],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                  filter === key ? 'bg-ink text-white' : 'bg-[#f4f2eb] text-muted'
                }`}
              >
                {pick(label)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-[260px]">
            <Icon name="search" size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={pick({ zh: '搜索标题或来源…', en: 'Search titles or sources…' })}
              className="focus-ring h-9 w-full rounded-xl border border-line bg-white pl-8 pr-3 text-[11px] outline-none placeholder:text-muted"
            />
          </div>
        </div>
        <NewsFeed
          items={filtered}
          emptyText={pick({ zh: '没有匹配的新闻或公告。', en: 'No matching news or announcements.' })}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(query.data?.data?.sourceState ?? []).map((source) => (
          <div key={source.id} className="flex items-center justify-between rounded-xl border border-line bg-white/70 px-3 py-2">
            <span className="text-[10px] font-medium">{sourceName(source.id, source.name)}</span>
            <Pill tone={source.status === 'ok' ? 'ok' : source.status === 'partial' ? 'warn' : 'danger'}>
              {source.count} {pick({ zh: '条', en: 'items' })}
            </Pill>
          </div>
        ))}
      </div>
    </div>
  )
}
