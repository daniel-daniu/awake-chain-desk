import { useI18n } from '../i18n'
import { useEcosystem } from '../lib/api'
import type { EcosystemToken } from '../types'
import { fmtInt, fmtNum, fmtPct, shortAddr } from '../lib/format'
import { CopyButton, ExternalLink, Pill, SectionHeader, UpdatedAt } from '../components/ui'
import { IconAlert, IconArrow, IconInfo } from '../components/Icons'

const EXPLORER = 'https://browser.anubispace.org'

function TokenCard({
  token,
  title,
  desc,
  color,
  supplyLabel,
}: {
  token?: EcosystemToken
  title: string
  desc: string
  color: string
  supplyLabel: string
}) {
  const { lang, pick } = useI18n()
  if (!token) return <div className="card card-pad h-[260px] skeleton" />
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="text-[13px] font-semibold text-ink">{title}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted">{token.name}</div>
        </div>
        <Pill tone={token.verified ? 'ok' : 'warn'}>
          {token.verified ? pick({ zh: '已开源', en: 'Verified' }) : pick({ zh: '未开源', en: 'Unverified' })}
        </Pill>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">{desc}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div>
          <div className="label">{supplyLabel}</div>
          <div className="num mt-0.5 text-[15px] font-semibold text-ink">
            {token.type === 'ERC-721' ? fmtInt(token.supply, lang) : fmtInt(token.supply, lang)}
          </div>
        </div>
        <div>
          <div className="label">{pick({ zh: '持有地址', en: 'Holders' })}</div>
          <div className="num mt-0.5 text-[15px] font-semibold text-ink">{fmtInt(token.holders, lang)}</div>
        </div>
        <div>
          <div className="label">{pick({ zh: '累计转账', en: 'Transfers' })}</div>
          <div className="num mt-0.5 text-[15px] font-semibold text-ink">{fmtInt(token.transfers, lang)}</div>
        </div>
        <div>
          <div className="label">{pick({ zh: '头部地址占比', en: 'Top holder share' })}</div>
          <div className={`num mt-0.5 text-[15px] font-semibold ${token.topHolderShare > 50 ? 'text-danger' : 'text-ink'}`}>
            {fmtPct(token.topHolderShare / 100, lang, 2)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
        <span>
          {pick({ zh: '最近 50 笔中 24h 内', en: 'In 24h of latest 50' })}：{token.in24h}
        </span>
        <span className="mono">{shortAddr(token.address, 6, 4)}</span>
      </div>
    </div>
  )
}

