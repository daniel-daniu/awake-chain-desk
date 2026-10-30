import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useWallet } from '../lib/wallet'
import { shortAddr } from '../lib/format'
import { IconClose, IconMenu, IconWallet, LogoMark } from './Icons'

const NAV = [
  { key: 'nav.home', path: '' },
  { key: 'nav.learn', path: 'learn' },
  { key: 'nav.chain', path: 'chain' },
  { key: 'nav.products', path: 'products' },
  { key: 'nav.insights', path: 'insights' },
  { key: 'nav.ecosystem', path: 'ecosystem' },
  { key: 'nav.portfolio', path: 'portfolio' },
  { key: 'nav.about', path: 'about' },
]

export function Header() {
  const { t, lang } = useI18n()
  const { address, connect, connecting, active, wallets } = useWallet()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  const swapLang = (next: 'zh' | 'en') => {
    if (next === lang) return
    const rest = location.pathname.replace(/^\/(zh|en)/, '')
    navigate(`/${next}${rest || ''}${location.search}`, { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-[rgba(245,246,248,0.86)] backdrop-blur-xl">
      <div className="container-page flex h-[62px] items-center justify-between gap-4">
        <Link to={`/${lang}`} className="flex shrink-0 items-center gap-2.5">
          <LogoMark size={32} />
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold tracking-[-0.01em] text-ink">{t('brand.name')}</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted sm:block">
              {t('brand.sub')}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              to={`/${lang}${item.path ? `/${item.path}` : ''}`}
              end={!item.path}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition xl:px-3 ${
                  isActive ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-line bg-white p-0.5 sm:flex">
            {(['zh', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => swapLang(l)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                  lang === l ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {l === 'zh' ? '中' : 'EN'}
              </button>
            ))}
          </div>

          {address ? (
            <Link to={`/${lang}/portfolio`} className="btn btn-ghost btn-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span className="mono">{shortAddr(address, 4, 4)}</span>
            </Link>
          ) : (
            <button
              onClick={() => (wallets.length === 0 ? navigate(`/${lang}/portfolio`) : connect())}
              className="btn btn-primary btn-sm"
              disabled={connecting}
            >
              <IconWallet size={15} />
              <span className="hidden sm:inline">{connecting ? t('portfolio.connecting') : t('portfolio.connect')}</span>
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('common.close') : 'menu'}
          >
            {open ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="container-page grid grid-cols-2 gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.key}
                to={`/${lang}${item.path ? `/${item.path}` : ''}`}
                end={!item.path}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                    isActive ? 'bg-accentsoft text-accent' : 'text-ink-2'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
            <div className="col-span-2 mt-2 flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
              <span className="text-[12px] text-muted">{t('footer.lang')}</span>
              <div className="flex items-center gap-1">
                {(['zh', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => swapLang(l)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                      lang === l ? 'bg-ink text-white' : 'bg-white text-muted'
                    }`}
                  >
                    {l === 'zh' ? '中文' : 'English'}
                  </button>
                ))}
              </div>
            </div>
            {active && (
              <div className="col-span-2 px-3 pt-2 text-[11px] text-muted">
                {t('portfolio.connected')}: {active.name}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export function MobileTabs() {
  const { t, lang } = useI18n()
  const items = [
    { key: 'nav.home', path: '', icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5' },
    { key: 'nav.chain', path: 'chain', icon: 'M4 6h6v6H4zM14 12h6v6h-6z' },
    { key: 'nav.products', path: 'products', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { key: 'nav.insights', path: 'insights', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
    { key: 'nav.portfolio', path: 'portfolio', icon: 'M3 7h18v12H3zM3 10h18' },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={`/${lang}${item.path ? `/${item.path}` : ''}`}
            end={!item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-[10px] font-medium ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {t(item.key)}
          </NavLink>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
