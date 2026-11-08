import { HELIX, LGNS } from '../config/site'

export interface ProductDefinition {
  id: string
  name: { zh: string; en: string }
  short: { zh: string; en: string }
  description: { zh: string; en: string }
  chain: 'anubis' | 'polygon' | 'both'
  contract?: string
  contractSource: 'rpc' | 'dapp-registry' | 'public-docs'
  status: 'live' | 'partial' | 'unreadable'
  asset: { zh: string; en: string }
  term: { zh: string; en: string }
  entry: { zh: string; en: string }
  exit: { zh: string; en: string }
  readable: { zh: string; en: string }
  unreadable?: { zh: string; en: string }
  metric: 'staking' | 'pool' | 'helix' | 'none'
}

export const PRODUCTS: ProductDefinition[] = [
  {
    id: 'flex-staking',
    name: { zh: '活期质押', en: 'Flexible staking' },
    short: { zh: '按合约 index 观察实际增长', en: 'Observe actual growth through the contract index' },
    description: {
      zh: 'LGNS 进入质押合约后，index 随合约记账变化。这里显示合约前后读数，不采用页面配置利率。',
      en: 'Once LGNS enters the staking contract, its index changes through contract accounting. This site measures actual readings instead of configured rates.',
    },
    chain: 'both',
    contract: LGNS.anubis.indexContract,
    contractSource: 'rpc',
    status: 'partial',
    asset: { zh: 'LGNS', en: 'LGNS' },
    term: { zh: '活期；以合约实际解锁条件为准', en: 'Flexible; contract exit rules apply' },
    entry: { zh: '存入 LGNS', en: 'Deposit LGNS' },
    exit: { zh: '从质押合约提取', en: 'Withdraw from staking contract' },
    readable: { zh: 'index、链上余额、领取事件', en: 'Index, on-chain balance, claim events' },
    unreadable: { zh: '完整计息公式与管理员权限', en: 'Full interest formula and admin permissions' },
    metric: 'staking',
  },
  {
    id: 'locked-360',
    name: { zh: '360 天长期质押', en: '360-day staking' },
    short: { zh: '基础 index 可读，额外激励需链上证据', en: 'Base index is readable; extra incentives need on-chain evidence' },
    description: {
      zh: '公开界面提供该期限选项，但期限专属参数没有统一公开的链上读取接口。页面只展示共享 index、合约余额和实际领取事件。',
      en: 'The public interface offers this term, but term-specific parameters are not exposed through a unified on-chain read interface. Only the shared index, contract balances and observed claims are shown.',
    },
    chain: 'both',
    contract: LGNS.anubis.indexContract,
    contractSource: 'rpc',
    status: 'partial',
    asset: { zh: 'LGNS', en: 'LGNS' },
    term: { zh: '约 360 天，具体以仓位状态为准', en: 'About 360 days, subject to position state' },
    entry: { zh: '按合约期限锁定', en: 'Lock under contract terms' },
    exit: { zh: '到期后按合约规则领取', en: 'Claim after maturity under contract rules' },
    readable: { zh: 'index、合约余额、历史领取事件', en: 'Index, contract balance, historical claims' },
    unreadable: { zh: '额外期限奖励的完整参数', en: 'Complete term-incentive parameters' },
    metric: 'staking',
  },
  {
    id: 'locked-600',
    name: { zh: '600 天长期质押', en: '600-day staking' },
    short: { zh: '长期档位的额外收益不作为链上事实展示', en: 'Extra long-term returns are not presented without on-chain proof' },
    description: {
      zh: '期限更长通常意味着更长的资金占用。本站不把没有链上参数支持的期限加成写成确定收益，也不假定基础 index 等于完整产品回报。',
      en: 'A longer term generally means capital is committed longer. The site does not turn unsupported term bonuses into guaranteed returns, nor assume the base index equals the complete product return.',
    },
    chain: 'both',
    contract: LGNS.anubis.indexContract,
    contractSource: 'rpc',
    status: 'partial',
    asset: { zh: 'LGNS', en: 'LGNS' },
    term: { zh: '约 600 天，具体以仓位状态为准', en: 'About 600 days, subject to position state' },
    entry: { zh: '按合约期限锁定', en: 'Lock under contract terms' },
    exit: { zh: '到期后按合约规则领取', en: 'Claim after maturity under contract rules' },
    readable: { zh: 'index、合约余额、历史领取事件', en: 'Index, contract balance, historical claims' },
    unreadable: { zh: '额外期限奖励与完整解锁参数', en: 'Extra incentives and complete unlock parameters' },
    metric: 'staking',
  },
  {
    id: 'anubis-lp',
    name: { zh: 'Anubis LGNS/DAI 流动性', en: 'Anubis LGNS/DAI liquidity' },
    short: { zh: '池子深度和价格由储备直接读取', en: 'Pool depth and price are read directly from reserves' },
    description: {
      zh: '向交易池提供 LGNS 与 DAI，可获得交易活动带来的手续费，同时承担价格变化和无常损失。',
      en: 'Providing LGNS and DAI to the pool can earn trading fees while carrying price and impermanent-loss exposure.',
    },
    chain: 'anubis',
    contract: LGNS.anubis.pair,
    contractSource: 'rpc',
    status: 'live',
    asset: { zh: 'LGNS + DAI', en: 'LGNS + DAI' },
    term: { zh: '无固定期限', en: 'No fixed term' },
    entry: { zh: '按池子比例加入两种资产', en: 'Add both assets at the pool ratio' },
    exit: { zh: '移除流动性，实际价格受滑点影响', en: 'Remove liquidity; actual value is affected by slippage' },
    readable: { zh: '储备、价格、LP 总量和占比', en: 'Reserves, price, LP supply and share' },
    unreadable: { zh: '池子费率未通过统一接口公开时的实际年化', en: 'Actual annualized fee return when the fee tier is not exposed' },
    metric: 'pool',
  },
  {
    id: 'polygon-lp',
    name: { zh: 'Polygon LGNS/DAI 流动性', en: 'Polygon LGNS/DAI liquidity' },
    short: { zh: '与 Anubis 是不同合约、不同储备', en: 'A separate contract with separate reserves' },
    description: {
      zh: '同名 LGNS 在 Polygon 上是独立合约。这里的价格和流动性不能直接与 Anubis 资产互换。',
      en: 'LGNS on Polygon is a separate contract. Its price and liquidity cannot be treated as interchangeable with the Anubis asset.',
    },
    chain: 'polygon',
    contract: LGNS.polygon.pair,
    contractSource: 'rpc',
    status: 'live',
    asset: { zh: 'Polygon LGNS + DAI', en: 'Polygon LGNS + DAI' },
    term: { zh: '无固定期限', en: 'No fixed term' },
    entry: { zh: '加入 Polygon 池子', en: 'Add liquidity on Polygon' },
    exit: { zh: '移除流动性并承担滑点', en: 'Remove liquidity and bear slippage' },
    readable: { zh: '储备、价格、LP 总量和占比', en: 'Reserves, price, LP supply and share' },
    unreadable: { zh: '池子费率未公开时的实际年化', en: 'Actual annualized fee return if the fee tier is not exposed' },
    metric: 'pool',
  },
  {
    id: 'bonds',
    name: { zh: '债券与销毁产品', en: 'Bonds and burn products' },
    short: { zh: '折价、归属和待领取无法验证时不展示', en: 'Discount, vesting and claimable values are omitted when unverifiable' },
    description: {
      zh: '债券可能涉及折价、归属期和待领取数量。当前公开可读接口不足以证明这些条款时，本站只保留机制说明。',
      en: 'Bonds may involve discounts, vesting and claimable balances. When public readable interfaces do not prove those terms, this site keeps only the mechanism note.',
    },
    chain: 'anubis',
    contractSource: 'public-docs',
    status: 'unreadable',
    asset: { zh: 'DAI / LP 等，以实际合约入口为准', en: 'DAI / LP etc., subject to the actual contract' },
    term: { zh: '链上不可统一读取', en: 'Not uniformly readable on-chain' },
    entry: { zh: '以实际合约交易为准', en: 'Subject to actual contract transactions' },
    exit: { zh: '归属与领取条件不可确认', en: 'Vesting and claim terms cannot be confirmed' },
    readable: { zh: '无稳定公开可读接口', en: 'No stable public readable interface' },
    unreadable: { zh: '折价、归属期、待领取数量', en: 'Discount, vesting, claimable amount' },
    metric: 'none',
  },
  {
    id: 'reserve',
    name: { zh: '资金与储备地址', en: 'Funds and reserve addresses' },
    short: { zh: '地址余额可读，归属与可兑付性不可自行推定', en: 'Balances are readable; ownership and redeemability cannot be assumed' },
    description: {
      zh: '链上可以看到地址持有的资产，但地址用途、控制人和是否承诺兑付需要独立证据。',
      en: 'Address balances are visible on-chain, but address purpose, control and redemption obligations require independent evidence.',
    },
    chain: 'anubis',
    contractSource: 'public-docs',
    status: 'partial',
    asset: { zh: 'DAI、LGNS 及其他代币', en: 'DAI, LGNS and other tokens' },
    term: { zh: '不适用', en: 'Not applicable' },
    entry: { zh: '不适用', en: 'Not applicable' },
    exit: { zh: '不适用', en: 'Not applicable' },
    readable: { zh: '公开地址余额', en: 'Balances at public addresses' },
    unreadable: { zh: '地址归属、控制权限与兑付承诺', en: 'Ownership, permissions and redemption obligations' },
    metric: 'none',
  },
  {
    id: 'helix',
    name: { zh: 'AiLGNS / HELIX', en: 'AiLGNS / HELIX' },
    short: { zh: 'Power、每日额度与链上排放竞争', en: 'Power, daily quotas and on-chain emission competition' },
    description: {
      zh: 'HELIX 以 DAI、LGNS 或 AiLGNS 形成 Power，并参与每日 AiLGNS 排放。这里区分公开机制说明与当前合约读数。',
      en: 'HELIX turns DAI, LGNS or AiLGNS into Power and participates in daily AiLGNS emission. Public mechanics and current contract readings are labelled separately.',
    },
    chain: 'anubis',
    contract: HELIX.ledger,
    contractSource: 'dapp-registry',
    status: 'live',
    asset: { zh: 'DAI / LGNS / AiLGNS', en: 'DAI / LGNS / AiLGNS' },
    term: { zh: '按日结算，按 Epoch 组织', en: 'Daily settlement, organised by epoch' },
    entry: { zh: '入金或销毁形成 Power', en: 'Deposit or burn to create Power' },
    exit: { zh: '取决于 Power 领取与仓位规则', en: 'Depends on Power claims and position rules' },
    readable: { zh: 'AiLGNS 供应、每日额度、Power、销毁地址余额', en: 'AiLGNS supply, daily quotas, Power, burn address balance' },
    unreadable: { zh: '社区多层奖励的完整可复现账本需事件索引', en: 'The complete community reward ledger requires event indexing' },
    metric: 'helix',
  },
]

export const productById = (id: string) => PRODUCTS.find((product) => product.id === id)

export const STATUS_LABEL = {
  live: { zh: '链上可读', en: 'Readable on-chain' },
  partial: { zh: '部分可读', en: 'Partially readable' },
  unreadable: { zh: '链上不可读', en: 'Not readable' },
} as const
