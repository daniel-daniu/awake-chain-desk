export interface ContractRef {
  address: string
  label: { zh: string; en: string }
  verified: boolean
  kind: 'token' | 'pair' | 'vault' | 'treasury' | 'bond' | 'fee'
  note: { zh: string; en: string }
}

export const CONTRACTS = {
  lgns: {
    address: '0x4D1D808a081FdAc440703b3765FC61f8028C06B8',
    label: { zh: 'LGNS 代币（Longinus）', en: 'LGNS token (Longinus)' },
    verified: false,
    kind: 'token',
    note: { zh: '9 位小数，总量约 48.86 亿', en: '9 decimals, ~4.886B supply' },
  },
  glgns: {
    address: '0xf140a92C156e76F5A1d3D6f96284b250330F8F4c',
    label: { zh: 'gLGNS 治理代币', en: 'gLGNS governance token' },
    verified: true,
    kind: 'token',
    note: { zh: '已开源验证，总量 2.1 亿', en: 'Verified source, 210M supply' },
  },
  pairPrimary: {
    address: '0x32A4586797E3f561F41C0F47CA57eD08D64f3dC0',
    label: { zh: 'LGNS/DAI 主池', en: 'LGNS/DAI primary pool' },
    verified: false,
    kind: 'pair',
    note: { zh: 'RocketSwap 主交易对，深度最高', en: 'Deepest RocketSwap pair' },
  },
  pairSecondary: {
    address: '0x4171222Dfb000f1b9A2E7FB9C213F3B7C656Ba9F',
    label: { zh: 'LGNS 第二交易对', en: 'LGNS secondary pair' },
    verified: false,
    kind: 'pair',
    note: { zh: '计价资产非 DAI，未纳入主价计算', en: 'Not DAI-quoted, excluded from primary pricing' },
  },
  staking: {
    address: '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228',
    label: { zh: '疑似质押 / 分发合约', en: 'Probable staking / distributor' },
    verified: false,
    kind: 'vault',
    note: { zh: 'EIP-1967 可升级代理，持有 79.7% 供应', en: 'Upgradeable proxy, holds 79.7% of supply' },
  },
  treasury: {
    address: '0x27Cb55eE75E777fF972B74B6E68782D12Bd4ec46',
    label: { zh: '疑似资金 / 国库合约', en: 'Probable treasury / fund contract' },
    verified: false,
    kind: 'treasury',
    note: { zh: '持有 7841 万 DAI，地址未标注', en: 'Holds 78.41M DAI, unlabeled' },
  },
  bonding: {
    address: '0x8bfF24CCAB5ff6d9A6182283C130dD67240c3378',
    label: { zh: 'Bonding 债券相关', en: 'Bonding contract' },
    verified: false,
    kind: 'bond',
    note: { zh: '债券产品相关地址，未开源', en: 'Bond-related, unverified source' },
  },
  feeVault: {
    address: '0xFF5d4DF37ABE60c6B59872C4683e5c70947AAaAa',
    label: { zh: 'FeeVault 手续费金库', en: 'FeeVault' },
    verified: false,
    kind: 'fee',
    note: { zh: '协议手续费归集地址', en: 'Protocol fee collector' },
  },
  dai: {
    address: '0x83fd06F0846d9D90B3016bF670Efe2E0B11cDe14',
    label: { zh: 'DAI（Anubis 原生 gas 币）', en: 'DAI (Anubis native gas token)' },
    verified: false,
    kind: 'token',
    note: { zh: '18 位小数，总量约 2.67 亿', en: '18 decimals, ~267M supply' },
  },
} satisfies Record<string, ContractRef>

export const EXPLORER = 'https://browser.anubispace.org'

export const addressUrl = (addr: string) => `${EXPLORER}/address/${addr}`
export const tokenUrl = (addr: string) => `${EXPLORER}/token/${addr}`
