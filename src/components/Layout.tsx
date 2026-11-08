import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useWallet } from '../lib/wallet'
import { APP, CHAINS } from '../config/site'
import { shortAddr } from '../lib/format'
import { Icon } from './Icons'
import { Pill } from './ui'

const NAV = [
  { key: 'nav.home', path: '', icon: 'home' as const },
  { key: 'nav.chains', path: 'chains', icon: 'chain' as const },
  { key: 'nav.products', path: 'products', icon: 'products' as const },
  { key: 'nav.ecosystem', path: 'ecosystem', icon: 'helix' as const },
  { key: 'nav.learn', path: 'learn', icon: 'learn' as const },
  { key: 'nav.portfolio', path: 'portfolio', icon: 'wallet' as const },
]

const MOBILE_NAV = NAV.filter((item) => ['', 'chains', 'products', 'portfolio'].includes(item.path))

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-ink text-white shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 17 12 5l6 12-6 3-6-3Z" stroke="#72c9b8" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="12" cy="12.8" r="2" fill="#f3d8a4" />
      </svg>
    </span>
  )
}

export function Header() {
  const { t, lang } = useI18n()
  const { address, connect, connecting, wallets, disconnect } = useWallet()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  const switchLanguage = (next: 'zh' | 'en') => {
    if (next === lang) return
    const rest = location.pathname.replace(/^\/(zh|en)/, '')
    navigate(`/${next}${rest || ''}${location.search}`, { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 sticky-header">
      <div className="container-page flex h-[62px] items-center justify-between gap-3">
        <Link to={`/${lang}`} className="focus-ring flex min-w-0 items-center gap-2.5 rounded-lg">
          <Logo />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold tracking-[-0.015em] text-ink">
              {t('brand.name')}
            </span>
            <span className="hidden text-[9px] font-semibold tracking-[0.13em] text-muted sm:block">
              {t('brand.sub')}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('nav.main')}>
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              to={`/${lang}${item.path ? `/${item.path}` : ''}`}
              end={!item.path}
              className={({ isActive }) =>
                `focus-ring rounded-lg px-2.5 py-2 text-[11.5px] font-medium transition ${
                  isActive ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center rounded-lg border border-line bg-white/70 p-0.5 sm:flex">
            {(['zh', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLanguage(code)}
                className={`focus-ring rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                  lang === code ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {code === 'zh' ? '中' : 'EN'}
              </button>
            ))}
          </div>
          {address ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={disconnect}
              title={t('common.disconnect')}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span className="mono hidden sm:inline">{shortAddr(address, 4, 4)}</span>
              <Icon name="wallet" size={14} className="sm:hidden" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => (wallets.length ? void connect() : navigate(`/${lang}/portfolio`))}
              disabled={connecting}
            >
              <Icon name="wallet" size={14} />
              <span className="hidden sm:inline">{connecting ? t('common.connecting') : t('common.connect')}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t('common.close') : t('nav.menu')}
          >
            <Icon name={open ? 'close' : 'menu'} size={17} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-surface lg:hidden">
          <div className="container-page grid grid-cols-2 gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.key}
                to={`/${lang}${item.path ? `/${item.path}` : ''}`}
                end={!item.path}
                className={({ isActive }) =>
                  `focus-ring flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium ${
                    isActive ? 'bg-accentsoft text-accent' : 'text-ink-2'
                  }`
                }
              >
                <Icon name={item.icon} size={15} />
                {t(item.key)}
              </NavLink>
            ))}
            <NavLink
              to={`/${lang}/about`}
              className="focus-ring col-span-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] text-ink-2"
            >
              <Icon name="info" size={15} />
              {t('nav.about')}
            </NavLink>
            <div className="col-span-2 mt-1 flex items-center justify-between border-t border-line px-3 pt-3">
              <span className="text-[11px] text-muted">{t('footer.lang')}</span>
              <div className="flex gap-1">
                {(['zh', 'en'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => switchLanguage(code)}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                      lang === code ? 'bg-ink text-white' : 'bg-white text-muted'
                    }`}
                  >
                    {code === 'zh' ? '中文' : 'English'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export function MobileTabs() {
  const { t, lang } = useI18n()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label={t('nav.mobile')}
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={`/${lang}${item.path ? `/${item.path}` : ''}`}
            end={!item.path}
            className={({ isActive }) =>
              `flex min-h-[55px] flex-col items-center justify-center gap-1 text-[9px] font-medium transition ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <Icon name={item.icon} size={18} />
            {t(item.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function Footer() {
  const { t, lang } = useI18n()
  return (
    <footer className="mt-14 border-t border-line bg-[#efeee8]/75 pb-24 pt-8 lg:pb-10">
      <div className="container-page">
        <div className="grid gap-7 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-[12px] font-semibold">{APP.name[lang]}</span>
            </div>
            <p className="mt-3 max-w-md text-[10.5px] leading-relaxed text-muted">{t('footer.disclaimer')}</p>
          </div>
          <div>
            <div className="label">{t('footer.nav')}</div>
            <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-ink-2">
              {NAV.slice(0, 4).map((item) => (
                <Link key={item.key} to={`/${lang}${item.path ? `/${item.path}` : ''}`} className="hover:text-accent">
                  {t(item.key)}
                </Link>
              ))}
              <Link to={`/${lang}/about`} className="hover:text-accent">
                {t('nav.about')}
              </Link>
            </div>
          </div>
          <div>
            <div className="label">{t('footer.sources')}</div>
            <div className="mt-2.5 space-y-1.5 text-[10.5px] text-muted">
              <div>Anubis RPC + Blockscout</div>
              <div>Polygon public RPC</div>
              <div>External news feeds</div>
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-2 border-t border-line pt-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {t('footer.author')}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone="neutral">chainId {CHAINS.anubis.id} / {CHAINS.polygon.id}</Pill>
            <span className="mono">hello@danieln.top</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
