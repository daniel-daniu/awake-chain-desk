import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type {
  ChainQuote,
  ChainYield,
  CoreData,
  EventsSnapshot,
  NetworkSnapshot,
  NewsItem,
} from '../types'
import { useI18n } from '../lib/i18n'
import { fmtInt, fmtNum, fmtPct, fmtPrice, fmtToken, relativeTime } from '../lib/format'
import { crossChainSpread } from '../lib/metrics'
import type { ProductDefinition } from '../data/products'
import { STATUS_LABEL } from '../data/products'
import { Icon } from './Icons'
import { EmptyValue, Pill } from './ui'

export function ChainQuoteCard({
  quote,
  compact = false,
}: {
  quote?: ChainQuote
  compact?: boolean
}) {
  const { lang, pick } = useI18n()
  if (!quote) {
    return (
      <div className="card card-pad">
        <div className="label">LGNS</div>
        <div className="mt-3 text-[24px] font-semibold">N/A</div>
        <div className="mt-2 text-[10px] text-muted">{pick({ zh: '当前 RPC 未返回数据', en: 'No current RPC result' })}</div>
      </div>
    )
  }
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${quote.chain === 'anubis' ? 'bg-accent' : 'bg-violet'}`} />
            <span className="text-[12px] font-semibold text-ink">{quote.chainName}</span>
          </div>
          <div className="mt-0.5 text-[9.5px] text-muted">
            {quote.pairName} · #{fmtInt(quote.blockNumber, lang)}
          </div>
        </div>
        <Pill tone={quote.chain === 'anubis' ? 'accent' : 'neutral'}>{quote.nativeSymbol}</Pill>
      </div>
      <div className="num mt-3 text-[27px] font-semibold leading-none tracking-[-0.03em] text-ink md:text-[32px]">
        {fmtPrice(quote.priceDai, lang)}
      </div>
      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-[10.5px]">
          <div>
            <div className="label">{pick({ zh: '税后参考价', en: 'After-tax quote' })}</div>
            <div className="num mt-0.5 font-semibold text-ok">{fmtPrice(quote.netSellPriceDai, lang)}</div>
          </div>
          <div>
            <div className="label">{pick({ zh: '池内 DAI', en: 'Pool DAI' })}</div>
            <div className="num mt-0.5 font-semibold text-ink">{fmtToken(quote.daiReserve, lang, 'DAI')}</div>
          </div>
          <div>
            <div className="label">{pick({ zh: '买入税', en: 'Buy tax' })}</div>
            <div className="num mt-0.5 font-semibold">{fmtPct(quote.buyTaxPct, lang, 3)}</div>
          </div>
          <div>
            <div className="label">{pick({ zh: '卖出税', en: 'Sell tax' })}</div>
            <div className="num mt-0.5 font-semibold text-warn">{fmtPct(quote.sellTaxPct, lang, 3)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DualQuoteBoard({
  quotes,
  compact = false,
}: {
  quotes: ChainQuote[]
  compact?: boolean
}) {
  const { lang, pick } = useI18n()
  const anubis = quotes.find((quote) => quote.chain === 'anubis')
  const polygon = quotes.find((quote) => quote.chain === 'polygon')
  const spread = crossChainSpread(anubis?.priceDai ?? null, polygon?.priceDai ?? null)
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.72fr]">
      <ChainQuoteCard quote={anubis} compact={compact} />
      <ChainQuoteCard quote={polygon} compact={compact} />
      <div className="card card-pad">
        <div className="label">{pick({ zh: '跨链价差', en: 'Cross-chain spread' })}</div>
        <div className={`num mt-3 text-[27px] font-semibold leading-none ${spread && spread > 1.5 ? 'text-danger' : 'text-ink'}`}>
          {spread ? `${fmtNum(spread, lang, 3, 3)}×` : 'N/A'}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted">
          {pick({
            zh: 'Polygon 报价 ÷ Anubis 报价。两个 LGNS 是不同合约，价差不能直接视为无风险套利。',
            en: 'Polygon quote divided by Anubis quote. These are separate LGNS contracts; the gap is not automatically risk-free arbitrage.',
          })}
        </p>
      </div>
    </div>
  )
}

export function NetworkCard({ network }: { network?: NetworkSnapshot }) {
  const { lang, pick } = useI18n()
  if (!network) return <div className="card card-pad text-[12px] text-muted">N/A</div>
  const rows = [
    { label: pick({ zh: '最新区块', en: 'Latest block' }), value: fmtInt(network.blockNumber, lang) },
    { label: pick({ zh: '实测出块', en: 'Measured block time' }), value: network.blockTimeSec ? `${fmtNum(network.blockTimeSec, lang, 3)}s` : 'N/A' },
    { label: pick({ zh: '每日区块', en: 'Blocks / day' }), value: network.blocksPerDay ? fmtInt(network.blocksPerDay, lang) : 'N/A' },
    { label: 'Gas', value: network.gasPriceGwei !== null ? `${fmtNum(network.gasPriceGwei, lang, 3)} gwei` : 'N/A' },
    {
      label: pick({ zh: '单笔转账估算', en: '21k gas estimate' }),
      value:
        network.simpleTransferFeeNative !== null
          ? `${fmtNum(network.simpleTransferFeeNative, lang, 6)} ${network.chain === 'anubis' ? 'DAI' : 'POL'}`
          : 'N/A',
    },
    {
      label: pick({ zh: '区块奖励样本', en: 'Block reward sample' }),
      value: network.blockRewardNative !== null ? fmtToken(network.blockRewardNative, lang, network.chain === 'anubis' ? 'DAI' : 'POL') : 'N/A',
    },
  ]
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <div className="text-[13px] font-semibold text-ink">{network.chainName}</div>
          <div className="mono mt-0.5 text-[9.5px] text-muted">chainId {network.chainId}</div>
        </div>
        <Pill tone={network.chain === 'anubis' ? 'accent' : 'neutral'}>
          {network.chain === 'anubis' ? 'DAI gas' : 'POL gas'}
        </Pill>
      </div>
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="bg-surface px-4 py-3">
            <div className="label">{row.label}</div>
            <div className="num mt-1 text-[12px] font-semibold text-ink">{row.value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-line bg-[#faf9f5] px-4 py-2.5 text-[9.5px] leading-relaxed text-muted">
        {pick({
          zh: `手续费和出块指标来自最近样本；奖励样本 ${network.rewardSampleCount} 个区块。样本为空时不推定固定奖励。`,
          en: `Fee and block metrics use recent samples; ${network.rewardSampleCount} blocks contributed reward samples. No fixed reward is inferred when the sample is absent.`,
        })}
      </div>
    </div>
  )
}

export function YieldMatrix({
  yields,
  compact = false,
}: {
  yields: ChainYield[]
  compact?: boolean
}) {
  const { lang, pick } = useI18n()
  const windows = ['24h', '7d', '30d'] as const
  const chainLabel = (chain: string) => (chain === 'anubis' ? 'Anubis' : 'Polygon')
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">{pick({ zh: '链上 index 实测', en: 'Measured index growth' })}</div>
          <div className="mt-1 text-[9.5px] text-muted">
            {pick({
              zh: '所有窗口均用起止 index 和真实区块时间计算平均日化，并显示实际观察时长。',
              en: 'Each window uses start/end index readings and actual block timestamps to calculate average daily growth and observed duration.',
            })}
          </div>
        </div>
        <Pill tone="accent">{pick({ zh: '非配置利率', en: 'Measured, not configured' })}</Pill>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{pick({ zh: '链', en: 'Chain' })}</th>
              <th>{pick({ zh: '窗口', en: 'Window' })}</th>
              <th>{pick({ zh: '日化', en: 'Daily' })}</th>
              <th>{pick({ zh: '单利年化', en: 'Simple APR' })}</th>
              <th>{pick({ zh: '复利年化', en: 'Compound APY' })}</th>
              {!compact && <th>{pick({ zh: '样本', en: 'Samples' })}</th>}
              {!compact && <th>{pick({ zh: '区块范围', en: 'Block range' })}</th>}
            </tr>
          </thead>
          <tbody>
            {yields.flatMap((chainYield) =>
              windows.map((key, index) => {
                const window = chainYield.windows.find((item) => item.key === key)
                return (
                  <tr key={`${chainYield.chain}-${key}`}>
                    {index === 0 && (
                      <td rowSpan={windows.length} className="font-medium text-ink">
                        <span className="inline-flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${chainYield.chain === 'anubis' ? 'bg-accent' : 'bg-violet'}`} />
                          {chainLabel(chainYield.chain)}
                        </span>
                      </td>
                    )}
                    <td className="font-medium">
                      <span>{key}</span>
                      {window?.elapsedHours !== null && window?.elapsedHours !== undefined && (
                        <span className="ml-1 text-[9px] font-normal text-muted">
                          ≈{fmtNum(window.elapsedHours, lang, 1)}h
                        </span>
                      )}
                    </td>
                    <td className="num">{fmtPct(window?.dailyPct, lang, 4)}</td>
                    <td className="num">{fmtPct(window?.annualSimplePct, lang, 1)}</td>
                    <td className={`num font-semibold ${window?.annualCompoundPct && window.annualCompoundPct > 100 ? 'text-warn' : 'text-ink'}`}>
                      {fmtPct(window?.annualCompoundPct, lang, 1)}
                    </td>
                    {!compact && <td className="num">{window?.samples || 0}</td>}
                    {!compact && (
                      <td className="mono text-[10px]">
                        {window?.startBlock && window?.endBlock ? `${window.startBlock} → ${window.endBlock}` : 'N/A'}
                      </td>
                    )}
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CostMatrix({
  quotes,
  networks,
}: {
  quotes: ChainQuote[]
  networks: NetworkSnapshot[]
}) {
  const { lang, pick } = useI18n()
  const findQuote = (chain: string) => quotes.find((quote) => quote.chain === chain)
  const findNetwork = (chain: string) => networks.find((network) => network.chain === chain)
  const anubisQuote = findQuote('anubis')
  const polygonQuote = findQuote('polygon')
  const anubisNetwork = findNetwork('anubis')
  const polygonNetwork = findNetwork('polygon')
  const rows: Array<{ label: ReactNode; anubis: ReactNode; polygon: ReactNode; note?: ReactNode }> = [
    {
      label: pick({ zh: '买入税（合约）', en: 'Buy tax (contract)' }),
      anubis: fmtPct(anubisQuote?.buyTaxPct, lang, 4),
      polygon: fmtPct(polygonQuote?.buyTaxPct, lang, 4),
    },
    {
      label: pick({ zh: '卖出税（合约）', en: 'Sell tax (contract)' }),
      anubis: fmtPct(anubisQuote?.sellTaxPct, lang, 4),
      polygon: fmtPct(polygonQuote?.sellTaxPct, lang, 4),
    },
    {
      label: pick({ zh: '普通钱包转账税', en: 'Wallet-to-wallet transfer tax' }),
      anubis: <EmptyValue note={pick({ zh: '合约未单独公开', en: 'Not separately exposed' })} />,
      polygon: <EmptyValue note={pick({ zh: '合约未单独公开', en: 'Not separately exposed' })} />,
    },
    {
      label: pick({ zh: '单笔转账 Gas 估算', en: 'Transfer gas estimate' }),
      anubis: anubisNetwork?.simpleTransferFeeNative !== null && anubisNetwork
        ? `${fmtNum(anubisNetwork.simpleTransferFeeNative, lang, 6)} DAI`
        : 'N/A',
      polygon: polygonNetwork?.simpleTransferFeeNative !== null && polygonNetwork
        ? `${fmtNum(polygonNetwork.simpleTransferFeeNative, lang, 6)} POL`
        : 'N/A',
    },
    {
      label: pick({ zh: '质押转入费', en: 'Staking deposit fee' }),
      anubis: <EmptyValue note={pick({ zh: '未找到统一可读费率', en: 'No unified readable rate' })} />,
      polygon: <EmptyValue note={pick({ zh: '未找到统一可读费率', en: 'No unified readable rate' })} />,
    },
    {
      label: pick({ zh: '质押转出费', en: 'Staking withdrawal fee' }),
      anubis: <EmptyValue note={pick({ zh: '未找到统一可读费率', en: 'No unified readable rate' })} />,
      polygon: <EmptyValue note={pick({ zh: '未找到统一可读费率', en: 'No unified readable rate' })} />,
    },
  ]
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="text-[13px] font-semibold">{pick({ zh: '费用分项', en: 'Fee breakdown' })}</div>
        <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
          {pick({
            zh: 'Gas、代币税和协议费用分开显示；不可读的项目不会用估算税替代。',
            en: 'Gas, token tax and protocol fees are shown separately. Unreadable items are not replaced with estimated tax.',
          })}
        </p>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{pick({ zh: '项目', en: 'Item' })}</th>
              <th>Anubis</th>
              <th>Polygon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.label)}>
                <td className="font-medium text-ink">{row.label}</td>
                <td className="num">{row.anubis}</td>
                <td className="num">{row.polygon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RewardEventCard({ event }: { event?: EventsSnapshot }) {
  const { lang, pick } = useI18n()
  const stats = event?.claimInterest
  const observedWindow = stats
    ? stats.observedHours < 1
      ? `${Math.max(1, Math.round(stats.observedHours * 60))} min`
      : `${fmtNum(stats.observedHours, lang, 1)} h`
    : null
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">
            {stats?.complete
              ? pick({ zh: '领取事件 · 最近 24h', en: 'Claims · latest 24h' })
              : pick({ zh: '领取事件 · 最新索引窗口', en: 'Claims · latest indexed window' })}
          </div>
          <div className="num mt-2 text-[25px] font-semibold leading-none">
            {stats ? fmtInt(stats.count, lang) : 'N/A'}
          </div>
          {observedWindow && <div className="mt-1 text-[9px] text-muted">{observedWindow}</div>}
        </div>
        <Pill tone={!stats ? 'neutral' : stats.complete ? 'ok' : 'warn'}>
          {!stats ? pick({ zh: '不可读', en: 'Unavailable' }) : stats.complete ? pick({ zh: '完整窗口', en: 'Full window' }) : pick({ zh: '可能不完整', en: 'May be incomplete' })}
        </Pill>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[10.5px] text-muted">
        <span>{pick({ zh: '单笔中位', en: 'Median' })}</span>
        <span className="num text-right text-ink">{stats ? fmtToken(stats.medianAmount, lang, 'LGNS') : 'N/A'}</span>
        <span>{pick({ zh: '单笔最大', en: 'Maximum' })}</span>
        <span className="num text-right text-ink">{stats ? fmtToken(stats.maxAmount, lang, 'LGNS') : 'N/A'}</span>
        <span>{pick({ zh: '领取总额', en: 'Total' })}</span>
        <span className="num text-right text-ink">{stats ? fmtToken(stats.totalAmount, lang, 'LGNS') : 'N/A'}</span>
      </div>
      <p className="mt-3 text-[9.5px] leading-relaxed text-muted">
        {pick({
          zh: '这是浏览器索引实际返回的领取记录。索引窗口不完整时只表示该样本，不把它外推成全天规律。',
          en: 'These are claim records returned by the explorer index. When the window is incomplete, they describe the sample only and are not extrapolated to a full day.',
        })}
      </p>
    </div>
  )
}

