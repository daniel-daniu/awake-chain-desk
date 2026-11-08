import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { I18nProvider, useI18n } from './lib/i18n'
import { WalletProvider } from './lib/wallet'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer, Header, MobileTabs } from './components/Layout'
import { Icon } from './components/Icons'
import Home from './pages/Home'
import Chains from './pages/Chains'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Ecosystem from './pages/Ecosystem'
import Learn from './pages/Learn'
import Portfolio from './pages/Portfolio'
import News from './pages/News'
import About from './pages/About'
import type { Lang } from './types'

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
      <div className="num text-[48px] font-semibold tracking-tight text-ink">404</div>
      <p className="mt-2 text-[12px] text-muted">{t('common.errorDesc')}</p>
      <a href={`/${lang}`} className="btn btn-primary mt-5">
        {t('nav.home')}
      </a>
    </div>
  )
}

function LangShell() {
  const { lang } = useParams<{ lang: string }>()
  const { pathname } = useLocation()
  const valid = lang === 'zh' || lang === 'en'

  useEffect(() => {
    if (!valid) return
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    const section = pathname.replace(/^\/(zh|en)\/?/, '').split('/')[0] || 'home'
    const titles: Record<string, { zh: string; en: string }> = {
      home: { zh: 'Awake 双链数据站 · 链上数据与风险解释', en: 'Awake Chain Desk · On-chain Data & Risk Explainers' },
      chains: { zh: '链上数据 · Awake 双链数据站', en: 'On-chain Data · Awake Chain Desk' },
      products: { zh: '产品与对比 · Awake 双链数据站', en: 'Products & Comparison · Awake Chain Desk' },
      ecosystem: { zh: 'AiLGNS / HELIX · Awake 双链数据站', en: 'AiLGNS / HELIX · Awake Chain Desk' },
      learn: { zh: '新手看懂 · Awake 双链数据站', en: 'Basics · Awake Chain Desk' },
      portfolio: { zh: '我的仓位 · Awake 双链数据站', en: 'Portfolio · Awake Chain Desk' },
      news: { zh: '新闻与公告 · Awake 双链数据站', en: 'News & Announcements · Awake Chain Desk' },
      about: { zh: '关于与免责声明 · Awake 双链数据站', en: 'About & Disclaimer · Awake Chain Desk' },
    }
    document.title = (titles[section] ?? titles.home)[lang]
  }, [lang, valid, pathname])

  if (!valid) return <Navigate to="/zh" replace />

  return (
    <I18nProvider lang={lang as Lang}>
      <WalletProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
          <Footer />
          <MobileTabs />
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
          <Route path="chains" element={<Chains />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="ecosystem" element={<Ecosystem />} />
          <Route path="learn" element={<Learn />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="news" element={<News />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/zh" replace />} />
      </Routes>
    </>
  )
}
