import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { ANUBIS, POLYGON } from '../config/chain'
import { LogoMark } from './Icons'

export function Footer() {
  const { t, lang } = useI18n()
  const nav = [
    { key: 'nav.home', path: '' },
    { key: 'nav.learn', path: 'learn' },
    { key: 'nav.chain', path: 'chain' },
    { key: 'nav.products', path: 'products' },
    { key: 'nav.insights', path: 'insights' },
    { key: 'nav.ecosystem', path: 'ecosystem' },
    { key: 'nav.portfolio', path: 'portfolio' },
    { key: 'nav.about', path: 'about' },
  ]

  return (
    <footer className="mt-14 border-t border-line bg-white">
      <div className="container-page py-10 pb-24 lg:pb-10">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <div>
                <div className="text-[13px] font-semibold text-ink">{t('brand.name')}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{t('brand.nonofficial')}</div>
              </div>
            </div>
            <p className="mt-3 max-w-md text-[12px] leading-relaxed text-muted">{t('footer.disclaimer')}</p>
          </div>

          <div>
            <div className="label mb-3">{t('footer.nav')}</div>
            <ul className="grid grid-cols-2 gap-y-2">
              {nav.map((n) => (
                <li key={n.key}>
                  <Link to={`/${lang}${n.path ? `/${n.path}` : ''}`} className="text-[12px] text-ink-2 hover:text-accent">
                    {t(n.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="label mb-3">{t('footer.sources')}</div>
            <ul className="space-y-2 text-[12px] text-muted">
              <li>
                <a href={ANUBIS.explorer} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Anubis Blockscout
                </a>
              </li>
              <li>
                <a href={ANUBIS.rpc} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Anubis RPC
                </a>
              </li>
              <li>
                <a href={POLYGON.explorer} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Polygon explorer
                </a>
              </li>
              <li className="text-[11px]">RocketSwap pair reserves</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-5 text-[11px] text-muted sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <span>
              © {new Date().getFullYear()} {t('brand.name')} · {t('footer.author')}
            </span>
            <span>{t('footer.authorNote')}</span>
          </div>
          <span>{t('about.nonofficial')}</span>
        </div>
      </div>
    </footer>
  )
}
