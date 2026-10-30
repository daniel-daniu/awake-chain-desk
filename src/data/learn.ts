export interface Bi {
  zh: string
  en: string
}

/** 区块链基础：四个必须先懂的概念 */
export const BASICS: { n: string; title: Bi; lead: Bi; points: Bi[] }[] = [
  {
    n: '01',
    title: { zh: '区块链 = 一本公开的账本', en: 'A blockchain is a public ledger' },
    lead: {
      zh: '链上没有“账户余额存在某个服务器里”这回事，只有一条条转账记录。任何人都能查到每一笔，但没有人能偷偷改掉历史。',
      en: 'There is no server holding your balance — only a list of transfers. Anyone can read every entry, and nobody can quietly rewrite history.',
    },
    points: [
      {
        zh: '记录被打包成“区块”，一个接一个串起来，所以叫区块链。',
        en: 'Records are packed into blocks, chained one after another — hence the name.',
      },
      {
        zh: '写进区块后就不可撤销。转错地址，没有人能帮你退回。',
        en: 'Once written into a block it is final. Send to the wrong address and nobody can reverse it.',
      },
    ],
  },
  {
    n: '02',
    title: { zh: '地址 = 账号，私钥 = 密码', en: 'Address = account, private key = password' },
    lead: {
      zh: '地址是一串 0x 开头的字符，可以公开给别人收款。私钥（或助记词）等于密码，谁拿到谁就能转走资产。',
      en: 'An address is the 0x… string you share to receive funds. The private key (or seed phrase) is the password — whoever holds it controls the funds.',
    },
    points: [
      {
        zh: '本站只读取公开的链上数据，不连接钱包、不请求签名、不发起任何交易。',
        en: 'This site only reads public on-chain data. It does not connect a wallet, request signatures, or send transactions.',
      },
      {
        zh: '任何时候有人要你的助记词，都是诈骗。没有例外。',
        en: 'Anyone asking for your seed phrase is scamming you. No exceptions.',
      },
    ],
  },
  {
    n: '03',
    title: { zh: '代币 = 合约里的一张余额表', en: 'A token is a balance table inside a contract' },
    lead: {
      zh: 'ERC-20 代币本身不是“币”，而是某个智能合约里记录“谁有多少”的一张表。转账就是调用合约改这张表。',
      en: 'An ERC-20 token is not a coin — it is a table inside a smart contract recording who holds how much. A transfer just edits that table.',
    },
    points: [
      {
        zh: '同名代币可以有无数个。认合约地址，不要认名字和图标。',
        en: 'Anyone can create a token with the same name. Trust the contract address, never the name or logo.',
      },
      {
        zh: '本站两条链上的 LGNS 就是两个不同合约，价格也不一样。',
        en: 'The LGNS on the two chains here are two different contracts, and they trade at different prices.',
      },
    ],
  },
  {
    n: '04',
    title: { zh: 'Gas = 写账本的手续费', en: 'Gas is the fee for writing to the ledger' },
    lead: {
      zh: '每次在链上做动作（转账、质押、领利息）都要付一笔手续费给网络。费用 = Gas 用量 × Gas 价格。',
      en: 'Every on-chain action — transfer, stake, claim — pays a fee to the network. Fee = gas used × gas price.',
    },
    points: [
      {
        zh: '普通转账固定约 21,000 Gas；调用合约通常要 10 万以上。',
        en: 'A plain transfer uses about 21,000 gas; calling a contract usually needs 100,000 or more.',
      },
      {
        zh: 'Gas 价格单位是 gwei（1 gwei = 0.000000001 个原生币）。Anubis 用 DAI 付，Polygon 用 POL 付。',
        en: 'Gas price is quoted in gwei (1 gwei = 0.000000001 native coin). Anubis pays in DAI, Polygon in POL.',
      },
    ],
  },
]

