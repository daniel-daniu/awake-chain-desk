import type { ReactNode } from 'react'
import { useEcosystem } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { DAPP_REGISTRY_URL, HELIX } from '../config/site'
import { fmtInt, fmtPct, fmtPrice, fmtToken, shortAddr } from '../lib/format'
import { Address, ErrorView, LoadingView, PageIntro, Pill, ProgressBar, SectionHeader, SourceStrip, UpdatedAt, WarningList } from '../components/ui'
import { Icon } from '../components/Icons'

function progress(cap: number | null, remaining: number | null) {
  if (cap === null || remaining === null || cap <= 0) return null
  return Math.max(0, Math.min(100, ((cap - remaining) / cap) * 100))
}

function QuotaCard({
  title,
  cap,
  remaining,
  unit,
  expected,
}: {
  title: ReactNode
  cap: number | null
  remaining: number | null
  unit: string
  expected: ReactNode
}) {
  const { lang, pick } = useI18n()
  const used = progress(cap, remaining)
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">{title}</div>
          <div className="num mt-2 text-[20px] font-semibold text-ink">{fmtPct(used, lang, 2)}</div>
        </div>
        <Pill tone="warn">{pick({ zh: '当前额度', en: 'Current quota' })}</Pill>
      </div>
      <ProgressBar value={used} tone="accent" />
      <div className="mt-3 flex justify-between text-[10px] text-muted">
        <span>{pick({ zh: '已用', en: 'Used' })}</span>
        <span className="num text-ink">
          {cap !== null && remaining !== null ? fmtToken(cap - remaining, lang, unit) : 'N/A'}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{pick({ zh: '上限', en: 'Cap' })}</span>
        <span className="num text-ink">{fmtToken(cap, lang, unit)}</span>
      </div>
      <p className="mt-3 border-t border-line pt-3 text-[9px] leading-relaxed text-muted">{expected}</p>
    </div>
  )
}

