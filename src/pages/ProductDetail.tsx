import { Link, Navigate, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getProduct, PRODUCTS } from '../data/products'
import { useFlow, usePrice, useToken } from '../lib/api'
import { useWallet } from '../lib/wallet'
import { useBalances } from '../lib/balances'
import { fmtInt, fmtNum, fmtPct, fmtPrice, fmtUsd, shortAddr } from '../lib/format'
import { addressUrl, tokenUrl } from '../config/contracts'
import { CopyButton, ExternalLink, Pill, SectionHeader } from '../components/ui'
import { MetricCard, ProductCard } from '../components/blocks'
import { IconAlert, IconArrow, IconCheck, IconInfo, IconLock, IconWallet } from '../components/Icons'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, lang, pick } = useI18n()
  const product = id ? getProduct(id) : undefined
  const tokenQ = useToken()
  const priceQ = usePrice()
  const flowQ = useFlow()
  const { address, connect, connecting, error } = useWallet()
  const balancesQ = useBalances(address)
  const token = tokenQ.data?.data
  const price = priceQ.data?.data
  const flow = flowQ.data?.data

  if (!product) return <Navigate to={`/${lang}/products`} replace />

  const stakingTvl = (token?.stakingBalance ?? 0) * (price?.primary ?? 0)
  const poolDai = price?.sources.find((s) => s.pair)?.liquidityUsd ?? 0
  const tvl = product.id === 'staking' ? stakingTvl : product.id === 'liquidity' ? poolDai * 2 : product.tvlUsd
  const statusTone = product.status === 'live' ? 'ok' : product.status === 'unverified' ? 'warn' : 'neutral'
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <div className="container-page py-8 md:py-10">
      <Link to={`/${lang}/products`} className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-accent">
        <IconArrow size={14} className="rotate-180" /> {t('products.title')}
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={statusTone}>{t(`products.status.${product.status}`)}</Pill>
            <Pill tone="neutral">{t(`products.chain.${product.chain}`)}</Pill>
            <Pill tone={product.contractVerified ? 'ok' : 'warn'}>
              {product.contractVerified ? t('products.contractVerified') : t('products.contractUnverified')}
            </Pill>
          </div>
          <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{pick(product.name)}</h1>
          <p className="mt-1.5 text-[14px] text-ink-2">{pick(product.tagline)}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{pick(product.description)}</p>
        </div>
        <div className="shrink-0 rounded-xl border border-line bg-white px-4 py-3 text-[11px] leading-relaxed text-muted">
          <div className="flex items-center gap-1.5 font-medium text-ink">
            <IconInfo size={13} /> {t('products.notAdvice')}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={t('products.interest')}
          value={
            product.id === 'staking' && flow
              ? `${fmtNum(flow.medianClaim, lang, 2)} LGNS`
              : t('common.unavailable')
          }
          hint={product.id === 'staking' ? t('products.interestNote') : t('products.contractUnverified')}
          tone={product.id === 'staking' && flow ? 'warn' : 'default'}
        />
        <MetricCard label={t('products.tvl')} value={tvl ? fmtUsd(tvl, lang) : 'N/A'} hint={product.id === 'staking' ? (lang === 'zh' ? '疑似合约余额 × 价格' : 'probable contract balance × price') : undefined} />
        <MetricCard
          label={product.id === 'staking' ? t('chain.claimShare') : t('products.participants')}
          value={
            product.id === 'staking'
              ? flow
                ? fmtPct(flow.claimShare, lang, 1)
                : 'N/A'
              : product.participants
                ? fmtInt(product.participants, lang)
                : 'N/A'
          }
          hint={product.id === 'staking' ? `${t('chain.sampled')} ${flow ? fmtInt(flow.sampled, lang) : '—'}` : t('chain.note')}
        />
        <MetricCard
          label={t('common.contract')}
          value={<span className="mono text-[14px]">{product.contract ? shortAddr(product.contract, 6, 4) : 'N/A'}</span>}
          hint={product.contractVerified ? t('common.verified') : t('common.unverified')}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {product.metrics.map((m) => (
          <div key={pick(m.label)} className="card card-pad">
            <div className="label">{pick(m.label)}</div>
            <div className="num mt-1.5 text-[18px] font-semibold text-ink">
              {typeof m.value === 'string' ? m.value : pick(m.value)}
            </div>
            {m.hint && <div className="mt-1 text-[11px] text-muted">{pick(m.hint)}</div>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeader title={t('products.mechanics')} />
          <ol className="card divide-y divide-line">
            {pick(product.mechanics).map((m, i) => (
              <li key={i} className="flex gap-3 px-5 py-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accentsoft text-[11px] font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-relaxed text-ink-2">{m}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <SectionHeader title={t('products.risks')} />
          <ul className="card divide-y divide-line">
            {pick(product.risks).map((r, i) => (
              <li key={i} className="flex gap-2.5 px-5 py-3.5">
                <span className="mt-0.5 shrink-0 text-danger">
                  <IconAlert size={14} />
                </span>
                <span className="text-[12.5px] leading-relaxed text-ink-2">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evidence */}
      <section className="mt-8">
        <SectionHeader title={t('products.evidence')} desc={t('insights.dictionaryDesc')} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('risk.factor')}</th>
                  <th>{t('common.address')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {product.evidence.map((e) => (
                  <tr key={pick(e.label)}>
                    <td className="font-medium text-ink">{pick(e.label)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="mono text-[11.5px]">{e.value.startsWith('0x') ? shortAddr(e.value, 10, 6) : e.value}</span>
                        {e.value.startsWith('0x') && <CopyButton value={e.value} />}
                      </div>
                    </td>
                    <td className="text-right">
                      {e.href && <ExternalLink href={e.href}>{t('common.viewExplorer')}</ExternalLink>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Position */}
      <section className="mt-8">
        <SectionHeader title={t('products.position')} desc={t('products.connectToSee')} />
        <div className="card card-pad">
          {!address ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[12px] text-muted">
                <IconLock size={15} /> {t('portfolio.readonlyNote')}
              </div>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <button onClick={() => connect()} className="btn btn-primary btn-sm" disabled={connecting}>
                  <IconWallet size={14} />
                  {connecting ? t('portfolio.connecting') : t('portfolio.connect')}
                </button>
                {error === 'NO_WALLET' && <span className="text-[10px] text-warn">{t('portfolio.noWallet')}</span>}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: t('portfolio.native'), v: fmtNum(balancesQ.data?.native ?? 0, lang, 4) },
                  { l: t('portfolio.lgns'), v: fmtNum(balancesQ.data?.lgns ?? 0, lang, 2) },
                  { l: t('portfolio.glgns'), v: fmtNum(balancesQ.data?.glgns ?? 0, lang, 2) },
                  { l: t('portfolio.lp'), v: fmtNum(balancesQ.data?.lp ?? 0, lang, 4) },
                ].map((x) => (
                  <div key={x.l} className="rounded-lg bg-canvas px-3 py-2.5">
                    <div className="label">{x.l}</div>
                    <div className="num mt-0.5 text-[14px] font-semibold text-ink">{balancesQ.isLoading ? '…' : x.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                <IconInfo size={13} className="mt-0.5 shrink-0" />
                {product.contractVerified
                  ? t('portfolio.riskNote')
                  : `${t('products.contractUnverified')} · ${t('portfolio.riskNote')}`}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title={t('home.products.title')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} tvl={p.id === 'staking' ? stakingTvl : p.id === 'liquidity' ? poolDai * 2 : undefined} />
          ))}
        </div>
      </section>

      <div className="mt-8 flex items-start gap-2 rounded-xl border border-line bg-white px-5 py-4 text-[11px] leading-relaxed text-muted">
        <IconCheck size={14} className="mt-0.5 shrink-0 text-ok" />
        {t('products.notAdvice')}
      </div>
    </div>
  )
}
