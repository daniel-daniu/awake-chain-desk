import { CHAINS, DAPP_REGISTRY_URL, HELIX, LGNS } from '../../shared/contracts'

export { CHAINS, DAPP_REGISTRY_URL, HELIX, LGNS }

export const APP = {
  name: { zh: 'Awake 双链数据站', en: 'Awake Chain Desk' },
  kicker: { zh: 'Anubis · Polygon', en: 'Anubis · Polygon' },
  author: 'Daniel 大牛',
  email: 'hello@danieln.top',
} as const

export const EXPLORER = CHAINS.anubis.explorer
export const EXPLORER_API = CHAINS.anubis.explorerApi!

export const explorerAddress = (chain: 'anubis' | 'polygon', address: string) =>
  chain === 'anubis'
    ? `${CHAINS.anubis.explorer}/address/${address}`
    : `${CHAINS.polygon.explorer}/address/${address}`

export const explorerToken = (address: string) => `${CHAINS.anubis.explorer}/token/${address}`