export default function Ecosystem() {
  const { t, lang, pick } = useI18n()
  const q = useEcosystem()
  const d = q.data

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">
            AiLGNS &amp; HELIX
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            {pick({
              zh: 'AiLGNS 的 AI 服务门户说明，以及 HELIX 的 LGNS 销毁算力规则；数据来自 Anubis 链上同名合约与转账记录。',
              en: 'AiLGNS AI service portal notes and HELIX LGNS burn-hashpower rules; data comes from same-name contracts and transfers on Anubis.',
            })}
          </p>
        </div>
        <UpdatedAt ts={d?.ts} stale={q.data ? false : undefined} />
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#F1E2C8] bg-warn-soft px-4 py-3 text-[12px] leading-relaxed text-[#7A4A0C]">
        <span className="mt-0.5 shrink-0">
          <IconAlert size={15} />
        </span>
        {pick({
          zh: '官方尚未公示 AiLGNS / HELIX 主合约地址。以下为 Anubis 链上同名、活跃度最高的合约，按名称与转账活动筛选，仅供链上观察，不构成官方认定。合约均未开源。',
          en: 'No official AiLGNS / HELIX contract addresses have been published. The contracts below are the most active same-name contracts on Anubis, selected by name and transfer activity. They are for on-chain observation only and are not an official confirmation. All are unverified.',
        })}
      </div>

      <section className="mt-8">
        <SectionHeader
          title={pick({ zh: '先用一句话说清楚', en: 'In one sentence each' })}
          desc={pick({
            zh: '如果你只有一分钟，看这三张卡就够了。',
            en: 'If you only have a minute, these three cards are enough.',
          })}
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#7C5CE6]" />
              <span className="text-[13px] font-semibold text-ink">AiLGNS</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
              {pick({
                zh: '按公开说法，它是一个 AI 服务入口：用不同模型做文案、绘图、规划，用链上资产付费。AiLGNS 是这个服务对应的代币，和 LGNS 是两个不同合约，不能互换、也不构成 LGNS 的升级。',
                en: 'Publicly described as an AI service portal: use different models for copywriting, images and planning, paying with on-chain assets. AiLGNS is the token for that service — a different contract from LGNS, not interchangeable and not an upgrade of LGNS.',
              })}
            </p>
          </div>
          <div className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#15803D]" />
              <span className="text-[13px] font-semibold text-ink">HELIX</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
              {pick({
                zh: '它不是新链，也不是新币，而是一套规则：把 LGNS 销毁，换成功率凭证（Production NFT 与 HelixPower），再按规则分配权益。7 天一个周期，单钱包每周期一次，单次上限 500 LGNS。',
                en: 'Not a new chain and not a new coin, but a rule set: burn LGNS to obtain hashpower certificates (Production NFT and HelixPower), then allocate benefits by rule. A 7-day epoch, one burn per wallet per epoch, max 500 LGNS each time.',
              })}
            </p>
          </div>
          <div className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-[13px] font-semibold text-ink">{pick({ zh: '和 LGNS 的关系', en: 'How they relate to LGNS' })}</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
              {pick({
                zh: 'AiLGNS 是与 LGNS 并列的另一个代币；HELIX 是 LGNS 的一个使用场景，会减少 LGNS 的流通量。两者都不改变 LGNS 的增发规则，所以它们的出现不等于 LGNS 的风险下降。',
                en: 'AiLGNS is a separate token alongside LGNS; HELIX is a use case for LGNS that removes some supply from circulation. Neither changes how LGNS is issued, so their existence does not lower LGNS risk.',
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader
          title={pick({ zh: '你该怎么看待这两个项目', en: 'How to think about these two' })}
          desc={pick({
            zh: '按顺序核对这四件事。任何一条核不清，答案就是“先不参与”。',
            en: 'Check these four in order. If any one cannot be verified, the answer is “stay out for now”.',
          })}
        />
        <div className="card divide-y divide-line">
          {[
            {
              t: { zh: '这是不是官方合约？', en: 'Is this the official contract?' },
              d: {
                zh: '官方没有公示地址，本页用的是链上同名、最活跃的合约。名字一样不等于官方，任何人都能发一个叫 AiLGNS 的代币。',
                en: 'No official address has been published; this page uses the most active same-name contract on-chain. A matching name is not proof — anyone can deploy a token called AiLGNS.',
              },
            },
            {
              t: { zh: '币在谁手里？', en: 'Who holds the supply?' },
              d: {
                zh: 'AiLGNS 的创建者地址持有 99.98%，HelixPower 持有 90.40%。这意味着价格、流动性、规则解释权都高度依赖一方，散户无法用投票或赎回制衡。',
                en: 'The AiLGNS creator holds 99.98%, and HelixPower 90.40%. Price, liquidity and rule interpretation all depend on one party, with no vote or redemption to balance it.',
              },
            },
            {
              t: { zh: '有没有人真的在用？', en: 'Is anyone actually using it?' },
              d: {
                zh: '看最近的转账活动。AiLGNS 最近 50 笔里 24 小时内 0 笔，说明近期几乎没有真实使用；HPNFT 则很活跃，两者要分开判断。',
                en: 'Look at recent transfer activity. AiLGNS had 0 of its latest 50 transfers within 24 hours, so real usage is minimal; HPNFT is active, so judge them separately.',
              },
            },
            {
              t: { zh: '销毁是真的吗？能归因吗？', en: 'Is the burn real, and can it be attributed?' },
              d: {
                zh: 'LGNS 死地址余额可以查，但里面包含所有转入的销毁，不能全部算成 HELIX 的贡献。没有公开的销毁明细，就无法证明“销毁多少换多少权益”。',
                en: 'The LGNS dead-address balance is readable, but it includes every burn ever sent there and cannot be fully credited to HELIX. Without a public burn ledger, the burn-to-benefit ratio cannot be proven.',
              },
            },
          ].map((x, i) => (
            <div key={i} className="flex gap-3 px-5 py-4">
              <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-canvas text-[11px] font-semibold text-muted">
                {i + 1}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">{pick(x.t)}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{pick(x.d)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-xl border border-line bg-white px-5 py-3 text-[11px] leading-relaxed text-muted">
          {pick({
            zh: '这四个问题不是让你去否定项目，而是让你把“听说”换成“我能自己核对”。核不清的部分，本站一律标为不可读，也不会替你补一个看起来合理的数字。',
            en: 'These questions are not meant to dismiss the project — they turn “I heard” into “I can check it myself”. Anything unverifiable is labelled unreadable here, and no plausible-looking number is invented to fill the gap.',
          })}
        </p>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="AiLGNS"
          desc={pick({
            zh: '公开资料描述：一站式 AI 服务门户，调用不同 AI 模型（文案、绘图、规划、Agent），支持链上资产付费结算，把 AI 算力消耗与链上资产结算打通。',
            en: 'Public materials describe a one-stop AI service portal: call different AI models (copywriting, image, planning, agents) and pay with on-chain assets, connecting AI compute consumption with on-chain settlement.',
          })}
        />
        <TokenCard
          token={d?.ailgns}
          title="Helix AiLGNS"
          color="#7C5CE6"
          desc={pick({
            zh: '链上同名合约。创建者地址持有 99.98% 供应，实际流通约 4,694 枚；最近 50 笔转账中 0 笔发生在 24 小时内。',
            en: 'Same-name on-chain contract. The creator holds 99.98% of supply, leaving about 4,694 tokens in circulation; 0 of the latest 50 transfers occurred within 24 hours.',
          })}
          supplyLabel={pick({ zh: '代币总量', en: 'Total supply' })}
        />
        {d?.ailgns && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
            <span className="mono">{d.ailgns.address}</span>
            <CopyButton value={d.ailgns.address} />
            <ExternalLink href={`${EXPLORER}/token/${d.ailgns.address}`}>{pick({ zh: '查看合约', en: 'View contract' })}</ExternalLink>
            <span>
              {pick({ zh: '创建者', en: 'Creator' })}：<span className="mono">{shortAddr(d.ailgns.topHolder, 6, 4)}</span>
            </span>
          </div>
        )}
      </section>

      <section className="mt-10">
        <SectionHeader
          title="HELIX"
          desc={pick({
            zh: '官方公告规则：Anubis 链上的 LGNS 销毁算力协议。7 天一个纪元，单钱包每纪元 1 次，单次上限 500 LGNS；销毁 1 LGNS = 2 DAI 算力；每日销毁额度 100,000–200,000 LGNS；参与资格为 20,000 LGNS 的 360 天长期质押/债券仓位。',
            en: 'Official announcement rules: an LGNS burn-hashpower protocol on Anubis. 7-day epoch, one burn per wallet per epoch, max 500 LGNS per burn; 1 LGNS burned = 2 DAI hashpower; daily quota 100,000–200,000 LGNS; eligibility requires 20,000 LGNS in a 360-day stake/bond position.',
          })}
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <TokenCard
            token={d?.hpnft}
            title="AWAKE HELIX Production NFT"
            color="#15803D"
            desc={pick({
              zh: '链上最活跃的 HELIX 同名 NFT。3,962 枚总量、3,506 个持有地址；最近 50 笔转账全部发生在 24 小时内。',
              en: 'The most active same-name HELIX NFT on-chain. 3,962 total supply, 3,506 holders; all of the latest 50 transfers occurred within 24 hours.',
            })}
            supplyLabel={pick({ zh: 'NFT 总量', en: 'NFT supply' })}
          />
          <TokenCard
            token={d?.helixPower}
            title="HelixPower"
            color="#B45309"
            desc={pick({
              zh: '链上同名算力代币。创建者地址持有 90.40%，另有 404.7 枚在 RocketSwap LP；最近 50 笔中 5 笔发生在 24 小时内。',
              en: 'Same-name hashpower token. The creator holds 90.40%, with another 404.7 in a RocketSwap LP; 5 of the latest 50 transfers occurred within 24 hours.',
            })}
            supplyLabel={pick({ zh: '代币总量', en: 'Total supply' })}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
          {d?.hpnft && (
            <>
              <span className="mono">HPNFT {shortAddr(d.hpnft.address, 6, 4)}</span>
              <ExternalLink href={`${EXPLORER}/token/${d.hpnft.address}`}>{pick({ zh: '查看 NFT', en: 'View NFT' })}</ExternalLink>
            </>
          )}
          {d?.helixPower && (
            <>
              <span className="mono">HP {shortAddr(d.helixPower.address, 6, 4)}</span>
              <ExternalLink href={`${EXPLORER}/token/${d.helixPower.address}`}>{pick({ zh: '查看代币', en: 'View token' })}</ExternalLink>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card card-pad">
            <div className="label">{pick({ zh: 'LGNS 死地址余额', en: 'LGNS at dead address' })}</div>
            <div className="num mt-1 text-[22px] font-semibold text-ink">
              {d ? `${fmtNum(d.lgnsBurn.dead / 1e6, lang, 2)}M` : '…'}
            </div>
            <div className="mt-1 text-[11px] text-muted">
              {d ? `${fmtPct(d.lgnsBurn.pct / 100, lang, 3)} of supply` : ''}
            </div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: 'AiLGNS 头部集中度', en: 'AiLGNS top holder' })}</div>
            <div className="num mt-1 text-[22px] font-semibold text-danger">
              {d ? fmtPct(d.ailgns.topHolderShare / 100, lang, 2) : '…'}
            </div>
            <div className="mt-1 text-[11px] text-muted">{pick({ zh: '创建者地址', en: 'Creator address' })}</div>
          </div>
          <div className="card card-pad">
            <div className="label">{pick({ zh: 'HelixPower 头部集中度', en: 'HelixPower top holder' })}</div>
            <div className="num mt-1 text-[22px] font-semibold text-danger">
              {d ? fmtPct(d.helixPower.topHolderShare / 100, lang, 2) : '…'}
            </div>
            <div className="mt-1 text-[11px] text-muted">{pick({ zh: '创建者地址', en: 'Creator address' })}</div>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-white px-5 py-4 text-[11px] leading-relaxed text-muted">
          <IconInfo size={14} className="mt-0.5 shrink-0 text-warn" />
          {pick({
            zh: 'LGNS 死地址余额包含所有转入 0x…dEaD 的销毁，不能全部归因于 HELIX。AiLGNS 与 HelixPower 的头部占比来自各自 holder 列表；HPNFT 的头部占比按 NFT 枚数计算。',
            en: 'The LGNS dead-address balance includes all burns sent to 0x…dEaD and cannot be fully attributed to HELIX. Top-holder shares come from each token’s holder list; HPNFT’s share is based on NFT count.',
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title={pick({ zh: '对比', en: 'Comparison' })} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{pick({ zh: '项目', en: 'Item' })}</th>
                  <th>AiLGNS</th>
                  <th>HELIX</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '链', en: 'Chain' })}</td>
                  <td>Anubis</td>
                  <td>Anubis</td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '与 LGNS 的关系', en: 'Relation to LGNS' })}</td>
                  <td className="text-[12px] leading-relaxed">
                    {pick({ zh: '并列的另一个代币，不是 LGNS 的升级版', en: 'A separate token, not an LGNS upgrade' })}
                  </td>
                  <td className="text-[12px] leading-relaxed">
                    {pick({ zh: 'LGNS 的使用场景：销毁 LGNS 换算法力', en: 'An LGNS use case: burn LGNS for hashpower' })}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '合约', en: 'Contract' })}</td>
                  <td className="mono text-[11px]">{d ? shortAddr(d.ailgns.address, 8, 6) : '…'}</td>
                  <td className="mono text-[11px]">
                    {d ? `HPNFT ${shortAddr(d.hpnft.address, 6, 4)}` : '…'}
                    <br />
                    {d ? `HP ${shortAddr(d.helixPower.address, 6, 4)}` : ''}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '供应 / 持有', en: 'Supply / holders' })}</td>
                  <td>{d ? `${fmtInt(d.ailgns.supply, lang)} / ${fmtInt(d.ailgns.holders, lang)}` : '…'}</td>
                  <td>
                    {d
                      ? `${fmtInt(d.hpnft.supply, lang)} NFT / ${fmtInt(d.helixPower.supply, lang)} HP`
                      : '…'}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '头部集中度', en: 'Top holder' })}</td>
                  <td className="text-danger">{d ? fmtPct(d.ailgns.topHolderShare / 100, lang, 2) : '…'}</td>
                  <td className="text-danger">
                    {d ? `${fmtPct(d.hpnft.topHolderShare / 100, lang, 2)} NFT / ${fmtPct(d.helixPower.topHolderShare / 100, lang, 2)} HP` : '…'}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '最近 50 笔中 24h', en: 'In 24h of latest 50' })}</td>
                  <td>{d ? `${d.ailgns.in24h} / ${d.ailgns.sample}` : '…'}</td>
                  <td>{d ? `${d.hpnft.in24h} / ${d.hpnft.sample} · ${d.helixPower.in24h} / ${d.helixPower.sample}` : '…'}</td>
                </tr>
                <tr>
                  <td className="font-medium text-ink">{pick({ zh: '开源', en: 'Verified' })}</td>
                  <td>{d?.ailgns.verified ? pick({ zh: '是', en: 'Yes' }) : pick({ zh: '否', en: 'No' })}</td>
                  <td>{d?.hpnft.verified || d?.helixPower.verified ? pick({ zh: '部分', en: 'Partial' }) : pick({ zh: '否', en: 'No' })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-line bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <span className="mt-0.5 text-warn">
            <IconInfo size={15} />
          </span>
          {pick({
            zh: 'AiLGNS / HELIX 的官方合约、算力产出与权益分配参数没有公开可读接口。本页只展示能链上核对的供应、持有、转账与销毁地址余额。',
            en: 'Official contracts, hashpower output and benefit allocation parameters for AiLGNS / HELIX have no public readable interface. This page only shows supply, holders, transfers and burn-address balances that can be verified on-chain.',
          })}
        </div>
        <a href={`/${lang}/chain`} className="btn btn-ghost btn-sm shrink-0">
          {pick({ zh: '链上数据', en: 'On-chain data' })} <IconArrow size={13} />
        </a>
      </div>
    </div>
  )
}
