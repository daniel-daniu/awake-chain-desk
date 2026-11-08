import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { BASICS, GLOSSARY, METRIC_HELP, RISK_CHECKLIST } from '../data/learn'
import { Icon } from '../components/Icons'
import { PageIntro, Pill, SectionHeader } from '../components/ui'

export default function Learn() {
  const { lang, pick } = useI18n()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return GLOSSARY
    return GLOSSARY.filter(
      (item) =>
        item.term.zh.toLowerCase().includes(search) ||
        item.term.en.toLowerCase().includes(search) ||
        item.description.zh.toLowerCase().includes(search) ||
        item.description.en.toLowerCase().includes(search),
    )
  }, [query])

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'NO BACKGROUND NEEDED', en: 'NO BACKGROUND NEEDED' })}
        title={pick({ zh: '新手看懂', en: 'Understand the numbers' })}
        desc={pick({
          zh: '不要求懂代码。你只需要学会三件事：数字从哪里来、它实际说明什么、哪些地方最容易被误读。',
          en: 'No code required. Learn where a number comes from, what it actually means and where it is most often misread.',
        })}
        action={
          <a href="#glossary" className="btn btn-ghost">
            <Icon name="search" size={13} /> {pick({ zh: '查名词', en: 'Search glossary' })}
          </a>
        }
      />

      <nav className="scroll-x flex gap-2">
        {([
          ['basics', { zh: '四个基础概念', en: 'Four basics' }],
          ['metrics', { zh: '指标怎么读', en: 'Read metrics' }],
          ['checklist', { zh: '参与前核对', en: 'Checklist' }],
          ['glossary', { zh: '名词表', en: 'Glossary' }],
        ] as const).map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="focus-ring shrink-0 rounded-full border border-line bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-ink-2 hover:border-accent hover:text-accent"
          >
            {pick(label)}
          </a>
        ))}
      </nav>

      <section id="basics" className="section-anchor mt-9">
        <SectionHeader
          title={pick({ zh: '一、四个基础概念', en: '1. Four basic ideas' })}
          desc={pick({ zh: '掌握这四个概念，后面所有数据都有落点。', en: 'Once these four click, every other data point has context.' })}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {BASICS.map((item) => (
            <article key={item.number} className="card card-pad">
              <div className="flex items-center gap-2.5">
                <span className="num flex h-8 w-8 items-center justify-center rounded-xl bg-accentsoft text-[10px] font-semibold text-accent">
                  {item.number}
                </span>
                <h2 className="text-[13px] font-semibold">{pick(item.title)}</h2>
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-ink-2">{pick(item.summary)}</p>
              <ul className="mt-3 space-y-2 border-t border-line pt-3">
                {item.points.map((point) => (
                  <li key={point.en} className="flex gap-2 text-[10.5px] leading-relaxed text-muted">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    <span>{pick(point)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="metrics" className="section-anchor mt-10">
        <SectionHeader
          title={pick({ zh: '二、本站指标怎么读', en: '2. How to read the metrics' })}
          desc={pick({ zh: '左边是标签，中间是它的含义，右边是常见误读。', en: 'The label, its meaning and the common misread.' })}
        />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>{pick({ zh: '指标', en: 'Metric' })}</th>
                  <th>{pick({ zh: '它实际表示', en: 'What it means' })}</th>
                  <th>{pick({ zh: '注意事项', en: 'Watch out' })}</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_HELP.map((item) => (
                  <tr key={item.name.en}>
                    <td className="font-semibold text-ink">{pick(item.name)}</td>
                    <td className="leading-relaxed">{pick(item.meaning)}</td>
                    <td className="leading-relaxed text-muted">{pick(item.caution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="checklist" className="section-anchor mt-10">
        <SectionHeader
          title={pick({ zh: '三、参与前核对清单', en: '3. Verification checklist' })}
          desc={pick({ zh: '任何一项无法核对，都应该把“不确定”作为结果。', en: 'If any item cannot be verified, “uncertain” is a valid result.' })}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {RISK_CHECKLIST.map((item, index) => (
            <div key={item.en} className="card flex items-start gap-3 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f2eb] text-[10px] font-semibold text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="text-[11px] leading-relaxed text-ink-2">{pick(item)}</div>
            </div>
          ))}
          <div className="card flex items-start gap-3 border-[#efd7bc] bg-warnsoft/50 p-4">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-warn" />
            <div className="text-[10.5px] leading-relaxed text-[#74400e]">
              {pick({
                zh: '高年化可能来自增发、价格下跌前的暂时价格、短样本或无法持续的资金流入。不要把年化当作现金回报。',
                en: 'High APY can come from issuance, temporary prices before a decline, a short sample or unsustainable inflows. Do not treat it as cash return.',
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="glossary" className="section-anchor mt-10">
        <SectionHeader
          title={pick({ zh: '四、名词表', en: '4. Glossary' })}
          desc={pick({ zh: '搜索页面里出现的名词和概念。', en: 'Search terms and concepts used across the site.' })}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="search" size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={pick({ zh: '搜索名词…', en: 'Search terms…' })}
                  className="focus-ring h-9 w-[190px] rounded-xl border border-line bg-white pl-8 pr-3 text-[11px] outline-none placeholder:text-muted"
                />
              </div>
              <span className="text-[9.5px] text-muted">{filtered.length}/{GLOSSARY.length}</span>
            </div>
          }
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.term.en} className="rounded-xl border border-line bg-surface px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11.5px] font-semibold">{item.term.zh}</span>
                <span className="text-[8.5px] uppercase tracking-[0.08em] text-muted">{item.term.en}</span>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{pick(item.description)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 card card-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold">{pick({ zh: '现在去看真实数据', en: 'Now inspect real data' })}</div>
          <p className="mt-1 text-[10px] text-muted">{pick({ zh: '先看原始读数，再看产品解释。', en: 'Read the raw values before the product explanation.' })}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/${lang}/chains`} className="btn btn-primary btn-sm">
            {pick({ zh: '链上数据', en: 'On-chain data' })} <Icon name="arrow" size={12} />
          </Link>
          <Link to={`/${lang}/products`} className="btn btn-ghost btn-sm">
            {pick({ zh: '产品对比', en: 'Products' })}
          </Link>
        </div>
      </div>
    </div>
  )
}
