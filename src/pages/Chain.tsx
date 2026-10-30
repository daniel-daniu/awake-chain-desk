import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFlow, usePrice, useStats, useToken, useYield } from '../lib/api'
import { fmtInt, fmtNum, fmtPct, fmtPrice, fmtUsd, shortAddr } from '../lib/format'
import { addressUrl, CONTRACTS, tokenUrl } from '../config/contracts'
import { Bar, CopyButton, ExternalLink, Pill, SectionHeader, UpdatedAt } from '../components/ui'
import { MetricCard, YieldPanel } from '../components/blocks'
import { IconArrow, IconInfo } from '../components/Icons'

export default function Chain() {
  const { t, lang, pick } = useI18n()
  const statsQ = useStats()
  const tokenQ = useToken()
  const priceQ = usePrice()
  const flowQ = useFlow()
  const yieldQ = useYield()
  const stats = statsQ.data?.data
  const token = tokenQ.data?.data
  const price = priceQ.data?.data
  const a = stats?.anubis
  const p = stats?.polygon
  const flow = flowQ.data?.data
  const yieldData = yieldQ.data
  const blocks = stats?.blocks ?? []

  const staked = token?.stakingBalance ?? 0

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{t('chain.title')}</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{t('chain.desc')}</p>
        </div>
        <UpdatedAt ts={stats?.ts} stale={statsQ.data?.stale} />
      </div>

      {/* Dual-chain price */}
      <section className="mt-6">
        <SectionHeader title={t('home.price.title')} desc={t('home.price.crossNote')} />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="label">{t('home.price.anubis')}</span>
            </div>
            <div className="num mt-2 text-[28px] font-semibold leading-none text-ink">{price ? fmtPrice(price.primary, lang) : 'N/A'}</div>
            <div className="mt-2 text-[11px] text-muted">
              {price ? fmtUsd(price.sources.find((s) => s.pair)?.liquidityUsd ?? 0, lang) : '—'} DAI
            </div>
          </div>
          <div className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CE6]" />
              <span className="label">{t('home.price.polygon')}</span>
            </div>
            <div className="num mt-2 text-[28px] font-semibold leading-none text-ink">
              {price?.polygon ? fmtPrice(price.polygon.price, lang) : 'N/A'}
            </div>
            <div className="mt-2 text-[11px] text-muted">
              {price?.polygon ? fmtUsd(price.polygon.liquidity, lang) : '—'} DAI
            </div>
          </div>
          <div className="card card-pad">
            <div className="label">{t('home.price.cross')}</div>
            <div className="num mt-2 text-[28px] font-semibold leading-none text-danger">
              {price?.crossChainSpread ? `${price.crossChainSpread.toFixed(2)}×` : 'N/A'}
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-muted">
              {t('home.price.crossNote')}
            </div>
          </div>
        </div>
      </section>

      {/* Yield & fees */}
      <section className="mt-8">
        <SectionHeader
          title={pick({ zh: '利息、手续费与产品对比', en: 'Interest, fees & product comparison' })}
          desc={pick({
            zh: '质押 index、总供应、gas 与税率均来自链上读数；长周期额外激励没有公开可读参数，未计入。',
            en: 'Staking index, supply, gas and taxes are read on-chain; extra long-lock incentives have no public readable parameters and are excluded.',
          })}
        />
        <YieldPanel data={yieldData} />
      </section>

      {/* Network */}
      <section className="mt-8">
        <SectionHeader title={t('home.chain.title')} desc={t('home.chain.desc')} />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <div className="text-[15px] font-semibold text-ink">Anubis Chain</div>
                <div className="mono mt-0.5 text-[11px] text-muted">chainId 6714 · native DAI</div>
              </div>
              <Pill tone="accent">Layer 1 · EVM</Pill>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
              {[
                { l: t('chain.blockHeight'), v: a ? fmtInt(a.blockNumber, lang) : 'N/A' },
                { l: t('chain.blockTime'), v: a?.blockTime ? `${a.blockTime.toFixed(3)}s` : 'N/A' },
                { l: t('chain.blocksPerDay'), v: a?.blocksPerDay ? fmtInt(a.blocksPerDay, lang) : 'N/A' },
                { l: t('chain.totalTx'), v: a ? fmtInt(a.totalTransactions, lang) : 'N/A' },
                { l: t('chain.txToday'), v: a ? fmtInt(a.txToday, lang) : 'N/A' },
                { l: t('chain.addresses'), v: a ? fmtInt(a.totalAddresses, lang) : 'N/A' },
                { l: t('chain.blockReward'), v: a?.blockReward !== null && a?.blockReward !== undefined ? `${fmtNum(a.blockReward, lang, 2)} DAI` : 'N/A' },
                { l: t('chain.avgBlockFee'), v: a?.avgBlockFee ? `${fmtNum(a.avgBlockFee, lang, 4)} DAI` : 'N/A' },
                { l: t('chain.dailyFee'), v: a?.dailyFee ? `${fmtNum(a.dailyFee, lang, 0)} DAI` : 'N/A' },
              ].map((x) => (
                <div key={x.l} className="bg-white px-4 py-3.5">
                  <div className="label">{x.l}</div>
                  <div className="num mt-1 text-[14px] font-semibold text-ink">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{t('chain.gas')} (slow / avg / fast)</span>
                <span className="num text-ink">
                  {a ? `${fmtNum(a.gas.slow, lang, 2)} / ${fmtNum(a.gas.average, lang, 2)} / ${fmtNum(a.gas.fast, lang, 2)}` : 'N/A'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                <span>{t('chain.utilization')}</span>
                <span className="num text-ink">{a ? `${fmtNum(a.utilization, lang, 2)}%` : 'N/A'}</span>
              </div>
              <div className="mt-1.5">
                <Bar value={(a?.utilization ?? 0) / 100} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                区块奖励来自区块 <span className="mono">rewards</span> 字段，当前为空数组，按 0 计。手续费为区块 <span className="mono">transaction_fees</span> 均值 × 实测日块数。
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <div className="text-[15px] font-semibold text-ink">Polygon</div>
                <div className="mono mt-0.5 text-[11px] text-muted">chainId 137 · native POL</div>
              </div>
              <Pill tone="neutral">PoS</Pill>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
              {[
                { l: t('chain.blockHeight'), v: p ? fmtInt(p.blockNumber, lang) : 'N/A' },
                { l: t('chain.blockTime'), v: p?.blockTime ? `${p.blockTime.toFixed(2)}s` : 'N/A' },
                { l: t('chain.blocksPerDay'), v: p?.blocksPerDay ? fmtInt(p.blocksPerDay, lang) : 'N/A' },
                { l: t('chain.gasPrice'), v: p ? `${fmtNum(p.gasPriceGwei, lang, 2)} gwei` : 'N/A' },
                { l: t('chain.simpleTransferFee'), v: p?.simpleTransferFee ? `${fmtNum(p.simpleTransferFee, lang, 5)} POL` : 'N/A' },
                { l: t('chain.native'), v: 'POL · 18' },
              ].map((x) => (
                <div key={x.l} className="bg-white px-4 py-3.5">
                  <div className="label">{x.l}</div>
                  <div className="num mt-1 text-[14px] font-semibold text-ink">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-surface-2 px-5 py-4 text-[11px] leading-relaxed text-muted">
              {t('chain.polygonNote')}
            </div>
          </div>
        </div>
      </section>

      {/* Interest flow */}
      <section className="mt-8">
        <SectionHeader title={t('chain.stakingFlow')} desc={t('chain.stakingFlowDesc')} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            label={t('chain.sampled')}
            value={flow ? fmtInt(flow.sampled, lang) : 'N/A'}
            hint={flow ? `${fmtNum(flow.spanSec, lang, 0)}s` : undefined}
          />
          <MetricCard
            label={t('chain.claims')}
            value={flow ? fmtInt(flow.claims, lang) : 'N/A'}
            hint={flow ? `${t('chain.claimShare')} ${fmtPct(flow.claimShare, lang, 1)}` : undefined}
          />
          <MetricCard
            label={t('chain.medianClaim')}
            value={flow ? `${fmtNum(flow.medianClaim, lang, 2)} LGNS` : 'N/A'}
          />
          <MetricCard
            label={t('chain.trimmedMean')}
            value={flow ? `${fmtNum(flow.trimmedMeanClaim ?? 0, lang, 2)} LGNS` : 'N/A'}
          />
          <MetricCard
            label="Max claim"
            value={flow ? `${fmtNum(flow.maxClaim, lang, 2)} LGNS` : 'N/A'}
          />
          <MetricCard
            label={t('home.snapshot.staking')}
            value={staked ? `${fmtNum(staked / 1e9, lang, 2)}B` : 'N/A'}
            hint="LGNS"
          />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-white px-5 py-4 text-[11px] leading-relaxed text-muted">
          <IconInfo size={14} className="mt-0.5 shrink-0 text-warn" />
          {t('chain.flowNote')}
        </div>
      </section>

      {/* Concentration */}
      <section className="mt-8">
        <SectionHeader title={t('chain.holdersTitle')} desc={t('chain.holdersDesc')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t('chain.top1')}
            value={token ? fmtPct(token.concentration.top1, lang, 1) : '—'}
            tone="danger"
            hint={CONTRACTS.staking.label[lang]}
          >
            <Bar value={token?.concentration.top1 ?? 0} tone="danger" />
          </MetricCard>
          <MetricCard label={t('chain.top10')} value={token ? fmtPct(token.concentration.top10, lang, 1) : '—'} hint={t('chain.note')}>
            <Bar value={token?.concentration.top10 ?? 0} tone="warn" />
          </MetricCard>
          <MetricCard label={t('chain.top1Eoa')} value={token ? fmtPct(token.concentration.top1Eoa, lang, 2) : '—'} hint="Excluding contracts">
            <Bar value={token?.concentration.top1Eoa ?? 0} tone="ok" />
          </MetricCard>
          <MetricCard
            label={t('home.price.liquidity')}
            value={price ? fmtUsd(price.sources.find((s) => s.pair)?.liquidityUsd ?? 0, lang) : '—'}
            hint={price ? `LGNS ${fmtPrice(price.primary, lang)}` : undefined}
          />
        </div>

        <div className="card mt-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="text-[13px] font-semibold text-ink">{t('chain.holdersTitle')}</div>
            <span className="text-[11px] text-muted">{token ? `${fmtInt(token.holders, lang)} holders` : ''}</span>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th className="w-10">{t('chain.rank')}</th>
                  <th>{t('chain.address')}</th>
                  <th>{t('common.type')}</th>
                  <th className="text-right">{t('common.amount')}</th>
                  <th className="text-right">{t('chain.share')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(token?.topHolders ?? []).map((h, i) => (
                  <tr key={h.address || i}>
                    <td className="num text-muted">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="mono text-[12px] text-ink">{shortAddr(h.address, 8, 6)}</span>
                        <CopyButton value={h.address} />
                      </div>
                      {h.name && <div className="mt-0.5 text-[11px] text-muted">{h.name}</div>}
                    </td>
                    <td>
                      <Pill tone={h.isContract ? 'warn' : 'neutral'}>{h.isContract ? t('common.contract') : t('common.wallet')}</Pill>
                    </td>
                    <td className="num text-right">{fmtNum(h.value / 1e9, lang, 2)}B</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="num w-14 text-[12px]">{fmtPct(h.share, lang, 2)}</span>
                        <div className="hidden w-16 sm:block">
                          <Bar value={h.share} tone={h.share > 0.5 ? 'danger' : 'accent'} height={4} />
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <a href={addressUrl(h.address)} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent">
                        <IconArrow size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line bg-surface-2 px-5 py-3 text-[11px] text-muted">{t('chain.note')}</div>
        </div>
      </section>

      {/* Recent blocks */}
      {blocks.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={t('chain.recentBlocks')} desc="Anubis Blockscout · latest blocks" />
          <div className="card overflow-hidden">
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t('chain.height')}</th>
                    <th>{t('chain.txs')}</th>
                    <th>{t('chain.gasUsed')}</th>
                    <th>{t('chain.time')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b) => (
                    <tr key={b.height}>
                      <td className="mono text-ink">{fmtInt(b.height, lang)}</td>
                      <td className="num">{b.txs ?? '—'}</td>
                      <td className="num">{b.gasUsed !== null ? `${b.gasUsed.toFixed(2)}%` : '—'}</td>
                      <td className="text-[12px] text-muted">{new Date(b.timestamp).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US')}</td>
                      <td className="text-right">
                        <a
                          href={`https://browser.anubispace.org/block/${b.height}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-accent"
                        >
                          <IconArrow size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Contracts */}
      <section className="mt-8">
        <SectionHeader title={t('products.evidence')} desc={t('insights.dictionaryDesc')} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('common.contract')}</th>
                  <th>{t('chain.address')}</th>
                  <th>{t('products.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {Object.values(CONTRACTS).map((c) => (
                  <tr key={c.address}>
                    <td>
                      <div className="font-medium text-ink">{c.label[lang]}</div>
                      <div className="mt-0.5 text-[11px] text-muted">{c.note[lang]}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="mono text-[11px]">{shortAddr(c.address, 8, 6)}</span>
                        <CopyButton value={c.address} />
                      </div>
                    </td>
                    <td>
                      <Pill tone={c.verified ? 'ok' : 'warn'}>{c.verified ? t('common.verified') : t('common.unverified')}</Pill>
                    </td>
                    <td className="text-right">
                      <ExternalLink href={c.kind === 'token' ? tokenUrl(c.address) : addressUrl(c.address)}>{t('common.viewExplorer')}</ExternalLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-line bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <span className="mt-0.5 text-warn">
            <IconInfo size={15} />
          </span>
          {t('about.limitsDesc')}
        </div>
        <Link to={`/${lang}/insights`} className="btn btn-ghost btn-sm shrink-0">
          {t('nav.insights')} <IconArrow size={13} />
        </Link>
      </div>
    </div>
  )
}