/** 本站指标怎么读 */
export const METRICS: { name: Bi; reads: Bi; watch: Bi }[] = [
  {
    name: { zh: '链上价格', en: 'On-chain price' },
    reads: {
      zh: '交易池里 DAI 的数量 ÷ LGNS 的数量，也就是“池子现在愿意用什么价成交”。',
      en: 'DAI in the pool divided by LGNS in the pool — the price the pool will trade at right now.',
    },
    watch: {
      zh: '这是小额成交价。大额卖出会被滑点和交易税再削一层，实际到手更低。',
      en: 'This is the small-trade price. A large sell also pays slippage and transfer tax, so you receive less.',
    },
  },
  {
    name: { zh: '跨链价差', en: 'Cross-chain spread' },
    reads: {
      zh: '两条链上 LGNS 报价的倍数差。',
      en: 'How many times higher one chain quotes LGNS versus the other.',
    },
    watch: {
      zh: '两条链是两个不同合约，中间没有公开的自由兑换通道。价差大不等于能搬砖套利。',
      en: 'Two different contracts with no public free bridge between them. A wide gap is not a free arbitrage.',
    },
  },
  {
    name: { zh: '总供应', en: 'Total supply' },
    reads: { zh: '合约里一共存在多少枚代币。', en: 'How many tokens exist in the contract in total.' },
    watch: {
      zh: '这个数字变大就是增发，每个持有者的占比都会被稀释。',
      en: 'When this number grows, new tokens are being issued and every holder is diluted.',
    },
  },
  {
    name: { zh: '24h 增发', en: '24h issuance' },
    reads: { zh: '过去 24 小时总供应增加了多少。', en: 'How much total supply grew over the past 24 hours.' },
    watch: {
      zh: '这是“通胀速度”，不是你的收益。增发 2%/天意味着一年增发数倍。',
      en: 'This is the inflation rate, not your yield. 2% a day compounds into multiples per year.',
    },
  },
  {
    name: { zh: '持仓集中度', en: 'Holder concentration' },
    reads: { zh: '第一大户持有总供应的百分比。', en: 'The share of supply held by the largest address.' },
    watch: {
      zh: '要先看这个地址是个人还是质押/国库合约。本站同时给出“剔除合约后”的数字。',
      en: 'Check whether that address is a person or a staking/treasury contract. This site also shows the figure with contracts excluded.',
    },
  },
  {
    name: { zh: '池内 DAI / 流动性', en: 'Pool DAI / liquidity' },
    reads: { zh: '池子里有多少 DAI 可以用来接卖单。', en: 'How much DAI sits in the pool to absorb sells.' },
    watch: {
      zh: '它决定了“你能卖多少而不把价格砸下去”。池子越浅，冲击越大。',
      en: 'It decides how much you can sell before pushing the price down. Thinner pools mean bigger impact.',
    },
  },
  {
    name: { zh: '质押 index', en: 'Staking index' },
    reads: {
      zh: '每 1 份质押凭证对应多少 LGNS。它随时间上涨，涨的部分就是利息。',
      en: 'How many LGNS one staking unit is worth. It rises over time, and the increase is the interest.',
    },
    watch: {
      zh: '看的是“涨得多快”，不是绝对值。本站用 24 小时前后两次读数算日化。',
      en: 'What matters is the growth rate, not the absolute value. This site reads it 24 hours apart to get a daily rate.',
    },
  },
  {
    name: { zh: '年化（复利）', en: 'Annualized (compound)' },
    reads: { zh: '把当前日化速度按每天复投推演一年。', en: 'Compounding the current daily rate for a full year.' },
    watch: {
      zh: '这是“代币数量”的增长，不含币价下跌、交易税和滑点。',
      en: 'This is growth in token count only. It ignores price decline, transfer tax and slippage.',
    },
  },
  {
    name: { zh: 'claimInterest 样本', en: 'claimInterest sample' },
    reads: {
      zh: '从质押合约最近的转出记录里，数出多少笔是“领利息”，以及单笔金额的中位数。',
      en: 'From recent outgoing transfers of the staking contract, how many were interest claims and what the median amount was.',
    },
    watch: {
      zh: '只是样本，不是全天统计。样本窗口很短，会随刷新变化，不能当收益率。',
      en: 'A sample, not a full-day count. The window is short, values change between refreshes, and it is not a yield rate.',
    },
  },
  {
    name: { zh: '区块奖励', en: 'Block reward' },
    reads: { zh: '每出一个区块，网络额外发给验证者多少币。', en: 'Extra coins the network pays validators per block.' },
    watch: {
      zh: '为 0 表示没有区块补贴，验证者只靠手续费，说明这条链不靠增发养节点。',
      en: 'Zero means no block subsidy — validators live on fees alone, so the chain is not minting to pay them.',
    },
  },
  {
    name: { zh: '每日手续费', en: 'Daily fees' },
    reads: { zh: '全网一天总共花掉多少手续费。', en: 'Total fees paid across the network in a day.' },
    watch: {
      zh: '这是“真实使用量”的代理指标。手续费持续下降，通常意味着活动在减少。',
      en: 'A proxy for real usage. Falling fees usually mean activity is drying up.',
    },
  },
  {
    name: { zh: '死地址余额', en: 'Dead-address balance' },
    reads: { zh: '转到 0x…dEaD 的代币数量，这些币再也拿不回来。', en: 'Tokens sent to 0x…dEaD, which can never be recovered.' },
    watch: {
      zh: '只能说明“被销毁了多少”，不能说明是谁销毁的、为了什么。',
      en: 'It only shows how much was burned — not who burned it or why.',
    },
  },
  {
    name: { zh: '风险评分', en: 'Risk score' },
    reads: { zh: '把价差、集中度、流动性、资金覆盖率等指标加权成一个 0–100 的数。', en: 'A 0–100 number weighting spread, concentration, liquidity and reserve coverage.' },
    watch: {
      zh: '这是本站的启发式模型，不是评级机构结论，也不能替代你自己的判断。',
      en: 'A heuristic built by this site — not a rating agency opinion, and no substitute for your own judgment.',
    },
  },
]

