import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import zh from './zh'
import en from './en'
import type { Lang } from '../types'

const dicts: Record<Lang, Record<string, string>> = { zh, en }

interface I18nValue {
  lang: Lang
  t: (key: string, vars?: Record<string, string | number>) => string
  pick: <T>(value: { zh: T; en: T }) => T
}

const I18nContext = createContext<I18nValue>({
  lang: 'zh',
  t: (k) => k,
  pick: (v) => v.zh,
})

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = dicts[lang][key] ?? dicts.zh[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return text
    },
    [lang],
  )

  const pick = useCallback(<T,>(value: { zh: T; en: T }) => value[lang], [lang])

  const value = useMemo(() => ({ lang, t, pick }), [lang, t, pick])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

export const localeOf = (lang: Lang) => (lang === 'zh' ? 'zh-CN' : 'en-US')
