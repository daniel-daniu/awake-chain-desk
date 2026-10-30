export const ANUBIS = {
  id: 6714,
  hexId: '0x1a3a',
  name: 'Anubis Chain',
  rpc: 'https://rpc.anubispace.org',
  explorer: 'https://browser.anubispace.org',
  api: 'https://browser.anubispace.org/api/v2',
  native: { name: 'DAI', symbol: 'DAI', decimals: 18 },
  blockTime: 1.0,
} as const

export const POLYGON = {
  id: 137,
  hexId: '0x89',
  name: 'Polygon',
  rpc: 'https://polygon-bor-rpc.publicnode.com',
  explorer: 'https://polygonscan.com',
  native: { name: 'POL', symbol: 'POL', decimals: 18 },
} as const

export const POLYGON_LGNS = '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01'
export const POLYGON_PAIR = '0x882df4B0fB50a229C3B4124EB18c759911485bFb'
export const POLYGON_DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

export const APP = {
  name: { zh: 'Awake 链上数据台', en: 'Awake Chain Desk' },
  updatedLabel: { zh: '数据更新于', en: 'Updated' },
} as const