/** 三个最容易误读的地方 */
export const MISREADS: { title: Bi; body: Bi }[] = [
  {
    title: { zh: '年化 ≠ 你能拿到的钱', en: 'APY is not money in your pocket' },
    body: {
      zh: '年化是按“代币数量”算的。如果一年后代币数量涨了 50%，但币价跌了 80%，你以美元计仍然是亏的。再加上卖出时的 5% 交易税和滑点，实际到手会更少。',
      en: 'APY counts tokens, not dollars. If your token count grows 50% while the price falls 80%, you are still down in dollar terms — and the 5% sell tax plus slippage takes more.',
    },
  },
  {
    title: { zh: '链上价格 ≠ 卖出价', en: 'On-chain price is not your exit price' },
    body: {
      zh: '页面上的价格是池子对小额成交的报价。卖出时先扣交易税，再按池子深度产生滑点。池子越浅、卖得越多，实际成交价越低。',
      en: 'The price shown is what the pool quotes for a small trade. A real sell pays the transfer tax first, then slippage based on pool depth. Thinner pool, larger sell, worse price.',
    },
  },
  {
    title: { zh: '未开源 ≠ 一定是骗局，但等于无法验证', en: 'Unverified is not proof of fraud — but it means unverifiable' },
    body: {
      zh: '合约没开源，就看不出利率、解锁、管理员权限是怎么写的。所有“规则”都只能听人说，无法自己核对。本站遇到这种情况会直接写“链上不可读”，不替它编数字。',
      en: 'Without source code you cannot see how rates, unlocks or admin rights are implemented. Every “rule” is hearsay. This site marks such data as unreadable instead of inventing numbers.',
    },
  },
]

