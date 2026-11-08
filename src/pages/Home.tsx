import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHome, useNews } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { fmtInt, fmtPct, relativeTime } from '../lib/format'
import type { NewsItem } from '../types'
import { PRODUCTS } from '../data/products'
import { Icon } from '../components/Icons'
import {
  CostMatrix,
  DualQuoteBoard,
  EventsList,
  NewsFeed,
  ProductMiniCard,
  RewardEventCard,
  YieldMatrix,
} from '../components/dataViews'
import {
  ErrorView,
  LoadingView,
  MetricCard,
  PageIntro,
  Pill,
  SectionHeader,
  SourceStrip,
  UpdatedAt,
  WarningList,
} from '../components/ui'

type NewsFilter = 'all' | 'announcement' | 'news' | 'onchain'

export default function Home() {
  const { lang, pick } = useI18n()
  const query = useHome()
  const newsQuery = useNews()
  const [filter, setFilter] = useState<NewsFilter>('all')
  const data = query.data?.data

  const onchainNews = useMemo<NewsItem[]>(() => {
    if (!data) return []
    const eventLabel = (method: string) => {
      const key = method.toLowerCase()
      if (key === '0xd286f3cf' || key === 'claiminterest') return 'claimInterest'
      if (key === '0xa694fc3a') return 'stake'
      if (/^0x[0-9a-f]{8}$/.test(key)) {
        return pick({ zh: `合约调用 ${method}`, en: `Contract call ${method}` })
      }
      return method || pick({ zh: '转账', en: 'transfer' })
    }
    return data.events
      .flatMap((event) => event.latest)
      .slice(0, 8)
      .map((event) => ({
        id: `onchain-${event.id}-${event.timestamp}`,
        title: `${eventLabel(event.method)}: ${event.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} LGNS`,
        summary: pick({
          zh: `地址 ${event.counterparty.slice(0, 8)}…${event.counterparty.slice(-4)} 的链上记录`,
          en: `On-chain record involving ${event.counterparty.slice(0, 8)}…${event.counterparty.slice(-4)}`,
        }),
        category: 'onchain' as const,
        source: 'Anubis Blockscout',
        url: event.explorerUrl,
        publishedAt: event.timestamp,
        language: 'en' as const,
      }))
  }, [data, pick])

  const externalNews = newsQuery.data?.data?.items ?? []
  const mixedNews = useMemo(
    () => [...externalNews.slice(0, 8), ...onchainNews.slice(0, 2)],
    [externalNews, onchainNews],
  )
  const filtered =
    filter === 'all'
      ? mixedNews
      : filter === 'onchain'
        ? onchainNews
        : externalNews.filter((item) => item.category === filter)

  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView />
      </div>
    )
  }

  if (query.isError || !data) {
    return (
      <div className="container-page py-10">
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const anubisNetwork = data.networks.find((network) => network.chain === 'anubis')
  const polygonNetwork = data.networks.find((network) => network.chain === 'polygon')
  const anubisYield = data.yields.find((item) => item.chain === 'anubis')
  const polygonYield = data.yields.find((item) => item.chain === 'polygon')
  const anubisQuote = data.quotes.find((quote) => quote.chain === 'anubis')
  const polygonQuote = data.quotes.find((quote) => quote.chain === 'polygon')

  return (
    <div className="container-page pb-2">
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface/75 px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${data.warnings.length ? 'bg-warn' : 'bg-ok'}`} />
            {data.warnings.length
              ? pick({ zh: '部分链上数据不可用', en: 'Some on-chain data is unavailable' })
              : pick({ zh: '双链数据已汇总', en: 'Dual-chain data aggregated' })}
          </span>
          <span>
            Anubis <span className="mono text-ink">#{fmtInt(anubisNetwork?.blockNumber, lang)}</span>
          </span>
          <span>
            Polygon <span className="mono text-ink">#{fmtInt(polygonNetwork?.blockNumber, lang)}</span>
          </span>
        </div>
        <UpdatedAt
          timestamp={query.data?.retrievedAt}
          partial={data.warnings.length > 0}
          maxAgeMinutes={15}
          onRefresh={() => void query.refetch()}
          refreshing={query.isFetching}
        />
      </div>

      <PageIntro
        eyebrow={pick({ zh: 'AWake 双链观测', en: 'AWAKE DUAL-CHAIN MONITOR' })}
        title={pick({ zh: '先看真实数据，再决定是否参与。', en: 'See the real on-chain state before you decide.' })}
        desc={pick({
          zh: '价格、税费、收益、奖励和链上活动都直接读取合约与索引。新闻只作为外部来源，不与链上事实混写。',
          en: 'Prices, taxes, yield, rewards and activity are read from contracts and chain indexes. News is kept as an external source, separate from on-chain facts.',
        })}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={`/${lang}/chains`} className="btn btn-primary">
              {pick({ zh: '打开链上数据', en: 'Explore on-chain data' })} <Icon name="arrow" size={14} />
            </Link>
            <Link to={`/${lang}/learn`} className="btn btn-ghost">
              {pick({ zh: '先看懂指标', en: 'Read the basics' })}
            </Link>
          </div>
        }
      />

      <WarningList items={data.warnings} />

      <section className="mt-7" id="news">
        <SectionHeader
          title={pick({ zh: '新闻与公告', en: 'News & announcements' })}
          desc={pick({
            zh: '外部来源与链上活动分区展示。标题保留原文语言，来源和原文链接可核对，数据不会被当成价值判断。',
            en: 'External sources and on-chain activity are separated. Headlines remain in their original language, and sources and links stay inspectable; data is not turned into a value judgement.',
          })}
          action={
            <div className="flex items-center gap-2">
              <Link to={`/${lang}/news`} className="text-[10px] font-semibold text-accent hover:underline">
                {pick({ zh: '全部信息', en: 'All updates' })}
              </Link>
              {newsQuery.isLoading ? (
                <span className="text-[9px] text-muted">
                  {pick({ zh: '正在读取外部来源…', en: 'Loading external sources…' })}
                </span>
              ) : (
                <UpdatedAt
                  timestamp={newsQuery.data?.retrievedAt}
                  partial={
                    newsQuery.isError ||
                    (newsQuery.data?.data?.sourceState ?? []).some((source) => source.status !== 'ok')
                  }
                  maxAgeMinutes={20}
                />
              )}
            </div>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="card overflow-hidden">
            <div className="scroll-x flex items-center gap-1.5 border-b border-line px-4 py-3">
              {(
                [
                  ['all', { zh: '全部', en: 'All' }],
                  ['announcement', { zh: '公告', en: 'Announcements' }],
                  ['news', { zh: '新闻', en: 'News' }],
                  ['onchain', { zh: '链上事件', en: 'On-chain' }],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key as NewsFilter)}
                  className={`focus-ring shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                    filter === key ? 'bg-ink text-white' : 'bg-[#f5f4ef] text-muted hover:text-ink'
                  }`}
                >
                  {pick(label)}
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1 text-[9px] text-muted sm:flex">
                <Icon name="clock" size={11} />
                {pick({ zh: '新闻约 15 分钟刷新', en: 'News refreshes about every 15m' })}
              </span>
            </div>
            {!newsQuery.isLoading &&
              (newsQuery.isError ||
                (newsQuery.data?.data?.items.length ?? 0) === 0 ||
                (newsQuery.data?.data?.sourceState ?? []).some((source) => source.status === 'error')) && (
              <div className="flex items-start gap-2 border-b border-[#efd7bc] bg-warnsoft/60 px-4 py-2.5 text-[9.5px] leading-relaxed text-[#74400e]">
                <Icon name="alert" size={12} className="mt-0.5 shrink-0" />
                {pick({
                  zh: '部分外部新闻源暂时不可用；已返回的条目和链上事件仍正常显示，不使用固定新闻顶替。',
                  en: 'Some external news sources are unavailable. Returned items and on-chain events remain visible; no fixed news is substituted.',
                })}
              </div>
            )}
            {newsQuery.isLoading && filter !== 'onchain' ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((item) => <div key={item} className="skeleton h-16" />)}
              </div>
            ) : (
              <NewsFeed
                items={filtered}
                limit={6}
                emptyText={
                  (newsQuery.isError || (newsQuery.data?.data?.items.length ?? 0) === 0) && filter !== 'onchain'
                    ? pick({ zh: '外部新闻源暂时不可读，链上事件仍可查看。', en: 'External news is unavailable; on-chain events remain readable.' })
                    : pick({ zh: '当前筛选下没有可读条目。', en: 'No readable items in this filter.' })
                }
              />
            )}
            <div className="border-t border-line bg-[#faf9f5] px-4 py-2.5 text-[9px] leading-relaxed text-muted">
              {pick({
                zh: '新闻与公告属于外部来源，未经链上数值验证；链上事件才作为“链上事实”展示。',
                en: 'News and announcements are external sources, not on-chain numeric verification. Only chain events are presented as on-chain facts.',
              })}
            </div>
          </div>
          <div className="space-y-3">
            <EventsList events={data.events} />
            <RewardEventCard event={data.events[0]} />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          title={pick({ zh: '双链速览', en: 'Dual-chain snapshot' })}
          desc={pick({
            zh: '价格由池子储备反推，税后参考价只扣合约卖出税，不包含滑点。',
            en: 'Prices are derived from pool reserves. The after-tax quote deducts contract sell tax only and excludes slippage.',
          })}
          action={<SourceStrip sources={query.data?.sources ?? []} />}
        />
        <DualQuoteBoard quotes={data.quotes} />
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Anubis 24h"
            value={fmtPct(anubisYield?.windows[0]?.dailyPct, lang, 4)}
            hint={pick({ zh: 'index 实测日化', en: 'Measured index daily' })}
            tone="warn"
          />
          <MetricCard
            label="Anubis APY"
            value={fmtPct(anubisYield?.windows[0]?.annualCompoundPct, lang, 1)}
            hint={pick({ zh: '由 24h 实测复利换算', en: 'Compounded from measured 24h' })}
            tone="warn"
          />
          <MetricCard
            label="Polygon 24h"
            value={fmtPct(polygonYield?.windows[0]?.dailyPct, lang, 4)}
            hint={pick({ zh: 'index 实测日化', en: 'Measured index daily' })}
            tone="warn"
          />
          <MetricCard
            label="Polygon APY"
            value={fmtPct(polygonYield?.windows[0]?.annualCompoundPct, lang, 1)}
            hint={pick({ zh: '由 24h 实测复利换算', en: 'Compounded from measured 24h' })}
            tone="warn"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label={pick({ zh: 'Anubis 池内 DAI', en: 'Anubis pool DAI' })}
            value={anubisQuote?.daiReserve !== null && anubisQuote ? `${fmtInt(anubisQuote.daiReserve, lang)} DAI` : 'N/A'}
            hint={pick({ zh: '承接卖单的池子深度', en: 'Depth available to absorb sells' })}
          />
          <MetricCard
            label={pick({ zh: 'Polygon 池内 DAI', en: 'Polygon pool DAI' })}
            value={polygonQuote?.daiReserve !== null && polygonQuote ? `${fmtInt(polygonQuote.daiReserve, lang)} DAI` : 'N/A'}
            hint={pick({ zh: '与 Anubis 是独立储备', en: 'Independent reserves from Anubis' })}
          />
          <MetricCard
            label={pick({ zh: '最近 24h 区块数', en: 'Blocks / latest 24h' })}
            value={`${fmtInt(anubisNetwork?.blocksPerDay, lang)} / ${fmtInt(polygonNetwork?.blocksPerDay, lang)}`}
            hint={pick({ zh: 'Anubis / Polygon，按实测出块换算', en: 'Anubis / Polygon, estimated from measured block time' })}
          />
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          title={pick({ zh: '收益与成本', en: 'Yield & costs' })}
          desc={pick({
            zh: '收益看 index 的实际变化，成本分拆为合约税、Gas 和协议费用。',
            en: 'Yield follows actual index changes; costs are split into contract tax, gas and protocol fees.',
          })}
          action={
            <Pill tone="warn">
              <Icon name="info" size={11} />
              {pick({ zh: '年化是代币数量变化', en: 'APY describes token count' })}
            </Pill>
          }
        />
        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <YieldMatrix yields={data.yields} compact />
          <CostMatrix quotes={data.quotes} networks={data.networks} />
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          title={pick({ zh: '产品一览', en: 'Products at a glance' })}
          desc={pick({ zh: '先看数据是否可读，再看收益。不可读参数不会进入排名。', en: 'Check data availability before yield. Unreadable parameters are not ranked.' })}
          action={
            <Link to={`/${lang}/products`} className="text-[10px] font-semibold text-accent hover:underline">
              {pick({ zh: '全部产品与对比', en: 'All products & comparison' })}
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.slice(0, 6).map((product) => (
            <ProductMiniCard key={product.id} product={product} data={data} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title={pick({ zh: '快速看懂', en: 'Read it in context' })} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: { zh: '年化 ≠ 美元收益', en: 'APY ≠ USD profit' },
              body: { zh: '代币数量增加时，币价和流动性仍可能下降。', en: 'Token count can grow while price and liquidity fall.' },
            },
            {
              title: { zh: '价差 ≠ 无风险套利', en: 'Spread ≠ free arbitrage' },
              body: { zh: '两个 LGNS 合约没有公开的自由兑换承诺。', en: 'There is no public guarantee of free conversion between the two LGNS contracts.' },
            },
            {
              title: { zh: '池深决定退出', en: 'Depth shapes your exit' },
              body: { zh: '池内 DAI 越少，大额卖出的实际冲击越大。', en: 'Less DAI in the pool means bigger impact from a large sell.' },
            },
            {
              title: { zh: '未开源 = 难验证', en: 'Unverified = hard to verify' },
              body: { zh: '读不到的规则显示不可读，不替它补一个数字。', en: 'Unreadable rules stay unreadable instead of receiving invented numbers.' },
            },
          ].map((item) => (
            <div key={item.title.en} className="card card-pad">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accentsoft text-accent">
                <Icon name="shield" size={15} />
              </div>
              <div className="mt-3 text-[12px] font-semibold text-ink">{pick(item.title)}</div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">{pick(item.body)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
