import type { Product } from '../types'
import { CONTRACTS } from '../config/contracts'

export const PRODUCTS: Product[] = [
  {
    id: 'staking',
    name: { zh: 'LGNS 单币质押', en: 'LGNS single-asset staking' },
    tagline: { zh: '链上可见质押余额与 claimInterest 领取', en: 'On-chain staking balance and claimInterest payouts' },
    description: {
      zh: 'LGNS 转入质押合约后，合约按自身规则计算利息。链上能读到的是质押余额和 claimInterest 转账；利率参数、复投与解锁规则在未开源合约里，读不到。',
      en: 'LGNS is deposited into the staking contract, which accrues interest under its own rules. On-chain you can read the staked balance and claimInterest transfers; rate parameters, compounding and unlock rules sit in unverified code.',
    },
    status: 'unverified',
    tvlUsd: null,
    participants: null,
    contract: CONTRACTS.staking.address,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '质押合约余额', en: 'Staked balance' }, value: { zh: '链上读取', en: 'On-chain' }, hint: { zh: 'balanceOf', en: 'balanceOf' } },
      { label: { zh: '利息领取样本', en: 'Interest sample' }, value: { zh: '最近转出记录', en: 'Recent transfers' }, hint: { zh: 'claimInterest 方法', en: 'claimInterest method' } },
      { label: { zh: '利息领取占比', en: 'Claim share' }, value: { zh: '按样本计算', en: 'From sample' }, hint: { zh: '实时值见链上数据页', en: 'Live value on the on-chain page' } },
    ],
    mechanics: {
      zh: [
        '用户调用 stake 把 LGNS 转入质押合约，合约记录份额。',
        '领取时合约通过 claimInterest 向用户转出 LGNS；链上只能看到转账，读不到计息公式。',
        '利率、复投频率、解锁与罚没规则未开源，无法独立验证。',
        '利息以 LGNS 计价，不是稳定币现金流。',
      ],
      en: [
        'Users call stake to move LGNS into the contract, which records shares.',
        'On claim, the contract transfers LGNS via claimInterest; only the transfer is visible, not the interest formula.',
        'Rate, compounding frequency, unlock and penalty rules are unverified and cannot be independently checked.',
        'Interest is denominated in LGNS, not stablecoin cash flow.',
      ],
    },
    risks: {
      zh: [
        '质押合约是 EIP-1967 可升级代理且未开源，逻辑与余额可被管理员更改。',
        '该合约持有约 79% 的 LGNS 供应，集中度极高。',
        '利息以 LGNS 发放，会持续增加流通量并稀释价格。',
        '解除质押的时间与条件未公开，极端情况下可能无法及时退出。',
      ],
      en: [
        'The staking contract is an upgradeable EIP-1967 proxy with unverified source; logic and balances can be changed by an admin.',
        'The contract holds roughly 79% of LGNS supply — extreme concentration.',
        'Interest is paid in LGNS, continuously increasing circulating supply and diluting price.',
        'Unstaking timing and conditions are not public; exit may not be timely in stress.',
      ],
    },
    evidence: [
      { label: { zh: '质押合约', en: 'Staking contract' }, value: CONTRACTS.staking.address, href: `https://browser.anubispace.org/address/${CONTRACTS.staking.address}` },
      { label: { zh: 'LGNS 代币', en: 'LGNS token' }, value: CONTRACTS.lgns.address, href: `https://browser.anubispace.org/token/${CONTRACTS.lgns.address}` },
      { label: { zh: 'claimInterest 方法', en: 'claimInterest selector' }, value: '0xd286f3cf' },
    ],
  },
  {
    id: 'bond-liquidity',
    name: { zh: '流动性债券', en: 'Liquidity bonds' },
    tagline: { zh: '用 DAI/USDT 或 LP 换取 LGNS', en: 'Exchange DAI/USDT or LP for LGNS' },
    description: {
      zh: '债券合约未开源。链上能看到资产转入与 LGNS 转出，但折价率、归属期与待领取金额都读不到。',
      en: 'The bond contract is unverified. On-chain you can see assets in and LGNS out, but discount, vesting and claimable amounts are unreadable.',
    },
    status: 'unverified',
    tvlUsd: null,
    participants: null,
    contract: CONTRACTS.bonding.address,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '计价资产', en: 'Quote asset' }, value: 'DAI / USDT / LP' },
      { label: { zh: '折价率', en: 'Discount' }, value: { zh: '链上不可读', en: 'Not readable' } },
      { label: { zh: '归属期', en: 'Vesting' }, value: { zh: '链上不可读', en: 'Not readable' } },
    ],
    mechanics: {
      zh: [
        '用户支付 DAI/USDT 或 LGNS/DAI LP，合约收走资产并转出 LGNS。',
        '债券通常分批归属，归属期内代币逐步可领取。',
        '折价、归属曲线与待领取金额由合约内部参数决定，未开源时无法核对。',
      ],
      en: [
        'Users pay DAI/USDT or LGNS/DAI LP; the contract keeps the assets and sends LGNS.',
        'Bonds typically vest over time, releasing tokens gradually.',
        'Discount, vesting curve and claimable amounts are internal parameters that cannot be checked without verified source.',
      ],
    },
    risks: {
      zh: [
        '债券直接增加流通供应，是价格的持续性稀释来源。',
        'Bonding 合约未开源，折价、归属与待领取金额无法从链上读取。',
        '若以 LP 认购，同时承担无常损失与代币下跌风险。',
      ],
      en: [
        'Bonds directly increase circulating supply and dilute price continuously.',
        'The bonding contract is unverified; discount, vesting and claimable amounts cannot be read on-chain.',
        'LP-based bonds add impermanent loss on top of token downside.',
      ],
    },
    evidence: [
      { label: { zh: 'Bonding 合约', en: 'Bonding contract' }, value: CONTRACTS.bonding.address, href: `https://browser.anubispace.org/address/${CONTRACTS.bonding.address}` },
      { label: { zh: '主池 LP', en: 'Primary LP' }, value: CONTRACTS.pairPrimary.address, href: `https://browser.anubispace.org/address/${CONTRACTS.pairPrimary.address}` },
    ],
  },
  {
    id: 'bond-reserve',
    name: { zh: '储备债券', en: 'Reserve bonds' },
    tagline: { zh: '资产进入资金地址，换取 LGNS', en: 'Assets go to a reserve address in exchange for LGNS' },
    description: {
      zh: '与流动性债券类似，但资产进入资金地址而非交易池。资金地址没有官方标注，链上只能看到一个持有 7,841 万 DAI 的未开源合约。',
      en: 'Similar to liquidity bonds, but assets go to a reserve address rather than a pool. No address is officially labeled; on-chain there is an unverified contract holding 78.41M DAI.',
    },
    status: 'unverified',
    tvlUsd: null,
    participants: null,
    contract: CONTRACTS.bonding.address,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '资产去向', en: 'Asset destination' }, value: { zh: '未标注地址', en: 'Unlabeled address' } },
      { label: { zh: '疑似资金地址 DAI', en: 'Probable reserve DAI' }, value: '78.41M' },
      { label: { zh: '占 LGNS 市值', en: 'vs LGNS market cap' }, value: '约 33%', hint: { zh: '假设该地址为资金池', en: 'If the address is the reserve' } },
    ],
    mechanics: {
      zh: [
        '用户用 DAI/USDT 认购，资产进入协议控制的地址，合约转出 LGNS。',
        '资金地址的用途、权限与余额变动没有公开标注。',
        '是否存在回购或兑付，取决于该地址的实际操作，链上无法预先验证。',
      ],
      en: [
        'Users subscribe with DAI/USDT; assets go to a protocol-controlled address and LGNS is sent out.',
        'The address purpose, permissions and balance changes are not publicly labeled.',
        'Whether buybacks or redemptions exist depends on actual operations, which cannot be verified in advance.',
      ],
    },
    risks: {
      zh: [
        '没有官方标注的资金地址，无法确认储备归属。',
        '疑似地址为未开源合约，资金用途不透明。',
        '任何“兜底”表述都缺少可执行合约与法律约束。',
      ],
      en: [
        'No labeled reserve address, so reserve ownership cannot be confirmed.',
        'The probable address is an unverified contract with opaque fund usage.',
        'Any "floor" narrative lacks an enforceable contract or legal obligation.',
      ],
    },
    evidence: [
      { label: { zh: '疑似资金地址', en: 'Probable reserve' }, value: CONTRACTS.treasury.address, href: `https://browser.anubispace.org/address/${CONTRACTS.treasury.address}` },
      { label: { zh: 'DAI 代币', en: 'DAI token' }, value: CONTRACTS.dai.address, href: `https://browser.anubispace.org/token/${CONTRACTS.dai.address}` },
    ],
  },
  {
    id: 'mint',
    name: { zh: '隐私稳定币铸造', en: 'Privacy stablecoin minting' },
    tagline: { zh: '公开资料描述，链上参数不可读', en: 'Described in public docs; parameters unreadable on-chain' },
    description: {
      zh: '公开资料把“用 LGNS 铸造隐私稳定币”列为核心场景，但当前没有可核对的铸造合约、抵押率或清算参数。本站不展示未经验证的数字。',
      en: 'Public materials list minting a privacy stablecoin against LGNS as a core use case, but there is no verifiable mint contract, collateral ratio or liquidation parameters. No unverified numbers are shown here.',
    },
    status: 'info',
    tvlUsd: null,
    participants: null,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '抵押资产', en: 'Collateral' }, value: 'LGNS' },
      { label: { zh: '抵押率', en: 'Collateral ratio' }, value: { zh: '链上不可读', en: 'Not readable' } },
      { label: { zh: '清算参数', en: 'Liquidation' }, value: { zh: '链上不可读', en: 'Not readable' } },
    ],
    mechanics: {
      zh: [
        '设计目标：用户锁定 LGNS，按协议价格铸造稳定币。',
        '稳定币的稳定性依赖套利机制与抵押品价值，而非银行存款。',
        '抵押率、预言机与清算阈值未公开，无法评估偿付能力。',
      ],
      en: [
        'Design goal: users lock LGNS and mint stablecoins at a protocol price.',
        'Stability relies on arbitrage and collateral value, not bank deposits.',
        'Collateral ratio, oracle and liquidation thresholds are not public, so solvency cannot be assessed.',
      ],
    },
    risks: {
      zh: ['抵押率、清算参数与预言机未公开。', '算法稳定币在压力场景下历史表现不佳。', '隐私功能与合规边界存在不确定性。'],
      en: ['Collateral ratio, liquidation parameters and oracle design are not public.', 'Algorithmic stablecoins have a poor track record under stress.', 'Privacy features carry regulatory uncertainty.'],
    },
    evidence: [{ label: { zh: 'LGNS 代币', en: 'LGNS token' }, value: CONTRACTS.lgns.address, href: `https://browser.anubispace.org/token/${CONTRACTS.lgns.address}` }],
  },
  {
    id: 'treasury',
    name: { zh: '资金地址与储备', en: 'Reserve address & balances' },
    tagline: { zh: '未标注地址持有 7,841 万 DAI', en: 'Unlabeled address holds 78.41M DAI' },
    description: {
      zh: '链上有一个未开源、未标注的合约持有 7,841 万 DAI，约占 Anubis 上 DAI 总量的 29%。它是否属于项目、是否可动用，均无法确认。',
      en: 'An unverified, unlabeled contract holds 78.41M DAI, about 29% of DAI supply on Anubis. Whether it belongs to the project and whether funds are accessible cannot be confirmed.',
    },
    status: 'info',
    tvlUsd: null,
    participants: null,
    contract: CONTRACTS.treasury.address,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '疑似资金地址 DAI', en: 'Probable reserve DAI' }, value: '78.41M' },
      { label: { zh: '占 DAI 总量', en: 'Share of DAI supply' }, value: '约 29%' },
      { label: { zh: '占 LGNS 市值', en: 'vs LGNS market cap' }, value: '约 33%', hint: { zh: '按 Anubis 链上价', en: 'At Anubis on-chain price' } },
    ],
    mechanics: {
      zh: [
        '资金地址由未开源合约控制，链上只能读取 DAI 余额与代币持仓。',
        '没有公开的支出、回购或兑付记录可供核对。',
        '余额变化可以通过区块浏览器持续观察。',
      ],
      en: [
        'The address is controlled by an unverified contract; only DAI and token balances are readable.',
        'No public spending, buyback or redemption records are available to verify.',
        'Balance changes can be monitored continuously in the explorer.',
      ],
    },
    risks: {
      zh: ['地址未标注，无法确认归属。', '未开源合约，资金用途不透明。', '余额不等于可兑付能力，任何“兜底”说法都缺少合约约束。'],
      en: ['Unlabeled address, ownership unconfirmed.', 'Unverified contract with opaque fund usage.', 'Balance is not redemption capacity; any "floor" claim lacks contractual enforcement.'],
    },
    evidence: [
      { label: { zh: '疑似资金地址', en: 'Probable reserve' }, value: CONTRACTS.treasury.address, href: `https://browser.anubispace.org/address/${CONTRACTS.treasury.address}` },
      { label: { zh: 'FeeVault', en: 'FeeVault' }, value: CONTRACTS.feeVault.address, href: `https://browser.anubispace.org/address/${CONTRACTS.feeVault.address}` },
    ],
  },
  {
    id: 'fomo',
    name: { zh: 'FOMO 奖池', en: 'FOMO pot' },
    tagline: { zh: '奖池合约未公开，链上不可读', en: 'Pot contract not published; unreadable on-chain' },
    description: {
      zh: '公开资料提到交易税会注入奖池并按周期开奖，但没有公开的奖池合约地址、开奖记录或资金流水可供核对。',
      en: 'Public materials mention trading fees feeding a pot with periodic draws, but no pot address, draw history or fund flow is available to verify.',
    },
    status: 'info',
    tvlUsd: null,
    participants: null,
    contractVerified: false,
    chain: 'anubis',
    metrics: [
      { label: { zh: '资金来源', en: 'Funding' }, value: { zh: '交易税（描述）', en: 'Trading fees (described)' } },
      { label: { zh: '奖池地址', en: 'Pot address' }, value: { zh: '未公开', en: 'Not published' } },
      { label: { zh: '开奖记录', en: 'Draw history' }, value: { zh: '链上不可读', en: 'Not readable' } },
    ],
    mechanics: {
      zh: ['公开资料称交易税的一部分划入奖池。', '按区块或时间周期抽取地址。', '规则、概率与资金流水没有链上证据。'],
      en: ['Public materials say part of trading fees goes to a pot.', 'An address is drawn per block or period.', 'Rules, odds and fund flows have no on-chain evidence.'],
    },
    risks: {
      zh: ['规则不透明，无法验证中奖概率。', '奖池规模与资金流向未公开。', '参与本身不改变代币的高波动风险。'],
      en: ['Opaque rules make win probability unverifiable.', 'Pot size and fund flows are not public.', 'Participation does not reduce the token’s high volatility.'],
    },
    evidence: [{ label: { zh: 'FeeVault', en: 'FeeVault' }, value: CONTRACTS.feeVault.address, href: `https://browser.anubispace.org/address/${CONTRACTS.feeVault.address}` }],
  },
  {
    id: 'liquidity',
    name: { zh: '流动性池 & NFT 权益', en: 'Liquidity pools & NFT perks' },
    tagline: { zh: 'Anubis 与 Polygon 两个 LGNS/DAI 主池', en: 'Two LGNS/DAI pools on Anubis and Polygon' },
    description: {
      zh: 'Anubis 主池约 1,700 万 DAI，Polygon 主池约 917 万 DAI。提供流动性可获得手续费，同时承担无常损失。NFT 权益需以合约与公告为准。',
      en: 'The Anubis pool holds about 17M DAI; the Polygon pool about 9.17M DAI. Providing liquidity earns fees but carries impermanent loss. NFT perks depend on contracts and announcements.',
    },
    status: 'live',
    tvlUsd: null,
    participants: null,
    contract: CONTRACTS.pairPrimary.address,
    contractVerified: false,
    chain: 'both',
    metrics: [
      { label: { zh: 'Anubis 主池 DAI', en: 'Anubis pool DAI' }, value: '约 1,700 万' },
      { label: { zh: 'Polygon 主池 DAI', en: 'Polygon pool DAI' }, value: '约 917 万' },
      { label: { zh: '跨链价差', en: 'Cross-chain spread' }, value: '约 4.2×', hint: { zh: '实时读取两链主池', en: 'Live from both pools' } },
    ],
    mechanics: {
      zh: [
        '向 LGNS/DAI 池注入两种资产，获得 LP 代币与交易手续费。',
        '价格波动会改变两种资产比例，产生无常损失。',
        '两条链的池子相互独立，价格由各自储备决定。',
      ],
      en: [
        'Deposit both assets into LGNS/DAI to receive LP tokens and trading fees.',
        'Price moves change the asset ratio, creating impermanent loss.',
        'The two chains’ pools are independent; each price comes from its own reserves.',
      ],
    },
    risks: {
      zh: ['LGNS 单边下跌时，LP 会持续换成下跌资产。', 'Anubis 主池深度约 1,700 万 DAI，大额退出冲击明显。', '跨链价差 4 倍以上，说明两条链之间缺少有效套利或兑付通道。'],
      en: ['In a sustained LGNS decline, the LP keeps converting into the falling asset.', 'Anubis pool depth is about $17M; large exits move price.', 'A 4x+ cross-chain gap implies ineffective arbitrage or redemption routes.'],
    },
    evidence: [
      { label: { zh: 'Anubis 主池', en: 'Anubis pool' }, value: CONTRACTS.pairPrimary.address, href: `https://browser.anubispace.org/address/${CONTRACTS.pairPrimary.address}` },
      { label: { zh: 'Polygon 主池', en: 'Polygon pool' }, value: '0x882df4B0fB50a229C3B4124EB18c759911485bFb', href: 'https://polygonscan.com/address/0x882df4B0fB50a229C3B4124EB18c759911485bFb' },
    ],
  },
]

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id)
