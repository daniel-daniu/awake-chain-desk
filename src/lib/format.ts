import type { Lang } from '../types'

export const fmtNum = (n: number | null | undefined, lang: Lang, digits = 2): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A'
  return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n)
}

export const fmtInt = (n: number | null | undefined, lang: Lang): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A'
  return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 0 }).format(n)
}

export const fmtUsd = (n: number | null | undefined, lang: Lang, digits = 2): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A'
  if (Math.abs(n) >= 1_000_000_000) return `$${fmtNum(n / 1_000_000_000, lang, 2)}B`
  if (Math.abs(n) >= 1_000_000) return `$${fmtNum(n / 1_000_000, lang, 2)}M`
  if (Math.abs(n) >= 10_000) return `$${fmtNum(n / 1_000, lang, 1)}K`
  return `$${fmtNum(n, lang, digits)}`
}

export const fmtPrice = (n: number | null | undefined, lang: Lang): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A'
  if (n >= 1) return `$${fmtNum(n, lang, 4)}`
  if (n >= 0.01) return `$${fmtNum(n, lang, 5)}`
  return `$${n.toFixed(6)}`
}

export const fmtPct = (n: number | null | undefined, lang: Lang, digits = 2): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A'
  return `${fmtNum(n * 100, lang, digits)}%`
}

export const shortAddr = (addr: string, head = 6, tail = 4): string =>
  addr ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : ''

export const fmtDate = (iso: string, lang: Lang): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d)
}

export const timeAgo = (iso: string, lang: Lang): string => {
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ''
  const diff = Math.max(0, Date.now() - d)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return lang === 'zh' ? '刚刚' : 'just now'
  if (mins < 60) return lang === 'zh' ? `${mins} 分钟前` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return lang === 'zh' ? `${hours} 小时前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return lang === 'zh' ? `${days} 天前` : `${days}d ago`
  return fmtDate(iso, lang)
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
