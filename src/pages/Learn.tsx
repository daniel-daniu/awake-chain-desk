import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { BASICS, GLOSSARY, METRICS, MISREADS } from '../data/learn'
import { Pill, SectionHeader } from '../components/ui'
import { IconAlert, IconArrow, IconInfo } from '../components/Icons'

export default function Learn() {
  const { lang, pick } = useI18n()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase()
    if (!key) return GLOSSARY
    return GLOSSARY.filter(
      (g) =>
        g.term.zh.toLowerCase().includes(key) ||
        g.term.en.toLowerCase().includes(key) ||
        g.desc.zh.toLowerCase().includes(key) ||
        g.desc.en.toLowerCase().includes(key),
    )
  }, [q])

  const anchors = [
    { id: 'basics', label: pick({ zh: '四个基础概念', en: 'Four basics' }) },
    { id: 'metrics', label: pick({ zh: '指标怎么读', en: 'Reading the metrics' }) },
    { id: 'misread', label: pick({ zh: '三个易错点', en: 'Three misreads' }) },
    { id: 'glossary', label: pick({ zh: '名词表', en: 'Glossary' }) },
  ]

  return (
    <div className="container-page py-8 md:py-10">
      <div className="max-w-3xl">
        <Pill tone="accent">
          <IconInfo size={12} /> {pick({ zh: '不需要任何基础', en: 'No background needed' })}
        </Pill>
        <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">
          {pick({ zh: '看懂这里的每一个数字', en: 'Understand every number here' })}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-2 md:text-[14px]">
          {pick({
            zh: '这一页不要求你懂技术。看完你应该能回答三个问题：这些数字是从哪来的、它到底在说什么、哪些地方最容易被误读。本站所有数据都直接从链上合约读取，读不到的就写「链上不可读」，不猜、不补。',
            en: 'No technical background required. After this page you should be able to answer three things: where these numbers come from, what they actually say, and where they are most often misread. Every figure here is read straight from on-chain contracts; anything unreadable is labelled as such instead of guessed.',
          })}
        </p>
      </div>

      <nav className="mt-5 flex flex-wrap gap-2">
        {anchors.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-ink-2 transition hover:border-accent hover:text-accent"
          >
            {a.label}
          </a>
        ))}
      </nav>

      {/* 1. 基础概念 */}
      <section id="basics" className="mt-10 scroll-mt-24">
        <SectionHeader
          title={pick({ zh: '一、四个基础概念', en: '1. Four basic ideas' })}
          desc={pick({
            zh: '这四条懂了，后面所有数字都能对上号。',
            en: 'Once these four click, every other number falls into place.',
          })}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {BASICS.map((b) => (
            <div key={b.n} className="card card-pad">
              <div className="flex items-center gap-2.5">
                <span className="num flex h-7 w-7 items-center justify-center rounded-lg bg-accentsoft text-[12px] font-semibold text-accent">
                  {b.n}
                </span>
                <h3 className="text-[14px] font-semibold text-ink">{pick(b.title)}</h3>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-ink-2">{pick(b.lead)}</p>
              <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                {b.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-muted">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    <span>{pick(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 指标怎么读 */}
      <section id="metrics" className="mt-10 scroll-mt-24">
        <SectionHeader
          title={pick({ zh: '二、本站指标怎么读', en: '2. How to read our metrics' })}
          desc={pick({
            zh: '左边是你在页面上看到的词，中间是它真正在说什么，右边是最容易忽略的地方。',
            en: 'Left is the label you see, middle is what it really says, right is what people miss.',
          })}
        />

        <div className="card hidden overflow-hidden md:block">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th className="w-[22%]">{pick({ zh: '指标', en: 'Metric' })}</th>
                  <th className="w-[40%]">{pick({ zh: '它其实在说', en: 'What it says' })}</th>
                  <th>{pick({ zh: '要注意', en: 'Watch out' })}</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m, i) => (
                  <tr key={i}>
                    <td className="align-top font-medium text-ink">{pick(m.name)}</td>
                    <td className="align-top text-[12px] leading-relaxed text-ink-2">{pick(m.reads)}</td>
                    <td className="align-top text-[12px] leading-relaxed text-muted">{pick(m.watch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2 md:hidden">
          {METRICS.map((m, i) => (
            <div key={i} className="card card-pad">
              <div className="text-[13px] font-semibold text-ink">{pick(m.name)}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">{pick(m.reads)}</p>
              <p className="mt-2 flex gap-1.5 border-t border-line pt-2 text-[11px] leading-relaxed text-muted">
                <span className="mt-[3px] shrink-0 text-warn">
                  <IconAlert size={11} />
                </span>
                {pick(m.watch)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 易错点 */}
      <section id="misread" className="mt-10 scroll-mt-24">
        <SectionHeader
          title={pick({ zh: '三、三个最容易误读的地方', en: '3. Three most common misreads' })}
          desc={pick({
            zh: '这三条比任何指标都重要，因为它们直接决定你会不会亏钱。',
            en: 'These matter more than any single metric, because they decide whether you lose money.',
          })}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {MISREADS.map((m, i) => (
            <div key={i} className="card card-pad border-[#F1E2C8] bg-warn-soft/40">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-warn">
                  <IconAlert size={15} />
                </span>
                <h3 className="text-[13px] font-semibold leading-snug text-ink">{pick(m.title)}</h3>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{pick(m.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 名词表 */}
      <section id="glossary" className="mt-10 scroll-mt-24">
        <SectionHeader
          title={pick({ zh: '四、名词表', en: '4. Glossary' })}
          desc={pick({
            zh: '页面上出现的词，这里都能查到。输入关键词可以过滤。',
            en: 'Every term used on this site. Type to filter.',
          })}
          action={
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={pick({ zh: '搜索名词…', en: 'Search terms…' })}
                className="h-9 w-[190px] rounded-lg border border-line bg-white px-3 text-[12px] text-ink outline-none placeholder:text-muted focus:border-accent"
              />
              <span className="text-[11px] text-muted">
                {filtered.length}/{GLOSSARY.length}
              </span>
            </div>
          }
        />

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-[12px] text-muted">
            {pick({ zh: '没有匹配的名词，换个关键词试试。', en: 'No matching term. Try another keyword.' })}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((g, i) => (
              <div key={i} className="rounded-xl border border-line bg-white px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-semibold text-ink">{g.term.zh}</span>
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted">{g.term.en}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{pick(g.desc)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 下一步 */}
      <section className="mt-10">
        <div className="card card-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[13px] font-semibold text-ink">
              {pick({ zh: '看懂了，接下来按这个顺序看', en: 'Ready — go in this order' })}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {pick({
                zh: '先看链上原始读数，再看风险解读，最后才看产品收益。顺序反了，很容易被数字带着走。',
                en: 'Raw on-chain readings first, then the risk read, and only then product yields. Reverse the order and the numbers start leading you.',
              })}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to={`/${lang}/chain`} className="btn btn-primary btn-sm">
              {pick({ zh: '链上数据', en: 'On-chain data' })} <IconArrow size={13} />
            </Link>
            <Link to={`/${lang}/insights`} className="btn btn-ghost btn-sm">
              {pick({ zh: '风险解读', en: 'Risk read' })}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
