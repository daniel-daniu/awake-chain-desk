import type { ReactNode } from 'react'
import { useState } from 'react'
import type { Availability, Bi, SourceInfo } from '../types'
import { useI18n } from '../lib/i18n'
import { relativeTime, shortAddr } from '../lib/format'
import { Icon } from './Icons'

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger'

export function Pill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return <span className={`pill pill-${tone} ${className}`}>{children}</span>
}

export function SectionHeader({
  title,
  desc,
  action,
}: {
  title: ReactNode
  desc?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-ink md:text-[21px]">{title}</h2>
        {desc && <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-muted">{desc}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
  children,
  className = '',
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'ok' | 'warn' | 'danger' | 'accent'
  children?: ReactNode
  className?: string
}) {
  const valueTone =
    tone === 'danger'
      ? 'text-danger'
      : tone === 'warn'
        ? 'text-warn'
        : tone === 'ok'
          ? 'text-ok'
          : tone === 'accent'
            ? 'text-accent'
            : 'text-ink'
  return (
    <div className={`card card-pad ${className}`}>
      <div className="label">{label}</div>
      <div className={`num mt-2 text-[19px] font-semibold leading-tight tracking-[-0.02em] md:text-[22px] ${valueTone}`}>
        {value}
      </div>
      {hint && <div className="mt-2 text-[10.5px] leading-relaxed text-muted">{hint}</div>}
      {children}
    </div>
  )
}

export function DataStatusBadge({
  availability,
  stale,
}: {
  availability: Availability
  stale?: boolean
}) {
  const { lang } = useI18n()
  if (stale || availability === 'stale') return <Pill tone="warn">{lang === 'zh' ? '缓存已过期' : 'Stale cache'}</Pill>
  if (availability === 'live') return <Pill tone="ok">{lang === 'zh' ? '链上可读' : 'Readable'}</Pill>
  if (availability === 'partial') return <Pill tone="warn">{lang === 'zh' ? '部分可读' : 'Partial'}</Pill>
  return <Pill tone="neutral">{lang === 'zh' ? '不可读' : 'Unavailable'}</Pill>
}

export function UpdatedAt({
  timestamp,
  stale,
  partial,
  maxAgeMinutes,
  onRefresh,
  refreshing,
}: {
  timestamp?: string | null
  stale?: boolean
  partial?: boolean
  maxAgeMinutes?: number
  onRefresh?: () => void
  refreshing?: boolean
}) {
  const { t, lang } = useI18n()
  const timestampValue = timestamp ? new Date(timestamp).getTime() : Number.NaN
  const inferredStale =
    Number.isFinite(timestampValue) &&
    typeof maxAgeMinutes === 'number' &&
    Date.now() - timestampValue > maxAgeMinutes * 60_000
  const isStale = stale ?? inferredStale
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${isStale ? 'bg-danger' : partial ? 'bg-warn' : 'bg-ok'}`} />
        {isStale ? t('common.stale') : partial ? t('common.partial') : t('common.live')}
      </span>
      <span>
        {timestamp ? `${t('common.updated')} ${relativeTime(timestamp, lang)}` : t('common.updateUnavailable')}
      </span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="focus-ring inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-accent hover:bg-accentsoft"
          aria-label={t('common.refresh')}
        >
          <Icon name="refresh" size={12} className={refreshing ? 'animate-spin' : ''} />
          {t('common.refresh')}
        </button>
      )}
    </div>
  )
}

export function SourceStrip({ sources }: { sources: SourceInfo[] }) {
  const { lang } = useI18n()
  const sourceName = (source: SourceInfo) => {
    if (lang === 'zh') return source.name
    if (source.id === 'lgns-tech') return 'LGNS Tools'
    if (source.id === 'medium') return 'Anubis Global · Medium'
    if (source.id === 'google-news') return 'Google News'
    return source.name
  }
  if (!sources.length) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sources.slice(0, 5).map((source) => (
        <span
          key={source.id}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-white/70 px-2 py-1 text-[9.5px] text-muted"
          title={source.url}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              source.status === 'ok' ? 'bg-ok' : source.status === 'partial' ? 'bg-warn' : 'bg-danger'
            }`}
          />
          {sourceName(source)}
          {source.blockNumber ? (
            <span className="mono">#{source.blockNumber.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
          ) : null}
        </span>
      ))}
    </div>
  )
}

export function WarningList({ items }: { items: Array<{ code: string; message: Bi }> }) {
  const { pick } = useI18n()
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.code}
          className="flex items-start gap-2 rounded-xl border border-[#efd7bc] bg-warnsoft px-3.5 py-2.5 text-[11px] leading-relaxed text-[#74400e]"
        >
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          <span>{pick(item.message)}</span>
        </div>
      ))}
    </div>
  )
}

export function CopyButton({ value }: { value: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="focus-ring rounded-md p-1 text-muted hover:bg-accentsoft hover:text-accent"
      aria-label={t('common.copy')}
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={12} />
    </button>
  )
}

export function Address({
  value,
  href,
  head = 6,
  tail = 4,
}: {
  value: string
  href?: string
  head?: number
  tail?: number
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mono text-[11px] text-accent hover:underline">
          {shortAddr(value, head, tail)}
        </a>
      ) : (
        <span className="mono text-[11px]">{shortAddr(value, head, tail)}</span>
      )}
      <CopyButton value={value} />
    </span>
  )
}

export function ProgressBar({
  value,
  tone = 'accent',
}: {
  value: number | null | undefined
  tone?: 'accent' | 'warn' | 'danger' | 'ok'
}) {
  const width = value === null || value === undefined || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(100, value))
  const color =
    tone === 'danger' ? 'bg-danger' : tone === 'warn' ? 'bg-warn' : tone === 'ok' ? 'bg-ok' : 'bg-accent'
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ebe9e2]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  desc?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 py-7 md:flex-row md:items-end md:justify-between md:py-9">
      <div className="max-w-3xl">
        {eyebrow && <div className="label text-accent">{eyebrow}</div>}
        <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.035em] text-ink md:text-[36px]">{title}</h1>
        {desc && <p className="mt-2 text-[12.5px] leading-relaxed text-muted md:text-[13.5px]">{desc}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function LoadingView({ rows = 8 }: { rows?: number }) {
  const { t } = useI18n()
  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center gap-2 text-[12px] text-muted">
        <Icon name="refresh" size={14} className="animate-spin" />
        {t('common.loading')}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="skeleton h-24" />
        ))}
      </div>
    </div>
  )
}

export function ErrorView({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="card card-pad border-[#efceca] bg-dangersoft/40">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-danger">
          <Icon name="alert" size={17} />
        </span>
        <div>
          <div className="text-[13px] font-semibold text-danger">{t('common.error')}</div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#78433d]">{message || t('common.errorDesc')}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-ghost btn-sm mt-3">
              <Icon name="refresh" size={13} />
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyValue({ note }: { note?: ReactNode }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex flex-col">
      <span>{t('common.na')}</span>
      {note && <span className="mt-0.5 text-[9px] font-normal text-muted">{note}</span>}
    </span>
  )
}
