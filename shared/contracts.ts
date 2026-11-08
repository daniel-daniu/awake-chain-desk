export type ChainKey = 'anubis' | 'polygon'

export interface ChainConfig {
  key: ChainKey
  id: number
  hexId: string
  name: string
  shortName: string
  rpc: string[]
  explorer: string
  explorerApi?: string
  native: { name: string; symbol: string; decimals: number }
}

export const CHAINS: Record<ChainKey, ChainConfig> = {
  anubis: {
    key: 'anubis',
    id: 6714,
    hexId: '0x1a3a',
    name: 'Anubis Chain',
    shortName: 'Anubis',
    rpc: [
      'https://rpc.anubispace.org',
      'https://rpc2.anubispace.org',
      'https://rpc3.anubispace.org',
      'https://rpc4.anubispace.org',
    ],
    explorer: 'https://browser.anubispace.org',
    explorerApi: 'https://browser.anubispace.org/api/v2',
    native: { name: 'DAI', symbol: 'DAI', decimals: 18 },
  },
  polygon: {
    key: 'polygon',
    id: 137,
    hexId: '0x89',
    name: 'Polygon',
    shortName: 'Polygon',
    rpc: [
      'https://polygon-bor-rpc.publicnode.com',
      'https://polygon.drpc.org',
      'https://1rpc.io/matic',
    ],
    explorer: 'https://polygonscan.com',
    native: { name: 'POL', symbol: 'POL', decimals: 18 },
  },
}

export interface LgnsDeployment {
  chain: ChainKey
  token: string
  symbol: string
  decimals: number
  pair: string
  pairName: string
  quoteToken: string
  quoteDecimals: number
  indexContract: string
  indexMethod: string
  stakingContract?: string
}

export const LGNS: Record<ChainKey, LgnsDeployment> = {
  anubis: {
    chain: 'anubis',
    token: '0x4D1D808a081FdAc440703b3765FC61f8028C06B8',
    symbol: 'LGNS',
    decimals: 9,
    pair: '0x32A4586797E3f561F41C0F47CA57eD08D64f3dC0',
    pairName: 'RocketSwap LGNS/DAI',
    quoteToken: '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14',
    quoteDecimals: 18,
    indexContract: '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228',
    indexMethod: '0x2986c0e5',
    stakingContract: '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228',
  },
  polygon: {
    chain: 'polygon',
    token: '0xeB51D9A39AD5EEF215dC0Bf39a8821ff804A0F01',
    symbol: 'LGNS',
    decimals: 9,
    pair: '0x882df4B0fB50a229C3B4124EB18c759911485bFb',
    pairName: 'QuickSwap LGNS/DAI',
    quoteToken: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    quoteDecimals: 18,
    indexContract: '0x99a57E6C8558BC6689f894e068733ADf83C19725',
    indexMethod: '0x2986c0e5',
  },
}

export const HELIX = {
  token: '0x256EdB652db43E721EC6A12B6b51b6967D3bb8cB',
  veToken: '0x52D7f7745D4Ba3dE6C3A0B503815878aeE7eDf14',
  ledger: '0x9E68F61E2615cc1D2C4a2D0026bFc1EBFdf68C1b',
  lens: '0xa69a60b8d97D43031C00F16742Eb6989553796fc',
  community: '0xc9f9a8a2dBf8188AD6610e0239105CAbE67c4993',
  distribution: '0x3DEea5f638cA0dFb03A0873CF4c0b90BA50E1aA2',
  productionNft: '0x77E6ab1C5557FD456b0656304E0e5c02a6d7DcCA',
  aiDaiPair: '0x0a1Cce65d995C6C5100e6F5bA3c388Ef34CEcaf0',
  aiLgnsPair: '0xc5029d6e80D2FDCE321B2b51010E9Ce3b1eDf1a2',
  dai: '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14',
  glgns: '0xf140a92C156e76F5A1d3D6f96284b250330F8F4c',
  dead: '0x000000000000000000000000000000000000dEaD',
} as const

export const CONTRACTS = [
  {
    key: 'lgns-anubis',
    address: LGNS.anubis.token,
    chain: 'anubis',
    role: 'LGNS token',
    label: { zh: 'LGNS 代币（Anubis）', en: 'LGNS token (Anubis)' },
  },
  {
    key: 'staking-anubis',
    address: LGNS.anubis.indexContract,
    chain: 'anubis',
    role: 'Staking / index',
    label: { zh: '质押与 index 合约', en: 'Staking / index contract' },
  },
  {
    key: 'pair-anubis',
    address: LGNS.anubis.pair,
    chain: 'anubis',
    role: 'LGNS/DAI pool',
    label: { zh: 'LGNS/DAI 主池', en: 'LGNS/DAI primary pool' },
  },
  {
    key: 'lgns-polygon',
    address: LGNS.polygon.token,
    chain: 'polygon',
    role: 'LGNS token',
    label: { zh: 'LGNS 代币（Polygon）', en: 'LGNS token (Polygon)' },
  },
  {
    key: 'staking-polygon',
    address: LGNS.polygon.indexContract,
    chain: 'polygon',
    role: 'Staking / index',
    label: { zh: 'Polygon index 合约', en: 'Polygon index contract' },
  },
  {
    key: 'pair-polygon',
    address: LGNS.polygon.pair,
    chain: 'polygon',
    role: 'LGNS/DAI pool',
    label: { zh: 'LGNS/DAI 主池', en: 'LGNS/DAI primary pool' },
  },
  {
    key: 'ailgns',
    address: HELIX.token,
    chain: 'anubis',
    role: 'AiLGNS token',
    label: { zh: 'AiLGNS 代币', en: 'AiLGNS token' },
  },
  {
    key: 'helix-ledger',
    address: HELIX.ledger,
    chain: 'anubis',
    role: 'Power ledger',
    label: { zh: 'HELIX Power 账本', en: 'HELIX Power ledger' },
  },
  {
    key: 'helix-lens',
    address: HELIX.lens,
    chain: 'anubis',
    role: 'Daily quota lens',
    label: { zh: 'HELIX 每日额度', en: 'HELIX daily quota lens' },
  },
  {
    key: 'helix-nft',
    address: HELIX.productionNft,
    chain: 'anubis',
    role: 'Production NFT',
    label: { zh: 'HELIX 生产权 NFT', en: 'HELIX Production NFT' },
  },
] as const

export const DAPP_REGISTRY_URL = 'https://awakehelix.io/#/docs/chapter-16'
