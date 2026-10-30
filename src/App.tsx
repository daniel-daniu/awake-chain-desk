import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { I18nProvider, useI18n } from './i18n'
import type { Lang } from './types'
import { WalletProvider } from './lib/wallet'
import { Header, MobileTabs } from './components/Header'
import { Footer } from './components/Footer'
import { DisclaimerModal } from './components/DisclaimerModal'
import Home from './pages/Home'
import Chain from './pages/Chain'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Insights from './pages/Insights'
import Portfolio from './pages/Portfolio'
import About from './pages/About'
import Ecosystem from './pages/Ecosystem'
import Learn from './pages/Learn'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function NotFound() {
  const { t, lang } = useI18n()
  return (
    <div className="container-page py-24 text-center">
      <div className="text-[44px] font-semibold tracking-tight text-ink">404</div>
      <p className="mt-2 text-[13px] text-muted">{t('home.news.empty')}</p>
      <a href={`/${lang}`} className="btn btn-primary mt-6">
        {t('nav.home')}
      </a>
    </div>
  )
}

function LangShell() {
  const { lang } = useParams<{ lang: string }>()
  const valid = lang === 'zh' || lang === 'en'

  useEffect(() => {
    if (valid) document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang, valid])

  if (!valid) return <Navigate to="/zh" replace />

  return (
    <I18nProvider lang={lang as Lang}>
      <WalletProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-20 lg:pb-0">
            <Outlet />
          </main>
          <Footer />
          <MobileTabs />
          <DisclaimerModal />
        </div>
      </WalletProvider>
    </I18nProvider>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/zh" replace />} />
        <Route path="/:lang" element={<LangShell />}>
          <Route index element={<Home />} />
          <Route path="chain" element={<Chain />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="insights" element={<Insights />} />
          <Route path="ecosystem" element={<Ecosystem />} />
          <Route path="learn" element={<Learn />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/zh" replace />} />
      </Routes>
    </>
  )
}