/** 名词表 */
export const GLOSSARY: { term: Bi; desc: Bi }[] = [
  {
    term: { zh: '区块链', en: 'Blockchain' },
    desc: { zh: '一本公开、只可追加、不可篡改的账本，由许多节点共同维护。', en: 'A public, append-only ledger maintained by many nodes.' },
  },
  {
    term: { zh: '区块', en: 'Block' },
    desc: { zh: '一段时间内的交易被打包成的一个单元，按顺序连接成链。', en: 'A batch of transactions linked to the previous one in order.' },
  },
  {
    term: { zh: '交易哈希', en: 'Transaction hash' },
    desc: { zh: '每笔交易的唯一编号（0x 开头的一长串），可以用来在区块浏览器上查这笔交易。', en: 'The unique ID of a transaction, used to look it up in an explorer.' },
  },
  {
    term: { zh: '确认数', en: 'Confirmations' },
    desc: { zh: '一笔交易后面又出了多少个区块。确认越多，被回滚的可能性越低。', en: 'How many blocks have been built after a transaction. More confirmations, less chance of reversal.' },
  },
  {
    term: { zh: '地址', en: 'Address' },
    desc: { zh: '链上的账号，0x 开头 40 位字符，可以公开。', en: 'An on-chain account: a 40-character 0x string you can share publicly.' },
  },
  {
    term: { zh: '私钥 / 助记词', en: 'Private key / seed phrase' },
    desc: { zh: '控制地址的密码。泄露等于资产被转走，任何网站索要都是诈骗。', en: 'The password controlling an address. Leaking it means losing the funds; any site asking for it is a scam.' },
  },
  {
    term: { zh: '智能合约', en: 'Smart contract' },
    desc: { zh: '部署在链上、自动执行的程序。代币、质押、交易池都是合约。', en: 'A program deployed on-chain that runs automatically. Tokens, staking and pools are all contracts.' },
  },
  {
    term: { zh: 'ERC-20', en: 'ERC-20' },
    desc: { zh: '最常见的代币标准，规定了转账、余额、授权等基本接口。', en: 'The most common token standard defining transfer, balance and approval functions.' },
  },
  {
    term: { zh: '代理合约', en: 'Proxy contract' },
    desc: { zh: '把逻辑和数据分开存的合约，管理员可以替换逻辑。EIP-1967 是常见实现。升级权限在谁手上，是核心风险点。', en: 'A contract that separates logic from storage so an admin can swap the logic. EIP-1967 is a common pattern; who holds upgrade rights is a core risk.' },
  },
  {
    term: { zh: '未开源 / 已验证', en: 'Unverified / verified' },
    desc: { zh: '“已验证”指源码被提交到区块浏览器、可与链上字节码比对。未开源就只能看行为，不能看规则。', en: 'Verified means the source is published and matches the bytecode. Unverified means you can only observe behavior, not read the rules.' },
  },
  {
    term: { zh: 'Gas', en: 'Gas' },
    desc: { zh: '执行链上操作消耗的计算量单位，最终折算成手续费。', en: 'The unit of computation an on-chain action consumes, priced as a fee.' },
  },
  {
    term: { zh: 'gwei', en: 'gwei' },
    desc: { zh: 'Gas 价格的常用单位，1 gwei = 0.000000001 个原生币。', en: 'A unit for gas price: 1 gwei = 0.000000001 native coin.' },
  },
  {
    term: { zh: '原生币', en: 'Native token' },
    desc: { zh: '某条链用来付手续费的币。Anubis 用 DAI，Polygon 用 POL。', en: 'The coin a chain uses to pay fees: DAI on Anubis, POL on Polygon.' },
  },
  {
    term: { zh: 'DAI', en: 'DAI' },
    desc: { zh: '一种与美元挂钩的稳定币，1 DAI 目标价 1 美元。', en: 'A stablecoin targeting $1 per DAI.' },
  },
  {
    term: { zh: '流动性池 / LP', en: 'Liquidity pool / LP' },
    desc: { zh: '两种代币按比例放进合约里，供别人兑换。池子里的钱越多，能承接的卖单越大。', en: 'Two tokens deposited in a contract for others to trade against. More depth means larger sells are absorbed.' },
  },
  {
    term: { zh: 'DEX', en: 'DEX' },
    desc: { zh: '去中心化交易所，用池子自动定价，没有撮合的人。', en: 'A decentralized exchange priced by pools, with no order book or intermediary.' },
  },
  {
    term: { zh: 'TVL', en: 'TVL' },
    desc: { zh: 'Total Value Locked，锁在合约里的资产总价值，常用来衡量规模。', en: 'Total value locked in contracts, often used as a size metric.' },
  },
  {
    term: { zh: '流通量 / 总供应', en: 'Circulating / total supply' },
    desc: { zh: '总供应是合约里一共多少枚；流通量是其中实际在市场里流通的部分。两者差距越大，潜在抛压越大。', en: 'Total supply is everything minted; circulating supply is what actually trades. A large gap implies potential sell pressure.' },
  },
  {
    term: { zh: '增发 / 通胀', en: 'Issuance / inflation' },
    desc: { zh: '新代币被创造出来，持有者的占比被稀释。增发速度决定稀释速度。', en: 'New tokens are minted, diluting every holder. The issuance rate sets the dilution rate.' },
  },
  {
    term: { zh: '市值', en: 'Market cap' },
    desc: { zh: '总供应 × 价格。注意：用总供应算会把还没流通的部分也算进去。', en: 'Supply × price. Note that using total supply counts tokens that are not circulating.' },
  },
  {
    term: { zh: '持仓集中度', en: 'Holder concentration' },
    desc: { zh: '少数地址控制了多少供应。集中度越高，单个地址的动作对价格影响越大。', en: 'How much supply a few addresses control. Higher concentration means one address can move the price.' },
  },
  {
    term: { zh: '滑点', en: 'Slippage' },
    desc: { zh: '因为池子深度有限，实际成交价与你看到的价格之间的差距。', en: 'The gap between the quoted price and your actual fill, caused by limited pool depth.' },
  },
  {
    term: { zh: '交易税', en: 'Transfer tax' },
    desc: { zh: '代币合约在转账时自动扣走一部分，通常进项目方地址或池子。本站直接读合约的 feeRatio。', en: 'A cut the token contract takes on each transfer, usually to a project address or the pool. This site reads feeRatio from the contract.' },
  },
  {
    term: { zh: 'APR / APY', en: 'APR / APY' },
    desc: { zh: 'APR 是单利，APY 是把收益再投进去的复利。同样的日化，APY 永远比 APR 高。', en: 'APR is simple interest; APY compounds. For the same daily rate, APY is always higher.' },
  },
  {
    term: { zh: '质押 / 锁仓', en: 'Staking / lock-up' },
    desc: { zh: '把代币放进合约换取收益。锁仓意味着约定期限内取不出来，或取出要付代价。', en: 'Depositing tokens for yield. A lock-up means you cannot withdraw for a period, or pay a penalty.' },
  },
  {
    term: { zh: '债券', en: 'Bond' },
    desc: { zh: '用折价买入、到期解锁的代币凭证。折价越大，通常意味着市场越不看好。', en: 'A token claim bought at a discount and unlocked later. A bigger discount usually signals weaker demand.' },
  },
  {
    term: { zh: '销毁地址', en: 'Burn address' },
    desc: { zh: '没有私钥的地址（如 0x…dEaD），转进去的币永远取不出来。', en: 'An address with no private key (like 0x…dEaD). Anything sent there is gone forever.' },
  },
  {
    term: { zh: '跨链桥', en: 'Bridge' },
    desc: { zh: '把资产从一条链搬到另一条链的通道。桥由谁控制、是否有足额储备，是主要风险。', en: 'A route moving assets between chains. Who controls it and whether reserves are sufficient are the main risks.' },
  },
  {
    term: { zh: 'RPC', en: 'RPC' },
    desc: { zh: '程序读取链上数据的接口。本站的价格、供应、index 都是通过 RPC 直接读合约得到的。', en: 'The interface programs use to read chain data. Prices, supply and index here are read from contracts via RPC.' },
  },
  {
    term: { zh: '区块浏览器', en: 'Block explorer' },
    desc: { zh: '用网页查看区块、交易、地址、合约的工具，本站数据可与它逐条对照。', en: 'A website for inspecting blocks, transactions, addresses and contracts. You can cross-check every number here against it.' },
  },
]
