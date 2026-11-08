import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import type { NewsItem, NewsTag, PriceData, Product, RiskData, StatsData, TokenData, YieldData } from '../types'
import { fmtInt, fmtNum, fmtPct, fmtPrice, fmtUsd, shortAddr } from '../lib/format'
import { Bar, ExternalLink, Pill, Sparkline, UpdatedAt } from './ui'
import { IconAlert, IconArrow, IconBolt, IconChart, IconCoins, IconGrid, IconLayers, IconLock, IconShield } from './Icons'

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
  children,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'danger' | 'warn'
  children?: ReactNode
}) {
  const color = tone === 'danger' ? 'text-danger' : tone === 'warn' ? 'text-warn' : 'text-ink'
  return (
    <div className="card card-pad flex flex-col justify-between gap-3">
      <div className="label">{label}</div>
      <div>
        <div className={`num text-[24px] font-semibold leading-none tracking-[-0.02em] ${color}`}>{value}</div>
        {hint && <div className="mt-2 text-[11px] leading-relaxed text-muted">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

export function RiskGauge({ risk, size = 240 }: { risk: RiskData; size?: number }) {
  const { t } = useI18n()
  const w = size
  const h = size * 0.58
  const cx = w / 2
  const cy = h - 8
  const r = w * 0.36
  const stroke = w * 0.055

  const pointAt = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)]
  }
  const point = (angle: number) => pointAt(angle, r)
  const arc = (from: number, to: number) => {
    const [x1, y1] = point(from)
    const [x2, y2] = point(to)
    const large = Math.abs(from - to) > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const needle = 180 - (Math.min(100, Math.max(0, risk.score)) / 100) * 180
  const [nx, ny] = point(needle)
  const [ix, iy] = pointAt(needle, r * 0.42)
  const color =
    risk.level === 'extreme' || risk.level === 'high' ? '#C0392B' : risk.level === 'medium' ? '#B45309' : '#15803D'

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${t('risk.score')} ${risk.score}`}>
        <path d={arc(180, 121)} stroke="#15803D" strokeWidth={stroke} fill="none" strokeLinecap="butt" opacity="0.9" />
        <path d={arc(117, 63)} stroke="#B45309" strokeWidth={stroke} fill="none" strokeLinecap="butt" opacity="0.9" />
        <path d={arc(59, 0)} stroke="#C0392B" strokeWidth={stroke} fill="none" strokeLinecap="butt" opacity="0.9" />
        <line x1={ix} y1={iy} x2={nx} y2={ny} stroke="#0C1421" strokeWidth={w * 0.012} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={w * 0.022} fill="#0C1421" />
        <text x={cx} y={cy - r * 0.30} textAnchor="middle" fontSize={w * 0.16} fontWeight="650" fill={color}>
          {risk.score.toFixed(0)}
        </text>
        <text x={cx} y={cy - r * 0.08} textAnchor="middle" fontSize={w * 0.042} fill="#66738A">
          / 100
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-2">
        <Pill tone={risk.level === 'low' ? 'ok' : risk.level === 'medium' ? 'warn' : 'danger'}>
          {t(`risk.${risk.level}`)}
        </Pill>
        <span className="text-[11px] text-muted">
          {t('risk.confidence')} {(risk.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

export function PriceTaxBoard({ data }: { data?: YieldData }) {
  const { lang, pick } = useI18n()
  if (!data) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card card-pad h-[132px] skeleton" />
        ))}
      </div>
    )
  }
  const priceText = (p: number) =>
    p >= 1
      ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : fmtPrice(p, lang)
  const observed: Record<string, number> = { Polygon: 5.0, Anubis: 8.733, gLGNS: 2.0 }
  const cards = [
    { name: 'Polygon', price: data.prices.polygon?.price ?? null, tax: data.taxes.polygon?.taxPct ?? 0, color: '#7C5CE6' },
    { name: 'Anubis', price: data.prices.anubis?.price ?? null, tax: data.taxes.anubis?.taxPct ?? 0, color: '#0B6E75' },
    { name: 'gLGNS', price: data.prices.glgns?.price ?? null, tax: data.taxes.glgns?.taxPct ?? 0, color: '#15803D' },
  ]
  const missing = cards.filter((c) => c.price === null).map((c) => c.name)

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const eff = observed[c.name] ?? c.tax
          const net = c.price === null ? null : c.price * (1 - eff / 100)
          return (
            <div key={c.name} className="card card-pad">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                <span className="text-[12px] font-medium text-muted">{c.name}</span>
              </div>
              <div className="num mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                {c.price === null ? '—' : priceText(c.price)}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="rounded-md bg-canvas px-2 py-1 text-[10px] font-semibold text-muted">
                  {pick({ zh: `合约 ${c.tax}%`, en: `Contract ${c.tax}%` })}
                </span>
                <span className="rounded-md bg-danger-soft px-2 py-1 text-[10px] font-semibold text-danger">
                  {pick({ zh: `实测 ${eff}%`, en: `Observed ${eff}%` })}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted">{pick({ zh: '净到手', en: 'Net received' })}</span>
                <span className="num text-[13px] font-semibold text-ok">{net === null ? '—' : priceText(net)}</span>
              </div>
              {c.name === 'Anubis' && c.price !== null && (
                <div className="mt-1 text-[9px] text-muted">
                  {pick({ zh: `直卖合约 5% → ${priceText(c.price * 0.95)}`, en: `Direct sell 5% → ${priceText(c.price * 0.95)}` })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {missing.length > 0 && (
        <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-[10px] leading-relaxed text-warn">
          {pick({
            zh: `${missing.join(' / ')} 的链上数据暂时读不到（RPC 未返回），稍后会自动重试；其余数据不受影响。`,
            en: `On-chain data for ${missing.join(' / ')} is temporarily unavailable (RPC returned nothing). It retries automatically; other figures are unaffected.`,
          })}
        </p>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-muted">
        {pick({
          zh: '合约卖税读自 feeRatio / PRECISION，两链均为 5%，gLGNS 2%，买入税 0%。实测：Polygon 3 笔卖出均为 5.0%；Anubis 主路由 3 笔为 8.733%，另一直卖方法样本为 5.0%。第三方“Anubis 50%”未在合约或样本中找到。',
          en: 'Contract sell tax is read from feeRatio / PRECISION: 5% on both LGNS chains, 2% for gLGNS, buy tax 0%. Observed: three Polygon sells at 5.0%; three Anubis router sells at 8.733%, plus one direct-sell sample at 5.0%. The third-party “Anubis 50%” is not found in the contract or samples.',
        })}
      </p>
    </div>
  )
}

export function YieldPanel({ data }: { data?: YieldData }) {
  const { lang, pick } = useI18n()
  if (!data) return <div className="card card-pad h-[300px] skeleton" />

  const idx = data.interest.index
  const daily = idx.dailyPct
  const monthly = (Math.pow(1 + daily / 100, 30) - 1) * 100
  const annual = idx.annualCompoundPct
  const a = data.interest.anubisSupply
  const p = data.interest.polygonSupply
  const s = data.interest.slgnsSupply
  const feeRows = [
    { k: pick({ zh: 'Gas 价格', en: 'Gas price' }), a: `${fmtNum(data.gas.anubis.gwei, lang, 2)} gwei`, p: `${fmtNum(data.gas.polygon.gwei, lang, 2)} gwei` },
    { k: pick({ zh: '单笔转账（21k gas）', en: 'Simple transfer (21k gas)' }), a: `${fmtNum(data.gas.anubis.simpleFee, lang, 5)} DAI`, p: `${fmtNum(data.gas.polygon.simpleFee, lang, 5)} POL` },
    { k: pick({ zh: '合约调用（150k gas）', en: 'Contract call (150k gas)' }), a: `${fmtNum(data.gas.anubis.contractFee, lang, 5)} DAI`, p: `${fmtNum(data.gas.polygon.contractFee, lang, 5)} POL` },
    { k: pick({ zh: 'LGNS 合约卖税', en: 'LGNS contract sell tax' }), a: `${data.taxes.anubis.taxPct}%`, p: `${data.taxes.polygon.taxPct}%` },
    { k: pick({ zh: '实测卖出（主路由）', en: 'Observed sell (main router)' }), a: '8.733%', p: '5.0%' },
    { k: pick({ zh: '买入税', en: 'Buy tax' }), a: `${data.taxes.anubis.buyTaxPct}%`, p: `${data.taxes.polygon.buyTaxPct}%` },
    { k: pick({ zh: 'gLGNS 合约卖税', en: 'gLGNS contract sell tax' }), a: `${data.taxes.glgns.taxPct}%`, p: '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={pick({ zh: '质押日化', en: 'Staking daily' })} value={`${fmtNum(daily, lang, 4)}%`} hint="index 24h" tone="warn" />
        <MetricCard label={pick({ zh: '年化（复利）', en: 'Annualized (compound)' })} value={`${fmtNum(annual, lang, 1)}%`} hint={`${pick({ zh: '月化', en: 'Monthly' })} ${fmtNum(monthly, lang, 2)}%`} tone="warn" />
        <MetricCard label={pick({ zh: 'Anubis 24h 增发', en: 'Anubis 24h issuance' })} value={`+${fmtNum(a.dailyPct, lang, 2)}%`} hint={`${fmtNum(a.delta / 1e6, lang, 2)}M LGNS`} tone="danger" />
        <MetricCard label={pick({ zh: 'Polygon 24h 增发', en: 'Polygon 24h issuance' })} value={`+${fmtNum(p.dailyPct, lang, 2)}%`} hint={`${fmtNum(p.delta / 1e6, lang, 2)}M LGNS`} tone="danger" />
      </div>

      <p className="text-[10px] leading-relaxed text-muted">
        {pick({
          zh: `按 8 小时结算约 ${fmtNum(daily / 3, lang, 4)}%/次（index 日增 / 3）；转入=买入或质押，转出=卖出或解除质押。`,
          en: `About ${fmtNum(daily / 3, lang, 4)}% per 8-hour settlement (daily index / 3); deposit = buy or stake, withdraw = sell or unstake.`,
        })}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[13px] font-semibold text-ink">
            {pick({ zh: '转入 / 转出手续费与税费', en: 'Deposit / withdraw fees & taxes' })}
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{pick({ zh: '项目', en: 'Item' })}</th>
                  <th>Anubis</th>
                  <th>Polygon</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((r) => (
                  <tr key={r.k}>
                    <td className="font-medium text-ink">{r.k}</td>
                    <td className="num">{r.a}</td>
                    <td className="num">{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[13px] font-semibold text-ink">
            {pick({ zh: '产品对比（链上 index）', en: 'Product comparison (on-chain index)' })}
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{pick({ zh: '产品', en: 'Product' })}</th>
                  <th>{pick({ zh: '日化', en: 'Daily' })}</th>
                  <th>{pick({ zh: '月化', en: 'Monthly' })}</th>
                  <th>{pick({ zh: '年化', en: 'Annual' })}</th>
                  <th>{pick({ zh: '说明', en: 'Note' })}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: pick({ zh: '活期质押', en: 'Flexible staking' }), note: pick({ zh: 'index 实测', en: 'Measured index' }) },
                  { n: pick({ zh: '360 天质押', en: '360-day staking' }), note: pick({ zh: '基础 index；额外激励链上不可读', en: 'Base index; extra incentives unreadable' }) },
                  { n: pick({ zh: '600 天质押', en: '600-day staking' }), note: pick({ zh: '基础 index；额外激励链上不可读', en: 'Base index; extra incentives unreadable' }) },
                ].map((r) => (
                  <tr key={r.n}>
                    <td className="font-medium text-ink">{r.n}</td>
                    <td className="num">{fmtNum(daily, lang, 4)}%</td>
                    <td className="num">{fmtNum(monthly, lang, 2)}%</td>
                    <td className="num">{fmtNum(annual, lang, 1)}%</td>
                    <td className="text-[11px] leading-relaxed text-muted">{r.note}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-medium text-ink">gLGNS</td>
                  <td className="num">—</td>
                  <td className="num">—</td>
                  <td className="num">—</td>
                  <td className="text-[11px] leading-relaxed text-muted">
                    {pick({ zh: `价格型，卖税 ${data.taxes.glgns.taxPct}%`, en: `Price asset, sell tax ${data.taxes.glgns.taxPct}%` })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted">
        {pick({
          zh: `index 来自质押合约 24h 前后读数；总供应来自 totalSupply 24h 差值（含利息、债券与跨链铸造）；sLGNS 24h 增发 ${fmtNum(s.dailyPct, lang, 4)}%，年化 ${fmtNum(s.annualCompoundPct, lang, 1)}%。长周期额外 NFT / 生态激励没有公开可读的链上参数，未计入。`,
          en: `index is read 24h apart from the staking contract; supply figures are 24h totalSupply deltas (including interest, bonds and bridge minting); sLGNS 24h issuance is ${fmtNum(s.dailyPct, lang, 4)}%, annualized ${fmtNum(s.annualCompoundPct, lang, 1)}%. Extra NFT / ecosystem incentives for long locks have no public readable on-chain parameters and are excluded.`,
        })}
      </p>
    </div>
  )
}

export function PriceBoard({ price, loading, compact }: { price?: PriceData; loading?: boolean; compact?: boolean }) {
  const { t, lang } = useI18n()
  if (!price) {
    return <div className="card card-pad h-[260px] skeleton" />
  }
  const anubisLiquidity = price.sources.find((s) => s.pair)?.liquidityUsd ?? 0
  const polygon = price.polygon
  const cross = price.crossChainSpread

  return (
    <div className="card overflow-hidden">
      {!compact && (
      <div className="grid gap-px bg-line sm:grid-cols-2">
        <div className="bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="label">{t('home.price.anubis')}</span>
          </div>
          <div className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.02em] text-ink">
            {fmtPrice(price.primary, lang)}
          </div>
          <div className="mt-2 text-[11px] text-muted">
            LGNS/DAI · {fmtUsd(anubisLiquidity, lang)} DAI
          </div>
        </div>
        <div className="bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CE6]" />
            <span className="label">{t('home.price.polygon')}</span>
          </div>
          <div className="num mt-2 text-[30px] font-semibold leading-none tracking-[-0.02em] text-ink">
            {polygon ? fmtPrice(polygon.price, lang) : 'N/A'}
          </div>
          <div className="mt-2 text-[11px] text-muted">
            {polygon ? `LGNS/DAI · ${fmtUsd(polygon.liquidity, lang)} DAI` : t('common.unavailable')}
          </div>
        </div>
      </div>

      )}
      {!compact && (
      <div className="flex items-center justify-between border-y border-line bg-surface-2 px-5 py-3">
        <span className="text-[11px] text-muted">{t('home.price.cross')}</span>
        <span className="num text-[15px] font-semibold text-danger">{cross ? `${cross.toFixed(2)}×` : 'N/A'}</span>
      </div>
      )}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{t('home.price.pool')}</th>
              <th>{t('home.price.primary')}</th>
              <th>{t('home.price.liquidity')}</th>
              <th>{t('risk.weight')}</th>
            </tr>
          </thead>
          <tbody>
            {price.sources.map((s, i) => (
              <tr key={`${s.name}-${i}`}>
                <td>
                  <div className="font-medium text-ink">
                    {lang === 'zh'
                      ? s.name
                          .replace('RocketSwap LGNS/DAI primary pool', 'RocketSwap LGNS/DAI 主池')
                          .replace('Blockscout quote', 'Blockscout 报价')
                          .replace('QuickSwap LGNS/DAI (Polygon)', 'QuickSwap LGNS/DAI（Polygon）')
                      : s.name}
                  </div>
                  {s.pair && <div className="mono mt-0.5 text-[11px] text-muted">{shortAddr(s.pair)}</div>}
                </td>
                <td className="num">{fmtPrice(s.price, lang)}</td>
                <td className="num">{s.liquidityUsd ? fmtUsd(s.liquidityUsd, lang) : '—'}</td>
                <td className="num">{s.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line bg-surface-2 px-5 py-3 text-[11px] leading-relaxed text-muted">
        {t('home.price.crossNote')}
      </div>
    </div>
  )
}

const TAG_TONE: Record<NewsTag, 'neutral' | 'accent' | 'danger' | 'warn' | 'ok'> = {
  official: 'accent',
  media: 'neutral',
  risk: 'danger',
  onchain: 'warn',
}

const TAG_LABEL: Record<NewsTag, { zh: string; en: string }> = {
  official: { zh: '官方公告', en: 'Official' },
  media: { zh: '媒体', en: 'Media' },
  risk: { zh: '风险', en: 'Risk' },
  onchain: { zh: '链上', en: 'On-chain' },
}

export function NewsFeed({
  items,
  compact = false,
  limit,
}: {
  items: NewsItem[]
  compact?: boolean
  limit?: number
}) {
  const { t, lang, pick } = useI18n()
  const list = limit ? items.slice(0, limit) : items

  if (!list.length) {
    return <div className="px-5 py-10 text-center text-[13px] text-muted">{t('home.news.empty')}</div>
  }

  return (
    <div className="divide-y divide-line">
      {list.map((item) => {
        const isInternal = item.url.startsWith('/')
        const href = isInternal ? item.url.replace('/zh', `/${lang}`) : item.url
        const title = pick(item.title)
        const summary = pick(item.summary)
        const Body = (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono text-[11px] text-muted">
                {new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { month: '2-digit', day: '2-digit' }).format(
                  new Date(item.publishedAt),
                )}
              </span>
              <Pill tone={TAG_TONE[item.tag] ?? 'neutral'}>{pick(TAG_LABEL[item.tag] ?? TAG_LABEL.media)}</Pill>
              <span className="text-[11px] text-muted">
                {lang === 'en'
                  ? item.source.includes('本站')
                    ? 'On-chain (this site)'
                    : item.source.includes('官方')
                      ? 'Official post (reposted)'
                      : item.source === '百家号'
                        ? 'Baijiahao'
                        : item.source
                  : item.source}
              </span>
            </div>
            <h3 className="mt-2 text-[14px] font-semibold leading-snug text-ink transition group-hover:text-accent md:text-[15px]">
              {title}
            </h3>
            {!compact && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">{summary}</p>}
          </>
        )

        return isInternal ? (
          <Link key={item.id} to={href} className="group block px-5 py-4 transition hover:bg-surface-2">
            {Body}
          </Link>
        ) : (
          <a
            key={item.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block px-5 py-4 transition hover:bg-surface-2"
          >
            {Body}
          </a>
        )
      })}
    </div>
  )
}

const PRODUCT_ICON: Record<string, ReactNode> = {
  staking: <IconBolt size={18} />,
  'bond-liquidity': <IconLayers size={18} />,
  'bond-reserve': <IconCoins size={18} />,
  mint: <IconShield size={18} />,
  treasury: <IconLock size={18} />,
  fomo: <IconChart size={18} />,
  liquidity: <IconGrid size={18} />,
}

export function ProductCard({
  product,
  tvl,
  interestMedian,
}: {
  product: Product
  tvl?: number | null
  interestMedian?: number | null
}) {
  const { t, lang, pick } = useI18n()
  const statusTone = product.status === 'live' ? 'ok' : product.status === 'unverified' ? 'warn' : 'neutral'
  const interestText =
    product.id === 'staking' && interestMedian != null
      ? `${fmtNum(interestMedian, lang, 2)} LGNS`
      : product.status === 'live'
        ? '—'
        : t('common.unavailable')
  const tvlValue = tvl ?? product.tvlUsd

  return (
    <Link
      to={`/${lang}/products/${product.id}`}
      className="card card-pad group flex flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-[#cfd9df] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentsoft text-accent">
          {PRODUCT_ICON[product.id] || <IconGrid size={18} />}
        </div>
        <Pill tone={statusTone}>{t(`products.status.${product.status}`)}</Pill>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-ink">{pick(product.name)}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">{pick(product.tagline)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div>
          <div className="label">{t('products.interest')}</div>
          <div className={`num mt-0.5 text-[15px] font-semibold ${product.id === 'staking' && interestMedian != null ? 'text-ink' : 'text-muted'}`}>
            {interestText}
          </div>
        </div>
        <div>
          <div className="label">{t('products.tvl')}</div>
          <div className="num mt-0.5 text-[16px] font-semibold text-ink">{tvlValue ? fmtUsd(tvlValue, lang) : 'N/A'}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>{t(`products.chain.${product.chain}`)}</span>
        <span className="inline-flex items-center gap-1 text-accent opacity-0 transition group-hover:opacity-100">
          {t('common.details')} <IconArrow size={13} />
        </span>
      </div>
    </Link>
  )
}

export function ChainOverviewCard({
  kind,
  stats,
}: {
  kind: 'anubis' | 'polygon'
  stats?: StatsData
}) {
  const { t, lang } = useI18n()
  const isAnubis = kind === 'anubis'
  const a = stats?.anubis
  const p = stats?.polygon

  const rows = isAnubis
    ? [
        { label: t('home.chain.block'), value: a ? fmtInt(a.blockNumber, lang) : 'N/A' },
        { label: t('home.chain.blocktime'), value: a ? `${a.blockTime.toFixed(1)}s` : 'N/A' },
        { label: t('home.chain.gas'), value: a ? `${fmtNum(a.gas.slow, lang, 1)} / ${fmtNum(a.gas.average, lang, 1)} / ${fmtNum(a.gas.fast, lang, 1)}` : 'N/A' },
        { label: t('home.chain.tx'), value: a ? fmtInt(a.totalTransactions, lang) : 'N/A' },
        { label: t('home.chain.addresses'), value: a ? fmtInt(a.totalAddresses, lang) : 'N/A' },
      ]
    : [
        { label: t('home.chain.block'), value: p ? fmtInt(p.blockNumber, lang) : 'N/A' },
        { label: t('home.chain.gasprice'), value: p ? `${fmtNum(p.gasPriceGwei, lang, 2)} gwei` : 'N/A' },
        { label: t('common.chain'), value: 'Polygon PoS' },
        { label: t('chain.native'), value: 'POL' },
        { label: t('products.chain.polygon'), value: 'chainId 137' },
      ]

  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isAnubis ? 'bg-accentsoft text-accent' : 'bg-[#EEF1FF] text-[#4B57C9]'}`}>
            <IconChainDot />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">{isAnubis ? 'Anubis Chain' : 'Polygon'}</div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted">
              {isAnubis ? 'chainId 6714 · DAI gas' : 'chainId 137 · POL gas'}
            </div>
          </div>
        </div>
        <UpdatedAt ts={stats?.ts} stale={false} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="label">{r.label}</dt>
            <dd className="num mt-0.5 text-[13px] font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      {isAnubis && a && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>{t('home.chain.utilization')}</span>
            <span className="num">{fmtNum(a.utilization, lang, 2)}%</span>
          </div>
          <div className="mt-1.5">
            <Bar value={a.utilization / 100} tone="accent" />
          </div>
        </div>
      )}
    </div>
  )
}

function IconChainDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16" />
    </svg>
  )
}

export function AlertStrip({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[#F3D9D5] bg-danger-soft px-4 py-3 text-[12px] leading-relaxed text-[#8E2E23]">
      <span className="mt-0.5 shrink-0">
        <IconAlert size={16} />
      </span>
      <div>{children}</div>
    </div>
  )
}

export function SnapshotCard({
  price,
  token,
  risk,
}: {
  price?: PriceData
  token?: TokenData
  risk?: RiskData
}) {
  const { t, lang } = useI18n()
  if (!price || !token) {
    return <div className="card card-pad h-[320px] skeleton" />
  }
  const staking = token.stakingBalance ?? 0
  const anubisLiquidity = price.sources.find((s) => s.pair)?.liquidityUsd ?? 0
  const polygon = price.polygon
  const cross = price.crossChainSpread

  const Row = ({ label, value, sub, dot }: { label: string; value: string; sub: string; dot: string }) => (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
          <span className="text-[11px] font-medium text-muted">{label}</span>
        </div>
        <div className="num mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</div>
      </div>
      <div className="text-right text-[10px] text-muted">{sub}</div>
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-ink">{t('home.snapshot.title')}</div>
          <UpdatedAt ts={price.ts} stale={false} />
        </div>
      </div>

      <div className="space-y-4 px-5 pt-4">
        <Row
          label={t('home.snapshot.anubis')}
          value={fmtPrice(price.primary, lang)}
          sub={`${fmtUsd(anubisLiquidity, lang)} DAI`}
          dot="#0B6E75"
        />
        <Row
          label={t('home.snapshot.polygon')}
          value={polygon ? fmtPrice(polygon.price, lang) : 'N/A'}
          sub={polygon ? `${fmtUsd(polygon.liquidity, lang)} DAI` : t('common.unavailable')}
          dot="#7C5CE6"
        />
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-[11px] text-muted">{t('home.snapshot.cross')}</span>
          <span className="num text-[15px] font-semibold text-danger">{cross ? `${cross.toFixed(2)}×` : 'N/A'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px border-t border-line bg-line">
        {[
          { l: t('home.snapshot.marketcap'), v: fmtUsd(token.totalSupply * price.primary, lang) },
          { l: t('home.snapshot.supply'), v: `${fmtNum(token.totalSupply / 1e9, lang, 2)}B` },
          { l: t('home.snapshot.holders'), v: fmtInt(token.holders, lang) },
          { l: t('home.snapshot.staking'), v: `${fmtNum(staking / 1e9, lang, 2)}B` },
        ].map((x) => (
          <div key={x.l} className="bg-white px-5 py-3">
            <div className="label">{x.l}</div>
            <div className="num mt-0.5 text-[14px] font-semibold text-ink">{x.v}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-line bg-surface-2 px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted">{t('home.snapshot.risk')}</span>
          <Pill tone={risk && (risk.level === 'extreme' || risk.level === 'high') ? 'danger' : 'warn'}>
            {risk ? t(`risk.${risk.level}`) : '—'} {risk ? `· ${risk.score.toFixed(0)}` : ''}
          </Pill>
        </div>
      </div>
    </div>
  )
}
