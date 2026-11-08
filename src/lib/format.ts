import type { Lang } from '../types'

const locale = (lang: Lang) => (lang === 'zh' ? 'zh-CN' : 'en-US')

export const fmtNum = (
  value: number | null | undefined,
  lang: Lang,
  maximumFractionDigits = 2,
  minimumFractionDigits = 0,
) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  return value.toLocaleString(locale(lang), {
    maximumFractionDigits,
    minimumFractionDigits,
  })
}

export const fmtInt = (value: number | null | undefined, lang: Lang) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 'N/A'
    : Math.round(value).toLocaleString(locale(lang))

export const fmtPct = (value: number | null | undefined, lang: Lang, digits = 2) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 'N/A'
    : `${value.toLocaleString(locale(lang), {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      })}%`

export const fmtPrice = (value: number | null | undefined, lang: Lang) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  if (value >= 1) return `${fmtNum(value, lang, 2, 2)} DAI`
  if (value >= 0.01) return `${fmtNum(value, lang, 5, 5)} DAI`
  return `${fmtNum(value, lang, 8, 8)} DAI`
}

export const fmtToken = (value: number | null | undefined, lang: Lang, symbol = '') => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  const digits = Math.abs(value) >= 1_000_000 ? 2 : Math.abs(value) >= 1 ? 4 : 6
  return `${fmtNum(value, lang, digits)}${symbol ? ` ${symbol}` : ''}`
}

export const fmtCompact = (value: number | null | undefined, lang: Lang) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  return new Intl.NumberFormat(locale(lang), {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export const shortAddr = (address: string | null | undefined, head = 6, tail = 4) =>
  address ? `${address.slice(0, head)}…${address.slice(-tail)}` : '—'

export const relativeTime = (iso: string | null | undefined, lang: Lang) => {
  if (!iso) return 'N/A'
  const ms = new Date(iso).getTime()
  if (!Number.isFinite(ms)) return 'N/A'
  const delta = Date.now() - ms
  const minutes = Math.max(0, Math.round(delta / 60_000))
  if (minutes < 1) return lang === 'zh' ? '刚刚' : 'just now'
  if (minutes < 60) return lang === 'zh' ? `${minutes} 分钟前` : `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return lang === 'zh' ? `${hours} 小时前` : `${hours}h ago`
  const days = Math.round(hours / 24)
  return lang === 'zh' ? `${days} 天前` : `${days}d ago`
}

export const localDateTime = (iso: string | null | undefined, lang: Lang) => {
  if (!iso) return 'N/A'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString(locale(lang), {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const isValidAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
