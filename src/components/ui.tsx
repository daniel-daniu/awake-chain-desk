import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import { timeAgo } from '../lib/format'
import { IconCheck, IconCopy, IconExternal } from './Icons'

export function SectionHeader({
  title,
  desc,
  action,
  id,
}: {
  title: string
  desc?: string
  action?: ReactNode
  id?: string
}) {
  return (
    <div id={id} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink md:text-[22px]">{title}</h2>
        {desc && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

export function Pill({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: 'neutral' | 'accent' | 'danger' | 'warn' | 'ok'
  children: ReactNode
  className?: string
}) {
  return <span className={`pill pill-${tone} ${className}`}>{children}</span>
}

export function LiveDot({ stale }: { stale?: boolean }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          stale ? 'bg-warn' : 'bg-ok'
        } ${stale ? '' : 'animate-pulse'}`}
      />
      {stale ? t('common.stale') : t('common.live')}
    </span>
  )
}

export function UpdatedAt({ ts, stale }: { ts?: string; stale?: boolean }) {
  const { t, lang } = useI18n()
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30_000)
    return () => clearInterval(id)
  }, [])
  if (!ts) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
      <LiveDot stale={stale} />
      <span className="text-line">|</span>
      {t('common.updated')} {timeAgo(ts, lang)}
    </span>
  )
}

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        } catch {
          // ignore
        }
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted transition hover:bg-canvas hover:text-ink"
      aria-label={t('common.copy')}
    >
      {done ? <IconCheck size={12} /> : <IconCopy size={12} />}
      <span className="hidden sm:inline">{done ? t('common.copied') : label || t('common.copy')}</span>
    </button>
  )
}

export function ExternalLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline ${className}`}
    >
      {children}
      <IconExternal size={12} />
    </a>
  )
}

export function Sparkline({
  values,
  height = 34,
  tone = 'accent',
}: {
  values: number[]
  height?: number
  tone?: 'accent' | 'danger' | 'warn'
}) {
  const width = 120
  if (!values.length) {
    return <div className="h-[34px] w-[120px] rounded bg-canvas" aria-hidden="true" />
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = width / Math.max(1, values.length - 1)
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - 3 - ((v - min) / span) * (height - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const color = tone === 'danger' ? '#C0392B' : tone === 'warn' ? '#B45309' : '#0B6E75'
  const area = `M0,${height} L${points.join(' L')} L${width},${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={area} fill={color} opacity="0.08" />
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function Bar({
  value,
  tone = 'accent',
  height = 6,
}: {
  value: number
  tone?: 'accent' | 'danger' | 'warn' | 'ok'
  height?: number
}) {
  const colors: Record<string, string> = {
    accent: '#0B6E75',
    danger: '#C0392B',
    warn: '#B45309',
    ok: '#15803D',
  }
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#EEF1F5]" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%`, background: colors[tone] }}
      />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <div className="text-[13px] font-medium text-ink-2">{title}</div>
      {hint && <div className="max-w-md text-[12px] leading-relaxed text-muted">{hint}</div>}
    </div>
  )
}
