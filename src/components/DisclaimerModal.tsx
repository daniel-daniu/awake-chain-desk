import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { IconAlert, IconClose } from './Icons'

const KEY = 'awake.disclaimer.v1'

export function DisclaimerModal() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const timer = setTimeout(() => setOpen(true), 600)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore
    }
  }, [])

  if (!open) return null

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(12,20,33,0.38)] p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl fade-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warn-soft text-warn">
              <IconAlert size={18} />
            </span>
            <h2 className="text-[16px] font-semibold text-ink">{t('modal.title')}</h2>
          </div>
          <button onClick={accept} className="rounded-md p-1 text-muted hover:bg-canvas" aria-label={t('common.close')}>
            <IconClose size={18} />
          </button>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{t('modal.body')}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link to={`/${lang}/about`} onClick={accept} className="text-[12px] font-medium text-accent hover:underline">
            {t('modal.more')}
          </Link>
          <button onClick={accept} className="btn btn-primary w-full sm:w-auto">
            {t('modal.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
