import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFlow, useNews, usePrice, useStats, useToken, useYield } from '../lib/api'
import { computeRisk } from '../lib/math'
import { fmtInt, fmtNum, fmtPct, fmtUsd } from '../lib/format'
import type { NewsTag } from '../types'
import { PRODUCTS } from '../data/products'
import { ChainOverviewCard, MetricCard, NewsFeed, PriceBoard, PriceTaxBoard, ProductCard, SnapshotCard } from '../components/blocks'
import { Pill, SectionHeader, UpdatedAt } from '../components/ui'
import { IconAlert, IconArrow, IconBolt, IconGlobe, IconShield } from '../components/Icons'

const FILTERS: { key: 'all' | NewsTag; label: { zh: string; en: string } }[] = [
  { key: 'all', label: { zh: '全部', en: 'All' } },
  { key: 'official', label: { zh: '官方公告', en: 'Official' } },
  { key: 'media', label: { zh: '媒体', en: 'Media' } },
  { key: 'risk', label: { zh: '风险', en: 'Risk' } },
  { key: 'onchain', label: { zh: '链上', en: 'On-chain' } },
]

export default function Home() {
  const { t, lang, pick } = useI18n()
  const priceQ = usePrice()
  const tokenQ = useToken()
  const statsQ = useStats()
  const newsQ = useNews()
  const flowQ = useFlow()
  const yieldQ = useYield()
  const [filter, setFilter] = useState<'all' | NewsTag>('all')

  const price = priceQ.data?.data
  const token = tokenQ.data?.data
  const stats = statsQ.data?.data
  const yieldData = yieldQ.data
  const news = newsQ.data?.data.items ?? []

  const flow = flowQ.data?.data
  const staked = token?.stakingBalance ?? 0

  const risk = useMemo(() => {
    if (!price || !token) return undefined
    return computeRisk({
      anubisPrice: price.primary,
      polygonPrice: price.polygon?.price ?? null,
      crossChainSpread: price.crossChainSpread ?? null,
      top1Share: token.concentration.top1,
      liquidityUsd: price.sources.find((s) => s.pair)?.liquidityUsd ?? 0,
      marketCap: token.totalSupply * price.primary,
      treasuryDai: null,
      treasuryConfirmed: false,
      totalSupply: token.totalSupply,
      observedApyHigh: null,
    })
  }, [price, token])

  const filtered = filter === 'all' ? news : news.filter((n) => n.tag === filter)
  const poolDai = price?.sources.find((s) => s.pair)?.liquidityUsd ?? 0
  const staking = token?.stakingBalance ?? 0
  const stakingTvl = staking * (price?.primary ?? 0)

  return (
    <div className="container-page">
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-line hero-panel px-5 py-8 md:mt-8 md:px-9 md:py-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="accent">
                <IconGlobe size={12} /> {t('home.kicker')}
              </Pill>
              <Pill tone="neutral">{t('home.badge.nonofficial')}</Pill>
            </div>
            <h1 className="mt-4 max-w-2xl text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink md:text-[36px]">
              {lang === 'zh' ? (
                <>
                  {t('home.title1')}
                  <br className="md:hidden" />
                  {t('home.title2')}
                </>
              ) : (
                <>
                  <span className="block">{t('home.title1')}</span>
                  <span className="block">{t('home.title2')}</span>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-2 md:text-[14px]">{t('home.subtitle')}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link to={`/${lang}/insights`} className="btn btn-primary">
                <IconShield size={15} />
                {t('nav.insights')}
              </Link>
              <Link to={`/${lang}/products`} className="btn btn-ghost">
                {t('home.products.all')} <IconArrow size={14} />
              </Link>
              <span className="ml-1 text-[11px] text-muted">{t('home.badge.readonly')}</span>
            </div>
          </div>

          <div className="hidden lg:flex lg:flex-col lg:justify-center" aria-hidden="true">
            <svg viewBox="0 0 320 190" className="w-full">
              <defs>
                <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0B6E75" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#0B6E75" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {[86, 66, 46, 26].map((r, i) => (
                <circle
                  key={r}
                  cx="210"
                  cy="96"
                  r={r}
                  fill="none"
                  stroke="url(#ring)"
                  strokeWidth={i === 0 ? 1.4 : 1}
                  strokeDasharray={i === 2 ? '3 5' : undefined}
                />
              ))}
              <circle cx="210" cy="96" r="5" fill="#0B6E75" />
              <path d="M210 10v172M124 96h172" stroke="#0B6E75" strokeOpacity="0.18" strokeWidth="1" />
              {([
                [210, 10, 'BLK', 'start', 8, 15],
                [296, 96, 'DAI', 'end', -8, 4],
                [210, 182, 'LGNS', 'start', 8, -7],
                [124, 96, 'PEG', 'end', -8, 4],
              ] as [number, number, string, 'start' | 'end', number, number][]).map(([x, y, label, anchor, dx, dy]) => (
                <g key={label}>
                  <circle cx={x} cy={y} r="2.5" fill="#0B6E75" />
                  <text
                    x={x + dx}
                    y={y + dy}
                    textAnchor={anchor}
                    fontSize="9"
                    fill="#66738A"
                    fontFamily="ui-monospace, monospace"
                  >
                    {label}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                RPC · Blockscout · DEX reserves
              </span>
              <span className="mono">chainId 6714 / 137</span>
            </div>
          </div>
        </div>
      </section>

      {/* 导读：第一次来按这个顺序看 */}
      <section className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          {
            n: '01',
            to: 'learn',
            t: { zh: '先花 3 分钟搞懂名词', en: 'Spend 3 minutes on the basics' },
            d: { zh: '区块、地址、Gas、年化，各是什么意思', en: 'Blocks, addresses, gas, APY — what they mean' },
          },
          {
            n: '02',
            to: 'chain',
            t: { zh: '再看链上原始读数', en: 'Then the raw on-chain numbers' },
            d: { zh: '双链价格、24h 增发、质押 index、手续费', en: 'Dual prices, 24h issuance, staking index, fees' },
          },
          {
            n: '03',
            to: 'insights',
            t: { zh: '最后看风险解读', en: 'Then the risk read' },
            d: { zh: '哪些指标在报警，为什么', en: 'Which indicators are flashing, and why' },
          },
        ].map((s) => (
          <Link
            key={s.n}
            to={`/${lang}/${s.to}`}
            className="group flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 transition hover:border-accent/40 hover:shadow-sm"
          >
            <span className="num mt-0.5 text-[11px] font-semibold text-accent">{s.n}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold text-ink">{pick(s.t)}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{pick(s.d)}</span>
            </span>
            <span className="mt-1 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent">
              <IconArrow size={13} />
            </span>
          </Link>
        ))}
      </section>

      {/* 1. News — first content section */}
      <section className="mt-8">
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <SectionHeader
              title={t('home.news.title')}
              desc={t('home.news.desc')}
              action={
                <div className="flex items-center gap-2">
                  <UpdatedAt ts={newsQ.data?.ts} stale={newsQ.data?.stale} />
                </div>
              }
            />
            <div className="card overflow-hidden">
              <div className="scroll-x flex items-center gap-1.5 border-b border-line px-4 py-3">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                      filter === f.key ? 'bg-ink text-white' : 'bg-canvas text-muted hover:text-ink'
                    }`}
                  >
                    {pick(f.label)}
                  </button>
                ))}
                <span className="ml-auto hidden shrink-0 text-[10px] text-muted sm:block">{t('home.news.auto')}</span>
              </div>
              {newsQ.isLoading ? (
                <div className="space-y-3 p-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-16 w-full" />
                  ))}
                </div>
              ) : (
                <NewsFeed items={filtered} limit={6} />
              )}
              <div className="border-t border-line bg-surface-2 px-5 py-3 text-[11px] text-muted">
                {t('home.news.disclaimer')}
              </div>
            </div>
          </div>

          <div className="lg:pt-[52px]">
            <SnapshotCard price={price} token={token} risk={risk} />
            {risk && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#F3D9D5] bg-danger-soft px-4 py-3 text-[11px] leading-relaxed text-[#8E2E23]">
                <span className="mt-0.5 shrink-0">
                  <IconAlert size={14} />
                </span>
                <span>
                  {t('home.snapshot.alert', {
                    x: price?.crossChainSpread ? `${price.crossChainSpread.toFixed(2)}×` : 'N/A',
                    y: fmtPct(token?.concentration.top1 ?? 0, lang, 1),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Core metrics */}
      <section className="mt-10">
        <SectionHeader title={t('home.metrics.title')} desc={t('home.metrics.desc')} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label={t('home.snapshot.marketcap')} value={token ? fmtUsd(token.totalSupply * (price?.primary ?? 0), lang) : '—'} />
          <MetricCard label={t('home.snapshot.supply')} value={token ? `${fmtNum(token.totalSupply / 1e9, lang, 2)}B` : '—'} />
          <MetricCard label={t('home.snapshot.holders')} value={token ? fmtInt(token.holders, lang) : '—'} hint={t('chain.note')} />
          <MetricCard
            label={t('home.snapshot.staking')}
            value={token ? `${fmtNum(staking / 1e9, lang, 2)}B` : '—'}
            hint={token ? `${fmtPct(token.concentration.top1, lang, 1)} · ${fmtUsd(stakingTvl, lang)}` : undefined}
          />
          <MetricCard
            label={t('chain.blocksPerDay')}
            value={statsQ.isLoading ? '…' : stats?.anubis.blocksPerDay ? fmtInt(stats.anubis.blocksPerDay, lang) : '—'}
            hint={stats?.anubis.blockTime ? `${stats.anubis.blockTime.toFixed(3)}s / block` : undefined}
          />
          <MetricCard
            label={t('chain.dailyFee')}
            value={statsQ.isLoading ? '…' : stats?.anubis.dailyFee ? `${fmtNum(stats.anubis.dailyFee, lang, 0)} DAI` : '—'}
            hint={stats?.anubis.avgBlockFee ? `${fmtNum(stats.anubis.avgBlockFee, lang, 4)} DAI / block` : undefined}
          />
          <MetricCard
            label={t('chain.claimShare')}
            value={flowQ.isLoading ? '…' : flow ? fmtPct(flow.claimShare, lang, 1) : '—'}
            hint={flow ? `${t('chain.sampled')} ${fmtInt(flow.sampled, lang)} / ${fmtNum(flow.spanSec, lang, 0)}s` : undefined}
          />
          <MetricCard
            label={t('chain.medianClaim')}
            value={flowQ.isLoading ? '…' : flow ? `${fmtNum(flow.medianClaim, lang, 2)} LGNS` : '—'}
            hint={flow ? `${t('chain.sampled')} ${fmtInt(flow.sampled, lang)} / ${fmtNum(flow.spanSec, lang, 0)}s` : undefined}
          />
        </div>
      </section>

      {/* On-chain interest */}
      <section className="mt-10">
        <SectionHeader
          title={pick({ zh: '链上利息（24h 实测）', en: 'On-chain interest (24h measured)' })}
          desc={pick({
            zh: '质押 index 来自合约 24h 前后读数；增发来自 totalSupply 24h 差值，包含利息、债券与跨链铸造。',
            en: 'Staking index is read 24h apart; issuance is the 24h totalSupply delta, including interest, bonds and bridge minting.',
          })}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label={pick({ zh: '质押日化', en: 'Staking daily' })}
            value={yieldData ? `${fmtNum(yieldData.interest.index.dailyPct, lang, 4)}%` : '…'}
            hint="index 24h"
            tone="warn"
          />
          <MetricCard
            label={pick({ zh: '年化（复利）', en: 'Annualized (compound)' })}
            value={yieldData ? `${fmtNum(yieldData.interest.index.annualCompoundPct, lang, 1)}%` : '…'}
            hint={yieldData ? `${pick({ zh: '单利', en: 'Simple' })} ${fmtNum(yieldData.interest.index.annualSimplePct, lang, 1)}%` : undefined}
            tone="warn"
          />
          <MetricCard
            label={pick({ zh: 'Anubis 24h 增发', en: 'Anubis 24h issuance' })}
            value={yieldData ? `+${fmtNum(yieldData.interest.anubisSupply.dailyPct, lang, 2)}%` : '…'}
            hint={yieldData ? `${fmtNum(yieldData.interest.anubisSupply.delta / 1e6, lang, 2)}M LGNS` : undefined}
            tone="danger"
          />
          <MetricCard
            label={pick({ zh: 'Polygon 24h 增发', en: 'Polygon 24h issuance' })}
            value={yieldData ? `+${fmtNum(yieldData.interest.polygonSupply.dailyPct, lang, 2)}%` : '…'}
            hint={yieldData ? `${fmtNum(yieldData.interest.polygonSupply.delta / 1e6, lang, 2)}M LGNS` : undefined}
            tone="danger"
          />
        </div>
      </section>

      {/* 3. Price + chains */}
      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader title={t('home.price.title')} desc={t('home.price.crossNote')} />
          <PriceTaxBoard data={yieldData} />
          <div className="mt-3">
            <PriceBoard price={price} loading={priceQ.isLoading} compact />
          </div>
        </div>
        <div>
          <SectionHeader title={t('home.chain.title')} desc={t('home.chain.desc')} />
          <div className="grid gap-3">
            <ChainOverviewCard kind="anubis" stats={stats} />
            <ChainOverviewCard kind="polygon" stats={stats} />
          </div>
        </div>
      </section>

      {/* 4. Products */}
      <section className="mt-10">
        <SectionHeader
          title={t('home.products.title')}
          desc={t('home.products.desc')}
          action={
            <Link to={`/${lang}/products`} className="btn btn-ghost btn-sm">
              {t('home.products.all')} <IconArrow size={13} />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.slice(0, 6).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              tvl={p.id === 'staking' ? stakingTvl : p.id === 'liquidity' ? poolDai * 2 : undefined}
              interestMedian={p.id === 'staking' ? flow?.medianClaim ?? null : null}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