export default function Ecosystem() {
  const { lang, pick } = useI18n()
  const query = useEcosystem()
  const data = query.data?.data

  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView rows={8} />
      </div>
    )
  }
  if (query.isError || !data) {
    return (
      <div className="container-page py-10">
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const aiDai = data.pairs.find((pair) => pair.name.includes('DAI'))
  const helixContracts = data.contracts.filter((contract) =>
    ['ailgns', 'helix-ledger', 'helix-lens', 'helix-nft'].includes(contract.key),
  )

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow="AWAKE HELIX · ANUBIS CHAIN"
        title="AiLGNS / HELIX"
        desc={pick({
          zh: '先分开理解“公开机制”和“链上当前状态”：前者解释协议如何设计，后者才证明合约现在返回了什么。',
          en: 'Separate public mechanics from the current on-chain state: the former explains the design, while the latter proves what the contracts return right now.',
        })}
        action={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <UpdatedAt
              timestamp={query.data?.retrievedAt}
              partial={data.warnings.length > 0}
              maxAgeMinutes={15}
              onRefresh={() => void query.refetch()}
              refreshing={query.isFetching}
            />
            <SourceStrip sources={query.data?.sources ?? []} />
          </div>
        }
      />
      <WarningList items={data.warnings} />

      <section className="mt-7 grid gap-3 md:grid-cols-3">
        {[
          {
            label: 'AiLGNS',
            title: { zh: '协议代币，不是 LGNS 升级', en: 'A protocol token, not an LGNS upgrade' },
            body: {
              zh: '它是与 LGNS 不同的合约。公开资料把 HELIX 视为其使用场景；本站只把链上供应、持有和池子数据当作当前事实。',
              en: 'It is a different contract from LGNS. Public materials describe HELIX as its mechanism; this site treats supply, holders and pools as current chain facts only.',
            },
          },
          {
            label: 'HELIX',
            title: { zh: 'Power 与每日排放机制', en: 'A Power and daily-emission mechanism' },
            body: {
              zh: 'HELIX 不是新链。它用 DAI、LGNS 或 AiLGNS 对应的 Power 参与每日结算和排放，当前值从账本与额度合约读取。',
              en: 'HELIX is not a new chain. DAI, LGNS or AiLGNS-related Power participates in daily settlement and emissions; current values come from the ledger and quota contracts.',
            },
          },
          {
            label: pick({ zh: '与 LGNS 的关系', en: 'Relation to LGNS' }),
            title: { zh: '输入资产与独立排放并存', en: 'An input asset with a separate emission system' },
            body: {
              zh: 'LGNS 可以作为 HELIX 的参与或销毁资产，但 HELIX 不自动改变 LGNS 自身的增发、价格或兑付风险。',
              en: 'LGNS can be an input or burn asset for HELIX, but HELIX does not automatically change LGNS issuance, price or redemption risk.',
            },
          },
        ].map((item) => (
          <div key={item.label} className="card card-pad">
            <Pill tone="accent">{item.label}</Pill>
            <h2 className="mt-4 text-[13px] font-semibold leading-snug">{pick(item.title)}</h2>
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">{pick(item.body)}</p>
          </div>
        ))}
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '链上当前概览', en: 'Current on-chain overview' })}
          desc={pick({ zh: '合约返回值和浏览器索引分开展示。没有读到时不使用演示值。', en: 'Contract returns and explorer indexes are shown separately. No demo values are used when data is missing.' })}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="card card-pad">
            <div className="label">AiLGNS {pick({ zh: '总供应', en: 'supply' })}</div>
            <div className="num mt-2 text-[21px] font-semibold">{fmtToken(data.aiToken?.totalSupply, lang, 'AiLGNS')}</div>
            <div className="mt-1 text-[9px] text-muted">{data.aiToken?.address ? shortAddr(data.aiToken.address, 7, 5) : 'N/A'}</div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: 'AiLGNS 持有地址', en: 'AiLGNS holders' })}</div>
            <div className="num mt-2 text-[21px] font-semibold">{fmtInt(data.aiToken?.holders, lang)}</div>
            <div className="mt-1 text-[9px] text-muted">{pick({ zh: '地址数不等于用户数', en: 'Addresses are not users' })}</div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: '第一大地址占比', en: 'Top holder share' })}</div>
            <div className="num mt-2 text-[21px] font-semibold text-warn">{fmtPct(data.aiToken?.top1Pct, lang, 2)}</div>
            <div className="mt-1 text-[9px] text-muted">{shortAddr(data.aiToken?.top1Address, 7, 5)}</div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: 'LGNS 死地址余额', en: 'LGNS at dead address' })}</div>
            <div className="num mt-2 text-[21px] font-semibold">{fmtToken(data.lgnsDeadBalance, lang, 'LGNS')}</div>
            <div className="mt-1 text-[9px] text-muted">{pick({ zh: '不能全部归因于 HELIX', en: 'Not all attributable to HELIX' })}</div>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '今日额度', en: 'Current day quotas' })}
          desc={pick({ zh: '额度由合约返回；进度为“上限减剩余”。', en: 'Quotas come from the contracts; progress is cap minus remaining.' })}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuotaCard
            title={pick({ zh: 'DAI 入金额度', en: 'DAI deposit quota' })}
            cap={data.quotas.daiDepositCap}
            remaining={data.quotas.daiDepositRemaining}
            unit="DAI"
            expected={pick({ zh: '反映当前合约可接受的 DAI 入金上限。', en: 'The current DAI deposit ceiling readable from the contract.' })}
          />
          <QuotaCard
            title={pick({ zh: 'DAI 产品算力', en: 'DAI product Power' })}
            cap={data.quotas.daiPowerCap}
            remaining={data.quotas.daiPowerRemaining}
            unit="Power"
            expected={pick({ zh: '每日 DAI 路径对应的 Power 预算。', en: 'Daily Power budget associated with the DAI path.' })}
          />
          <QuotaCard
            title={pick({ zh: 'LGNS 销毁算力', en: 'LGNS burn Power' })}
            cap={data.quotas.lgnsBurnPowerCap}
            remaining={data.quotas.lgnsBurnPowerRemaining}
            unit="Power"
            expected={pick({ zh: '链上合约当前的每日预算与剩余值。', en: 'The contract’s current daily budget and remaining amount.' })}
          />
          <QuotaCard
            title={pick({ zh: 'AiLGNS 销毁算力', en: 'AiLGNS burn Power' })}
            cap={data.quotas.aiBurnPowerCap}
            remaining={data.quotas.aiBurnPowerRemaining}
            unit="Power"
            expected={pick({ zh: 'AiLGNS 销毁路径的每日 Power 预算。', en: 'Daily Power budget for the AiLGNS burn path.' })}
          />
          <div className="card card-pad">
            <div className="label">AiLGNS / DAI</div>
            <div className="num mt-2 text-[21px] font-semibold">{fmtPrice(aiDai?.priceDaiPerAi, lang)}</div>
            <div className="mt-1 text-[9px] text-muted">{pick({ zh: '由主池储备反推', en: 'Derived from primary pool reserves' })}</div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: '协议注册状态', en: 'Registry state' })}</div>
            <div className="mt-2 flex flex-col items-start gap-1.5">
              <Pill tone={data.aiToken?.verified ? 'ok' : 'warn'}>
                {data.aiToken?.verified ? pick({ zh: '浏览器已开源', en: 'Verified in explorer' }) : pick({ zh: '浏览器未开源', en: 'Unverified in explorer' })}
              </Pill>
              {data.aiToken?.proxyType && <span className="text-[9.5px] text-muted">{data.aiToken.proxyType} proxy</span>}
            </div>
            <a href={DAPP_REGISTRY_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-[10px] text-accent hover:underline">
              {pick({ zh: '查看官方 DApp 合约目录', en: 'Open official DApp registry' })} <Icon name="external" size={11} />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader title={pick({ zh: '官方 DApp 合约目录', en: 'Official DApp contract registry' })} desc={pick({ zh: '地址来自官方入口；数据从链上重新读取，验证状态以浏览器为准。', en: 'Addresses come from the official entry point; data is re-read on-chain and verification follows the explorer.' })} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{pick({ zh: '角色', en: 'Role' })}</th>
                  <th>{pick({ zh: '地址', en: 'Address' })}</th>
                  <th>{pick({ zh: '开源状态', en: 'Verification' })}</th>
                  <th>{pick({ zh: '浏览器', en: 'Explorer' })}</th>
                </tr>
              </thead>
              <tbody>
                {helixContracts.map((contract) => (
                  <tr key={contract.key}>
                    <td>
                      <div className="text-[11px] font-medium text-ink">{pick(contract.label)}</div>
                    </td>
                    <td><Address value={contract.address} href={contract.explorerUrl} head={8} tail={6} /></td>
                    <td>
                      <Pill tone={contract.verified ? 'ok' : contract.verified === false ? 'warn' : 'neutral'}>
                        {contract.verified === null
                          ? pick({ zh: '未知', en: 'Unknown' })
                          : contract.verified
                            ? pick({ zh: '已开源', en: 'Verified' })
                            : pick({ zh: '未开源', en: 'Unverified' })}
                      </Pill>
                    </td>
                    <td><a href={contract.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{pick({ zh: '打开', en: 'Open' })}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader title={pick({ zh: '参与前核对', en: 'Before participating' })} desc={pick({ zh: '这些是核对顺序，不是买卖建议。', en: 'This is a verification sequence, not trading advice.' })} />
        <div className="card divide-y divide-line">
          {[
            { title: { zh: '合约地址是否来自官方目录？', en: 'Does the address come from the official registry?' }, body: { zh: '名称和图标不构成身份证明。把地址与官方目录、浏览器实现地址一起核对。', en: 'Names and icons are not proof of identity. Compare the address with the registry and explorer implementation.' } },
            { title: { zh: '谁能升级合约？', en: 'Who can upgrade the contract?' }, body: { zh: '代理合约的实现地址、管理员和验证状态决定你能否独立核对规则。', en: 'The implementation, admin and verification state determine whether you can independently verify rules.' } },
            { title: { zh: '收益来自哪里？', en: 'Where does yield come from?' }, body: { zh: '查看 AiLGNS 排放、额度消耗、销毁和池子价格，而不是只比较一个年化数字。', en: 'Inspect AiLGNS emission, quota consumption, burns and pool prices instead of comparing one APY number.' } },
            { title: { zh: '退出时会发生什么？', en: 'What happens when you exit?' }, body: { zh: '核对 Power/SFT 仓位、额度、领取条件、税和滑点，并检查当前池深。', en: 'Check Power/NFT positions, quotas, claim conditions, tax and slippage, and inspect current pool depth.' } },
          ].map((item, index) => (
            <div key={item.title.en} className="flex gap-3 px-5 py-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accentsoft text-[10px] font-semibold text-accent">{index + 1}</span>
              <div>
                <div className="text-[12px] font-semibold">{pick(item.title)}</div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">{pick(item.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
