import type { Bi } from '../types'

export const BASICS: Array<{
  number: string
  title: Bi
  summary: Bi
  points: Bi[]
}> = [
  {
    number: '01',
    title: { zh: '区块链是公开账本', en: 'A blockchain is a public ledger' },
    summary: {
      zh: '交易被写入区块，区块依次连接。公开地址和交易任何人都能查看。',
      en: 'Transactions are written into blocks and linked in order. Public addresses and transactions can be inspected by anyone.',
    },
    points: [
      { zh: '写入链上的历史通常不能撤销。', en: 'History written on-chain is generally irreversible.' },
      { zh: '转错地址、授权错误或私钥泄露都可能造成不可逆损失。', en: 'Wrong addresses, approvals and leaked keys can cause irreversible loss.' },
    ],
  },
  {
    number: '02',
    title: { zh: '同名代币不代表同一个资产', en: 'The same symbol can be a different asset' },
    summary: {
      zh: '判断资产要先看链和合约地址。Anubis 与 Polygon 上的 LGNS 是两个不同合约。',
      en: 'Check the chain and contract address first. LGNS on Anubis and Polygon are separate contracts.',
    },
    points: [
      { zh: '图标、名称和群聊截图都不能证明合约身份。', en: 'Logos, names and chat screenshots do not prove contract identity.' },
      { zh: '跨链价差可能包含流动性、桥和兑付差异。', en: 'A cross-chain gap can reflect liquidity, bridge and redemption differences.' },
    ],
  },
  {
    number: '03',
    title: { zh: '收益不是一个固定数字', en: 'Yield is not a fixed number' },
    summary: {
      zh: '本站用前后两次 index 计算增速，再换算日化和年化。年化描述代币数量变化。',
      en: 'This site measures growth between actual index readings and annualises it. Annual yield describes token count, not dollar value.',
    },
    points: [
      { zh: '币价下跌、交易税、滑点和退出限制都会改变最终结果。', en: 'Price decline, tax, slippage and exit limits all change the final result.' },
      { zh: '7 日和 30 日窗口用于降低单日噪声，但不是未来承诺。', en: 'Seven- and thirty-day windows reduce one-day noise but do not promise the future.' },
    ],
  },
  {
    number: '04',
    title: { zh: 'Gas、税费和协议费用不同', en: 'Gas, token tax and protocol fees are different' },
    summary: {
      zh: 'Gas 付给网络，代币税由代币合约扣除，池子和质押合约还可能各有费用。',
      en: 'Gas is paid to the network, token tax is deducted by the token contract, and pools or staking contracts may charge separately.',
    },
    points: [
      { zh: 'Anubis 用 DAI 支付 Gas，Polygon 用 POL。', en: 'Anubis uses DAI for gas; Polygon uses POL.' },
      { zh: '页面会分项显示，不会把不同费用合成一个“总费率”。', en: 'The site lists them separately instead of combining them into one headline fee.' },
    ],
  },
]

export const METRIC_HELP: Array<{ name: Bi; meaning: Bi; caution: Bi }> = [
  {
    name: { zh: '链上价格', en: 'On-chain price' },
    meaning: { zh: '池内 DAI 储备除以 LGNS 储备。', en: 'DAI reserves divided by LGNS reserves.' },
    caution: { zh: '这是小额参考价；真实成交还会受到滑点和税费影响。', en: 'It is a small-trade reference; actual fills also face slippage and tax.' },
  },
  {
    name: { zh: '税后参考价', en: 'After-tax reference price' },
    meaning: { zh: '用链上卖出税对池子价格做简单扣减。', en: 'The pool quote reduced by the on-chain sell tax.' },
    caution: { zh: '不等于你的实际到手金额，因为还可能存在滑点和额外费用。', en: 'It is not your final proceeds: slippage and other fees may still apply.' },
  },
  {
    name: { zh: 'Index', en: 'Index' },
    meaning: { zh: '质押合约里的记账指数，增速可用来观察实际结算。', en: 'An accounting index in the staking contract whose growth can be measured.' },
    caution: { zh: 'index 增长不等于美元收益，也不说明新资金是否仍在进入。', en: 'Index growth is not USD profit and does not prove new capital is entering.' },
  },
  {
    name: { zh: '池内 DAI', en: 'Pool DAI' },
    meaning: { zh: '当前池子能用来承接卖单的 DAI 数量。', en: 'The DAI currently available to absorb sells.' },
    caution: { zh: '池子越浅，大额卖出造成的价格冲击越大。', en: 'Thinner pools mean larger price impact for a big sell.' },
  },
  {
    name: { zh: '领取事件', en: 'Claim events' },
    meaning: { zh: '最近观察窗口内实际出现的领取记录数量与金额。', en: 'Actual claim records found in the latest observation window.' },
    caution: { zh: '如果索引没有覆盖完整窗口，会标记为不完整。', en: 'If the index does not cover the full window, it is marked incomplete.' },
  },
]