const tagForCategory = (category: NewsItem['category']) => {
  if (category === 'announcement') return { tone: 'accent' as const, zh: '公告', en: 'Announcement' }
  if (category === 'onchain') return { tone: 'warn' as const, zh: '链上', en: 'On-chain' }
  return { tone: 'neutral' as const, zh: '新闻', en: 'News' }
}

export function NewsFeed({
  items,
  limit,
  emptyText,
}: {
  items: NewsItem[]
  limit?: number
  emptyText?: ReactNode
}) {
  const { lang, pick } = useI18n()
  const sourceLabel = (source: string) =>
    lang === 'en'
      ? source
          .replaceAll('LGNS工具站', 'LGNS Tools')
          .replaceAll('LGNS 工具站', 'LGNS Tools')
          .replaceAll('DAO组织', 'DAO organization')
          .replaceAll('官方分类', 'official category')
          .replaceAll('社区分类', 'community category')
      : source
  const list = typeof limit === 'number' ? items.slice(0, limit) : items
  if (!list.length) {
    return (
      <div className="px-5 py-10 text-center text-[11px] text-muted">
        {emptyText || pick({ zh: '当前没有可读条目。', en: 'No readable items right now.' })}
      </div>
    )
  }
  return (
    <div className="divide-y divide-line">
      {list.map((item) => {
        const tag = tagForCategory(item.category)
        return (
          <a
            key={item.id}
            href={item.url}
            target={item.url.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group block px-4 py-4 transition hover:bg-[#fbfaf6] md:px-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">
                <Pill tone={tag.tone}>{pick({ zh: tag.zh, en: tag.en })}</Pill>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[12.5px] font-semibold leading-snug text-ink transition group-hover:text-accent md:text-[13px]">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted">{item.summary}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[9.5px] text-muted">
                  <span className="font-medium">{sourceLabel(item.source)}</span>
                  <span>·</span>
                  <span>{relativeTime(item.publishedAt, lang)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-accent">
                    {pick({ zh: '原文', en: 'Source' })} <Icon name="external" size={10} />
                  </span>
                </div>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

export function EventsList({ events }: { events: EventsSnapshot[] }) {
  const { lang, pick } = useI18n()
  const list = events.flatMap((event) => event.latest).slice(0, 6)
  const methodLabel = (method: string) => {
    const key = method.toLowerCase()
    if (key === '0xd286f3cf' || key === 'claiminterest') return 'claimInterest'
    if (key === '0xa694fc3a') return 'stake'
    if (key === '0xd9f0f7f5') return 'contract transfer'
    if (/^0x[0-9a-f]{8}$/.test(key)) {
      return pick({ zh: `合约调用 ${method}`, en: `Contract call ${method}` })
    }
    return method || 'transfer'
  }
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-[12px] font-semibold">{pick({ zh: '最新链上动态', en: 'Latest on-chain activity' })}</div>
        <Pill tone="warn">{pick({ zh: '浏览器索引', en: 'Explorer index' })}</Pill>
      </div>
      {list.length ? (
        <div className="divide-y divide-line">
          {list.map((event) => (
            <a
              key={`${event.id}-${event.timestamp}`}
              href={event.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[#fbfaf6]"
            >
              <div className="min-w-0">
                <div className="truncate text-[11px] font-medium text-ink">{methodLabel(event.method)}</div>
                <div className="mt-0.5 text-[9px] text-muted">{relativeTime(event.timestamp, lang)}</div>
              </div>
              <div className="num shrink-0 text-right text-[10.5px] font-semibold text-ink">
                {fmtToken(event.amount, lang, 'LGNS')}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-[11px] text-muted">
          {pick({ zh: '暂时没有可读的最近事件。', en: 'No recent readable events.' })}
        </div>
      )}
    </div>
  )
}

export function ProductMiniCard({
  product,
  data,
}: {
  product: ProductDefinition
  data?: CoreData
}) {
  const { lang, pick } = useI18n()
  const status = STATUS_LABEL[product.status]
  const statusTone = product.status === 'live' ? 'ok' : product.status === 'partial' ? 'warn' : 'neutral'
  let metric: ReactNode = <span className="text-muted">N/A</span>
  let hint = pick(product.short)
  if (product.metric === 'staking' && data) {
    metric = (
      <span>
        A {fmtPct(data.yields.find((item) => item.chain === 'anubis')?.windows[0]?.dailyPct, lang, 3)}
        <span className="mx-1 text-muted">/</span>
        P {fmtPct(data.yields.find((item) => item.chain === 'polygon')?.windows[0]?.dailyPct, lang, 3)}
      </span>
    )
    hint = pick({ zh: '共享 index 最近 24h 实测日化；A=Anubis，P=Polygon', en: 'Shared index daily over latest 24h; A=Anubis, P=Polygon' })
  } else if (product.metric === 'pool' && data) {
    const quote = data.quotes.find((item) => item.chain === product.chain)
    metric = fmtToken(quote?.daiReserve, lang, 'DAI')
    hint = pick({ zh: '池内 DAI；手续费年化需可读费率', en: 'Pool DAI; annualized fees require a readable fee tier' })
  } else if (product.metric === 'helix') {
    metric = pick({ zh: '查看当前额度', en: 'View current quotas' })
    hint = pick({ zh: 'AiLGNS 供应、Power 与每日额度', en: 'AiLGNS supply, Power and daily quotas' })
  }

  return (
    <Link
      to={`/${lang}/products/${product.id}`}
      className="focus-ring card card-pad group flex min-h-[180px] flex-col transition hover:-translate-y-0.5 hover:border-[#c9d8d3] hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold leading-snug text-ink">{pick(product.name)}</div>
        <Pill tone={statusTone}>{pick(status)}</Pill>
      </div>
      <div className="num mt-5 text-[20px] font-semibold text-ink">{metric}</div>
      <div className="mt-2 flex-1 text-[10px] leading-relaxed text-muted">{hint}</div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted">
        <span>{pick({ zh: product.chain === 'both' ? '双链' : product.chain === 'anubis' ? 'Anubis' : 'Polygon', en: product.chain === 'both' ? 'Both chains' : product.chain === 'anubis' ? 'Anubis' : 'Polygon' })}</span>
        <span className="inline-flex items-center gap-1 text-accent">
          {pick({ zh: '详情', en: 'Details' })} <Icon name="arrow" size={11} />
        </span>
      </div>
    </Link>
  )
}
