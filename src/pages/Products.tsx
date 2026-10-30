import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { PRODUCTS } from '../data/products'
import { useFlow, usePrice, useToken } from '../lib/api'
import { ProductCard } from '../components/blocks'
import { Pill, SectionHeader } from '../components/ui'
import type { Product } from '../types'

type Filter = 'all' | Product['status']

export default function Products() {
  const { t, lang, pick } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  const tokenQ = useToken()
  const priceQ = usePrice()
  const flowQ = useFlow()
  const token = tokenQ.data?.data
  const price = priceQ.data?.data
  const flow = flowQ.data?.data

  const filters: { key: Filter; label: { zh: string; en: string } }[] = [
    { key: 'all', label: { zh: '全部', en: 'All' } },
    { key: 'live', label: { zh: '链上可读', en: 'Readable' } },
    { key: 'unverified', label: { zh: '部分可读', en: 'Partial' } },
    { key: 'info', label: { zh: '机制说明', en: 'Mechanics' } },
  ]

  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.status === filter)
  const stakingTvl = (token?.stakingBalance ?? 0) * (price?.primary ?? 0)
  const poolDai = price?.sources.find((s) => s.pair)?.liquidityUsd ?? 0

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{t('products.title')}</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{t('products.desc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="ok">{t('products.status.live')}</Pill>
          <Pill tone="warn">{t('products.status.unverified')}</Pill>
          <Pill tone="neutral">{t('products.status.info')}</Pill>
          <Link to={`/${lang}/chain`} className="btn btn-ghost btn-sm">
            {pick({ zh: '链上产品对比', en: 'On-chain comparison' })}
          </Link>
        </div>
      </div>

      <div className="scroll-x mt-6 flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
              filter === f.key ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-line hover:text-ink'
            }`}
          >
            {pick(f.label)}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            tvl={p.id === 'staking' ? stakingTvl : p.id === 'liquidity' ? poolDai * 2 : undefined}
            interestMedian={p.id === 'staking' ? flow?.medianClaim ?? null : null}
          />
        ))}
      </div>

      <div className="mt-10">
        <SectionHeader title={t('products.evidence')} desc={t('products.notAdvice')} />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              zh: '链上可读',
              en: 'On-chain readable',
              body: {
                zh: '代币余额、池子储备、持仓结构可以直接从 RPC 与浏览器接口读取，页面会标注来源与时间。',
                en: 'Token balances, pool reserves and holder structure are read directly from RPC and the explorer; source and time are labeled.',
              },
            },
            {
              zh: '部分可读',
              en: 'Partially readable',
              body: {
                zh: '能读到余额，但合约未开源，折价、归属、待领取等参数无法验证。页面会写「不可读」而不是估算。',
                en: 'Balances are readable, but unverified contracts mean discount, vesting and claimable amounts cannot be verified. The UI says "not readable" instead of guessing.',
              },
            },
            {
              zh: '仅机制说明',
              en: 'Mechanics only',
              body: {
                zh: '官方文档或公告描述的产品，链上没有可核对的合约状态。只做机制解释，不给数字。',
                en: 'Products described only in docs or announcements, with no verifiable on-chain state. Mechanics are explained without numbers.',
              },
            },
          ].map((x) => (
            <div key={x.en} className="card card-pad">
              <div className="text-[13px] font-semibold text-ink">{pick({ zh: x.zh, en: x.en })}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{pick(x.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
