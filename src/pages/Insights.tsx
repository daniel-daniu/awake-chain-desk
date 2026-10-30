import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useFlow, usePrice, useToken } from '../lib/api'
import { computeRisk } from '../lib/math'
import { fmtInt, fmtNum, fmtPct, fmtPrice, fmtUsd } from '../lib/format'
import { Bar, Pill, SectionHeader } from '../components/ui'
import { MetricCard, RiskGauge } from '../components/blocks'
import { IconAlert, IconArrow, IconCheck, IconInfo } from '../components/Icons'

export default function Insights() {
  const { t, lang, pick } = useI18n()
  const priceQ = usePrice()
  const tokenQ = useToken()
  const flowQ = useFlow()
  const price = priceQ.data?.data
  const token = tokenQ.data?.data
  const [holding, setHolding] = useState(10000)

  const flow = flowQ.data?.data

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

  const dictionary = [
    {
      name: { zh: '跨链价差', en: 'Cross-chain spread' },
      formula: 'polygon price / anubis price',
      source: 'QuickSwap / RocketSwap pair reserves',
      note: { zh: '同名代币、不同链与合约；价差反映流动性与兑付通道差异，不代表可套利。', en: 'Same symbol, different chains and contracts; the gap reflects liquidity and redemption differences, not arbitrage.' },
    },
    {
      name: { zh: '可验证资金覆盖率', en: 'Verifiable reserve coverage' },
      formula: 'reserve DAI / market cap',
      source: 'Blockscout address balances',
      note: { zh: '没有官方标注的资金地址，当前记为 N/A；疑似地址按市值计算仅作上界参考。', en: 'No labeled reserve address; recorded as N/A. The probable address is an upper-bound reference only.' },
    },
    {
      name: { zh: '持仓集中度', en: 'Holder concentration' },
      formula: 'top1 balance / total supply',
      source: 'Blockscout token holders',
      note: { zh: '同时给出剔除合约后的结果，避免把质押合约误当个人巨鲸。', en: 'A contract-excluded view is also shown to avoid mistaking the staking contract for a whale.' },
    },
    {
      name: { zh: '流动性深度', en: 'Liquidity depth' },
      formula: 'primary pool DAI / market cap',
      source: 'RocketSwap pair reserves',
      note: { zh: '比例越低，同等卖压造成的价格冲击越大。', en: 'Lower ratio means larger price impact for the same sell pressure.' },
    },
    {
      name: { zh: 'claimInterest 样本', en: 'claimInterest sample' },
      formula: 'count(method = 0xd286f3cf) / sampled transfers',
      source: 'Blockscout token transfers',
      note: { zh: '只统计样本内领取笔数与金额，不做全天或年化外推。', en: 'Counts claims within the sample only; no full-day or annualized extrapolation.' },
    },
    {
      name: { zh: 'TVL', en: 'TVL' },
      formula: 'staking balance × price',
      source: 'LGNS balanceOf + primary pool quote',
      note: { zh: '若合约地址识别错误，TVL 会随之失真。', en: 'If the contract label is wrong, TVL is wrong too.' },
    },
  ]

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{t('insights.title')}</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{t('insights.desc')}</p>
        </div>
        <Pill tone="warn" className="self-start">
          <IconInfo size={12} /> {t('risk.confidence')} {risk ? `${(risk.confidence * 100).toFixed(0)}%` : '—'}
        </Pill>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#F1E2C8] bg-warn-soft px-4 py-3 text-[12px] leading-relaxed text-[#7A4A0C]">
        <span className="mt-0.5 shrink-0">
          <IconAlert size={15} />
        </span>
        {t('insights.banner')}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="card card-pad flex flex-col items-center justify-center">
          {risk ? <RiskGauge risk={risk} /> : <div className="skeleton h-[180px] w-full" />}
          <div className="mt-3 text-center text-[11px] leading-relaxed text-muted">
            {risk ? `${t('risk.score')} ${risk.score.toFixed(1)} / 100 · ${t(`risk.${risk.level}`)}` : ''}
          </div>
          <p className="mt-2 max-w-[280px] text-center text-[10px] leading-relaxed text-muted">{t('insights.hardRule')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label={t('home.price.cross')}
            value={price?.crossChainSpread ? `${price.crossChainSpread.toFixed(2)}×` : '—'}
            tone="danger"
            hint={price?.polygon ? `Polygon ${fmtPrice(price.polygon.price, lang)} / Anubis ${fmtPrice(price.primary, lang)}` : undefined}
          >
            <Bar value={price?.crossChainSpread ? Math.min(1, price.crossChainSpread / 5) : 0} tone="danger" />
          </MetricCard>
          <MetricCard
            label={t('chain.top1')}
            value={token ? fmtPct(token.concentration.top1, lang, 1) : '—'}
            tone="danger"
            hint={token ? `${fmtNum((token.stakingBalance ?? 0) / 1e9, lang, 2)}B LGNS` : undefined}
          >
            <Bar value={token?.concentration.top1 ?? 0} tone="danger" />
          </MetricCard>
          <MetricCard
            label={t('home.price.liquidity')}
            value={price ? fmtUsd(price.sources.find((s) => s.pair)?.liquidityUsd ?? 0, lang) : '—'}
            hint={price ? `≈ ${fmtPct((price.sources.find((s) => s.pair)?.liquidityUsd ?? 0) / ((token?.totalSupply ?? 0) * price.primary), lang, 1)} of mcap` : undefined}
          />
          <MetricCard
            label={t('home.snapshot.holders')}
            value={token ? fmtInt(token.holders, lang) : '—'}
            hint={t('chain.note')}
          />
        </div>
      </div>

      {/* Factors */}
      <section className="mt-10">
        <SectionHeader title={t('insights.factors')} desc={t('insights.factorsDesc')} />
        <div className="grid gap-3 lg:grid-cols-2">
          {(risk?.factors ?? []).map((f, i, arr) => (
            <div key={f.key} className={`card card-pad ${arr.length % 2 === 1 && i === arr.length - 1 ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{pick(f.label)}</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    {t('risk.weight')} {f.weight}% · {f.source}
                  </div>
                </div>
                <Pill tone={f.status === 'danger' ? 'danger' : f.status === 'warn' ? 'warn' : f.status === 'ok' ? 'ok' : 'neutral'}>
                  {t(`risk.${f.status}`)}
                </Pill>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div className="num text-[24px] font-semibold leading-none text-ink">{f.value}</div>
                <div className="text-right text-[11px] text-muted">
                  score <span className="num text-ink">{f.score}</span> / 100
                </div>
              </div>
              <div className="mt-2">
                <Bar value={f.score / 100} tone={f.status === 'danger' ? 'danger' : f.status === 'warn' ? 'warn' : f.status === 'ok' ? 'ok' : 'accent'} />
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{pick(f.detail)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="mt-10">
        <SectionHeader title={t('insights.scenarios')} desc={t('insights.scenariosDesc')} />
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
            <label className="text-[12px] text-muted">{t('insights.holding')}</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={holding}
              onChange={(e) => setHolding(Math.max(0, Number(e.target.value) || 0))}
              className="num h-8 w-32 rounded-lg border border-line bg-white px-2.5 text-[12px] text-ink outline-none focus:border-accent"
            />
            <span className="text-[11px] text-muted">LGNS</span>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('insights.scenario')}</th>
                  <th>{t('insights.price')}</th>
                  <th>{t('insights.value')}</th>
                  <th>{t('insights.diff')}</th>
                  <th className="hidden md:table-cell">{t('insights.note')}</th>
                </tr>
              </thead>
              <tbody>
                {(risk?.scenarios ?? []).map((s) => {
                  const value = holding * s.price
                  const diff = value - holding * (price?.primary ?? 0)
                  return (
                    <tr key={s.key}>
                      <td className="font-medium text-ink">{pick(s.label)}</td>
                      <td className="num">{fmtPrice(s.price, lang)}</td>
                      <td className="num">{fmtUsd(value, lang, 0)}</td>
                      <td className={`num ${diff < 0 ? 'text-danger' : 'text-ok'}`}>
                        {diff < 0 ? '−' : diff > 0 ? '+' : ''}
                        {fmtUsd(Math.abs(diff), lang, 0)}
                      </td>
                      <td className="hidden max-w-[320px] text-[11px] leading-relaxed text-muted md:table-cell">{pick(s.note)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Operating reference */}
      <section className="mt-10">
        <SectionHeader title={t('insights.stance')} desc={t('insights.stanceDesc')} />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { key: 'observe', tone: 'ok' as const, desc: t('insights.stance.observeDesc'), checks: [t('insights.check1'), t('insights.check4')] },
            { key: 'caution', tone: 'warn' as const, desc: t('insights.stance.cautionDesc'), checks: [t('insights.check2'), t('insights.check3')] },
            { key: 'risk', tone: 'danger' as const, desc: t('insights.stance.riskDesc'), checks: [t('insights.check4'), t('insights.check3')] },
          ].map((x) => (
            <div key={x.key} className="card card-pad">
              <Pill tone={x.tone}>{t(`insights.stance.${x.key}`)}</Pill>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-2">{x.desc}</p>
              <div className="mt-3 border-t border-line pt-3">
                <div className="label">{t('insights.stance.check')}</div>
                <ul className="mt-1.5 space-y-1.5">
                  {x.checks.map((c) => (
                    <li key={c} className="flex items-start gap-1.5 text-[11px] text-muted">
                      <IconCheck size={12} className="mt-0.5 shrink-0 text-accent" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manual notes */}
      <section className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <SectionHeader title={t('insights.manual')} />
          <div className="card space-y-4 px-5 py-5 text-[12.5px] leading-relaxed text-ink-2">
            <p>{t('insights.manual1')}</p>
            <p>{t('insights.manual2')}</p>
            <p>{t('insights.manual3')}</p>
          </div>
        </div>
        <div>
          <SectionHeader title={t('insights.observe')} />
          <ul className="card divide-y divide-line">
            {[t('insights.observe1'), t('insights.observe2'), t('insights.observe3'), t('insights.observe4')].map((x) => (
              <li key={x} className="flex gap-2.5 px-5 py-3.5 text-[12px] leading-relaxed text-ink-2">
                <IconCheck size={14} className="mt-0.5 shrink-0 text-accent" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Dictionary */}
      <section className="mt-10">
        <SectionHeader title={t('insights.dictionary')} desc={t('insights.dictionaryDesc')} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('risk.factor')}</th>
                  <th>Formula</th>
                  <th>{t('common.source')}</th>
                  <th className="hidden md:table-cell">{t('insights.note')}</th>
                </tr>
              </thead>
              <tbody>
                {dictionary.map((d) => (
                  <tr key={d.formula}>
                    <td className="font-medium text-ink">{pick(d.name)}</td>
                    <td className="mono text-[11px]">{d.formula}</td>
                    <td className="text-[11px]">{d.source}</td>
                    <td className="hidden max-w-[360px] text-[11px] leading-relaxed text-muted md:table-cell">{pick(d.note)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-line bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px] leading-relaxed text-muted">{t('products.notAdvice')}</div>
        <Link to={`/${lang}/about`} className="btn btn-ghost btn-sm shrink-0">
          {t('about.disclaimer')} <IconArrow size={13} />
        </Link>
      </div>
    </div>
  )
}