export const GLOSSARY: Array<{ term: Bi; description: Bi }> = [
  { term: { zh: '区块', en: 'Block' }, description: { zh: '一批交易被打包后的记录单元。', en: 'A record containing a batch of transactions.' } },
  { term: { zh: 'RPC', en: 'RPC' }, description: { zh: '程序向区块链节点读取合约数据的接口。', en: 'An interface programs use to read contract data from a node.' } },
  { term: { zh: 'Gas', en: 'Gas' }, description: { zh: '执行交易所需计算量的计量单位。', en: 'A unit measuring computation required by a transaction.' } },
  { term: { zh: 'gwei', en: 'gwei' }, description: { zh: 'Gas 价格的常用单位，1 gwei 等于十亿分之一原生币。', en: 'A common gas-price unit; one gwei is one billionth of a native coin.' } },
  { term: { zh: 'ERC-20', en: 'ERC-20' }, description: { zh: '常见的同质化代币接口标准。', en: 'A common fungible-token interface standard.' } },
  { term: { zh: '代理合约', en: 'Proxy contract' }, description: { zh: '数据地址和逻辑实现分离，管理员可能更换实现。', en: 'A contract separating state from logic so an admin may replace the implementation.' } },
  { term: { zh: '流动性池', en: 'Liquidity pool' }, description: { zh: '两种资产按公式自动报价的合约储备。', en: 'Contract reserves that quote between two assets using a formula.' } },
  { term: { zh: '滑点', en: 'Slippage' }, description: { zh: '成交价与大额交易前参考价之间的差异。', en: 'The difference between a fill and the quote before a large trade.' } },
  { term: { zh: '无常损失', en: 'Impermanent loss' }, description: { zh: '两种池内资产相对价格变化造成的持有差额。', en: 'A holding difference caused by relative price moves in a two-asset pool.' } },
  { term: { zh: 'APR', en: 'APR' }, description: { zh: '不做复利再投的线性年化。', en: 'A linear annualisation without compounding.' } },
  { term: { zh: 'APY', en: 'APY' }, description: { zh: '假设收益持续复投的复合年化。', en: 'A compounded annualisation assuming continuous reinvestment.' } },
  { term: { zh: '增发', en: 'Issuance' }, description: { zh: '总供应增加，持有者占比可能被稀释。', en: 'Total supply increases, potentially diluting every holder.' } },
  { term: { zh: '销毁', en: 'Burn' }, description: { zh: '代币转入无法取出的地址或调用销毁函数。', en: 'Tokens sent to an inaccessible address or destroyed by a contract function.' } },
  { term: { zh: 'Power', en: 'Power' }, description: { zh: 'HELIX 中参与排放结算的算力单位，不是代币本身。', en: 'A hashpower-like accounting unit used for HELIX emissions; not a token itself.' } },
]

export const RISK_CHECKLIST: Bi[] = [
  { zh: '合约地址是否与可信来源一致，是否为代理合约？', en: 'Does the contract address match a trusted source, and is it a proxy?' },
  { zh: '收益来自真实费用、增发还是新资金，是否能从链上复现？', en: 'Does yield come from fees, issuance or new capital, and can it be reproduced on-chain?' },
  { zh: '池内 DAI 与头部持仓占供应多少，退出会否产生明显冲击？', en: 'How much DAI is in the pool and how concentrated is supply; will exit cause material impact?' },
  { zh: '买入、卖出、质押进出和 Gas 分别需要多少成本？', en: 'What do buy, sell, stake entry, exit and gas each cost?' },
  { zh: '锁仓期限、解除条件和待领取数量是否都有可读证据？', en: 'Are lock time, exit conditions and claimable balances all backed by readable evidence?' },
]
