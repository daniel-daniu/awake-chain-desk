import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Bi, Lang } from '../types'

type Params = Record<string, string | number>

export const zh: Record<string, string> = {
  'brand.name': 'Awake 双链数据站',
  'brand.sub': 'ANUBIS · POLYGON',
  'nav.home': '首页',
  'nav.chains': '链上数据',
  'nav.products': '产品',
  'nav.ecosystem': 'AiLGNS / HELIX',
  'nav.learn': '新手看懂',
  'nav.portfolio': '我的仓位',
  'nav.about': '关于',
  'nav.menu': '菜单',
  'nav.main': '主导航',
  'nav.mobile': '移动端导航',
  'common.live': '自动刷新',
  'common.partial': '部分数据',
  'common.stale': '数据已过期',
  'common.updated': '更新于',
  'common.updateUnavailable': '更新时间不可用',
  'common.source': '来源',
  'common.sources': '数据来源',
  'common.view': '查看原文',
  'common.explorer': '区块浏览器',
  'common.retry': '重试',
  'common.loading': '正在读取链上数据…',
  'common.refresh': '刷新数据',
  'common.connect': '连接钱包',
  'common.connecting': '连接中…',
  'common.connected': '已连接',
  'common.disconnect': '断开',
  'common.na': 'N/A',
  'common.unknown': '链上不可读',
  'common.close': '关闭',
  'common.readonly': '只读',
  'common.chain': '链',
  'common.contract': '合约',
  'common.verified': '已开源',
  'common.unverified': '未开源',
  'common.external': '外部来源',
  'common.rpc': 'RPC 直读',
  'common.explorerSource': '浏览器链上索引',
  'common.more': '查看详情',
  'common.back': '返回',
  'common.all': '全部',
  'common.address': '地址',
  'common.amount': '数量',
  'common.share': '占比',
  'common.error': '暂时无法获取数据',
  'common.errorDesc': '没有使用固定数据替代。请稍后重试或直接查看区块浏览器。',
  'common.noWallet': '未检测到浏览器钱包。请安装 MetaMask、OKX Wallet、Bitget Wallet 等插件钱包。',
  'common.copy': '复制',
  'footer.nav': '导航',
  'footer.sources': '主要来源',
  'footer.disclaimer': '独立第三方数据工具，与任何项目方无隶属关系，不构成投资、法律或税务建议。',
  'footer.author': '作者：Daniel 大牛',
  'footer.lang': '语言',
  'footer.email': '联系邮箱',
}

export const en: Record<string, string> = {
  'brand.name': 'Awake Chain Desk',
  'brand.sub': 'ANUBIS · POLYGON',
  'nav.home': 'Home',
  'nav.chains': 'On-chain',
  'nav.products': 'Products',
  'nav.ecosystem': 'AiLGNS / HELIX',
  'nav.learn': 'Basics',
  'nav.portfolio': 'Portfolio',
  'nav.about': 'About',
  'nav.menu': 'Menu',
  'nav.main': 'Main navigation',
  'nav.mobile': 'Mobile navigation',
  'common.live': 'Auto-refresh',
  'common.partial': 'Partial data',
  'common.stale': 'Stale data',
  'common.updated': 'Updated',
  'common.updateUnavailable': 'Update time unavailable',
  'common.source': 'Source',
  'common.sources': 'Sources',
  'common.view': 'Open source',
  'common.explorer': 'Explorer',
  'common.retry': 'Retry',
  'common.loading': 'Reading on-chain data…',
  'common.refresh': 'Refresh',
  'common.connect': 'Connect wallet',
  'common.connecting': 'Connecting…',
  'common.connected': 'Connected',
  'common.disconnect': 'Disconnect',
  'common.na': 'N/A',
  'common.unknown': 'Not readable on-chain',
  'common.close': 'Close',
  'common.readonly': 'Read-only',
  'common.chain': 'Chain',
  'common.contract': 'Contract',
  'common.verified': 'Verified',
  'common.unverified': 'Unverified',
  'common.external': 'External source',
  'common.rpc': 'Direct RPC',
  'common.explorerSource': 'Explorer index',
  'common.more': 'Details',
  'common.back': 'Back',
  'common.all': 'All',
  'common.address': 'Address',
  'common.amount': 'Amount',
  'common.share': 'Share',
  'common.error': 'Data is temporarily unavailable',
  'common.errorDesc': 'No fixed fallback values are substituted. Retry later or inspect the explorer directly.',
  'common.noWallet': 'No browser wallet detected. Install MetaMask, OKX Wallet, Bitget Wallet or another injected wallet.',
  'common.copy': 'Copy',
  'footer.nav': 'Navigation',
  'footer.sources': 'Primary sources',
  'footer.disclaimer': 'An independent data tool, not affiliated with any project. Nothing here is investment, legal or tax advice.',
  'footer.author': 'Built by Daniel 大牛',
  'footer.lang': 'Language',
  'footer.email': 'Contact',
}

interface I18nValue {
  lang: Lang
  t: (key: string, params?: Params) => string
  pick: (value: Bi) => string
}

const I18nContext = createContext<I18nValue>({
  lang: 'zh',
  t: (key) => key,
  pick: (value) => value.zh,
})

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const dict = lang === 'zh' ? zh : en
    return {
      lang,
      t: (key, params) => {
        let text = dict[key] ?? zh[key] ?? key
        for (const [name, replacement] of Object.entries(params ?? {})) {
          text = text.replaceAll(`{${name}}`, String(replacement))
        }
        return text
      },
      pick: (bi) => bi[lang],
    }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
