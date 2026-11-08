import { Link } from 'react-router-dom'
import { useChains } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { fmtInt, fmtPct, shortAddr } from '../lib/format'
import {
  ChainQuoteCard,
  CostMatrix,
  EventsList,
  NetworkCard,
  RewardEventCard,
  YieldMatrix,
} from '../components/dataViews'
import {
  Address,
  ErrorView,
  LoadingView,
  PageIntro,
  Pill,
  SectionHeader,
  SourceStrip,
  UpdatedAt,
  WarningList,
} from '../components/ui'
import { Icon } from '../components/Icons'

export default function Chains() {
  const { lang, pick } = useI18n()
  const query = useChains()
  const data = query.data?.data

  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView rows={10} />
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

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'ON-CHAIN LEDGER', en: 'ON-CHAIN LEDGER' })}
        title={pick({ zh: '链上数据', en: 'On-chain data' })}
        desc={pick({
          zh: '双链价格、费用、index、奖励事件与合约验证状态。所有数据保留区块和更新时间。',
          en: 'Dual-chain prices, fees, index, reward events and contract verification state, with block and update provenance.',
        })}
        action={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <UpdatedAt
              timestamp={query.data?.retrievedAt}
              partial={data.warnings.length > 0}
              maxAgeMinutes={20}
              onRefresh={() => void query.refetch()}
              refreshing={query.isFetching}
            />
            <SourceStrip sources={query.data?.sources ?? []} />
          </div>
        }
      />

      <WarningList items={data.warnings} />

      <section className="mt-7">
        <SectionHeader
          title={pick({ zh: '双链 LGNS 报价', en: 'Dual-chain LGNS quotes' })}
          desc={pick({
            zh: '同样的代币符号，两条链上是两个独立合约与两个独立池子。',
            en: 'The same symbol maps to separate contracts and separate pools on each chain.',
          })}
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {(['anubis', 'polygon'] as const).map((chain) => (
            <ChainQuoteCard key={chain} quote={data.quotes.find((quote) => quote.chain === chain)} />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '网络状态', en: 'Network state' })}
          desc={pick({
            zh: '出块速度、Gas 和区块奖励都来自最近区块样本；样本为空时不会推定固定值。',
            en: 'Block time, gas and rewards use recent block samples. Missing samples are not replaced with fixed values.',
          })}
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {(['anubis', 'polygon'] as const).map((chain) => (
            <NetworkCard key={chain} network={data.networks.find((network) => network.chain === chain)} />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '收益窗口', en: 'Yield windows' })}
          desc={pick({
            zh: '24 小时、7 日与 30 日窗口分别展示平均日化，APR/APY 仅按各自真实观察时长换算。',
            en: '24-hour, 7-day and 30-day windows show average daily growth; APR/APY use each window’s actual observed duration.',
          })}
        />
        <YieldMatrix yields={data.yields} />
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '费用拆解', en: 'Fee breakdown' })}
          desc={pick({
            zh: '代币合约税与网络 Gas 分开；交易所路由、普通钱包转账和质押合约费率未公开时显示 N/A。',
            en: 'Token tax and network gas are separated. Exchange routing, wallet transfer and staking fees show N/A when not exposed.',
          })}
        />
        <CostMatrix quotes={data.quotes} networks={data.networks} />
      </section>

      <section className="mt-9 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeader title={pick({ zh: '奖励事件索引样本', en: 'Reward event index sample' })} />
          <RewardEventCard event={data.events[0]} />
        </div>
        <div>
          <SectionHeader title={pick({ zh: '浏览器事件流', en: 'Explorer activity' })} />
          <EventsList events={data.events} />
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: 'LGNS 持仓集中度', en: 'LGNS holder concentration' })}
          desc={pick({
            zh: '持币地址数不是用户数；合约地址也不等于真实个人仓位。',
            en: 'Holder count is not user count, and contract addresses are not personal positions.',
          })}
        />
        <div className="card overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {[
              [pick({ zh: '持币地址', en: 'Holders' }), fmtInt(data.concentration?.holders, lang)],
              [pick({ zh: '第一大地址', en: 'Top 1' }), fmtPct(data.concentration?.top1Pct, lang, 2)],
              [pick({ zh: '前十大地址', en: 'Top 10' }), fmtPct(data.concentration?.top10Pct, lang, 2)],
              [pick({ zh: '第一大地址', en: 'Top address' }), shortAddr(data.concentration?.top1Address, 7, 5)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface px-4 py-4">
                <div className="label">{label}</div>
                <div className="num mt-1.5 text-[16px] font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{pick({ zh: '地址', en: 'Address' })}</th>
                  <th>{pick({ zh: '类型', en: 'Type' })}</th>
                  <th>{pick({ zh: '持有', en: 'Balance' })}</th>
                  <th>{pick({ zh: '占比', en: 'Share' })}</th>
                </tr>
              </thead>
              <tbody>
                {(data.concentration?.topHolders ?? []).map((holder, index) => (
                  <tr key={holder.address || index}>
                    <td className="num">{index + 1}</td>
                    <td>
                      <Address value={holder.address} href={`https://browser.anubispace.org/address/${holder.address}`} />
                    </td>
                    <td>
                      <Pill tone={holder.isContract ? 'warn' : 'neutral'}>
                        {holder.isContract ? pick({ zh: '合约', en: 'Contract' }) : pick({ zh: '钱包', en: 'Wallet' })}
                      </Pill>
                    </td>
                    <td className="num">{fmtInt(holder.value, lang)} LGNS</td>
                    <td className="num">{fmtPct(holder.sharePct, lang, 2)}</td>
                  </tr>
                ))}
                {!data.concentration?.topHolders.length && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[11px] text-muted">
                      {pick({ zh: '持仓索引暂不可读。', en: 'Holder index is temporarily unavailable.' })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '合约证据', en: 'Contract evidence' })}
          desc={pick({
            zh: '“已验证”指区块浏览器能核对源码；代理合约仍可能由管理员升级。',
            en: 'Verified means the explorer can compare source to bytecode; a proxy can still be upgraded by its admin.',
          })}
          action={
            <Link to={`/${lang}/about`} className="btn btn-ghost btn-sm">
              <Icon name="info" size={13} /> {pick({ zh: '能力边界', en: 'Limits' })}
            </Link>
          }
        />
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{pick({ zh: '合约', en: 'Contract' })}</th>
                <th>{pick({ zh: '链', en: 'Chain' })}</th>
                <th>{pick({ zh: '地址', en: 'Address' })}</th>
                <th>{pick({ zh: '状态', en: 'State' })}</th>
                <th>{pick({ zh: '浏览器', en: 'Explorer' })}</th>
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((contract) => (
                <tr key={contract.key}>
                  <td>
                    <div className="font-medium text-ink">{pick(contract.label)}</div>
                  </td>
                  <td>{contract.chain === 'anubis' ? 'Anubis' : 'Polygon'}</td>
                  <td>
                    <Address value={contract.address} href={contract.explorerUrl} head={8} tail={6} />
                  </td>
                  <td>
                    <div className="flex flex-col items-start gap-1">
                      <Pill tone={contract.verified === true ? 'ok' : contract.verified === false ? 'warn' : 'neutral'}>
                        {contract.verified === null
                          ? pick({ zh: '未确认', en: 'Unknown' })
                          : contract.verified
                            ? pick({ zh: '已开源', en: 'Verified' })
                            : pick({ zh: '未开源', en: 'Unverified' })}
                      </Pill>
                      {contract.proxyType && (
                        <span className="text-[9px] text-muted">{contract.proxyType}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <a href={contract.explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline">
                      {pick({ zh: '打开', en: 'Open' })} <Icon name="external" size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
