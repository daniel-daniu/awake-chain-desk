import { CHAINS, DAPP_REGISTRY_URL } from '../config/site'
import { useI18n } from '../lib/i18n'
import { APP } from '../config/site'
import { Icon } from '../components/Icons'
import { PageIntro, Pill, SectionHeader } from '../components/ui'

export default function About() {
  const { pick } = useI18n()

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'ABOUT THIS TOOL', en: 'ABOUT THIS TOOL' })}
        title={pick({ zh: '关于本站', en: 'About this site' })}
        desc={pick({
          zh: '一个独立的链上数据整理工具，目标是把数字来源、计算方法和不可读边界说清楚。',
          en: 'An independent on-chain data tool built to make sources, calculations and unreadable boundaries explicit.',
        })}
        action={
          <Pill tone="accent">
            <Icon name="globe" size={11} /> Anubis · Polygon
          </Pill>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: 'chain' as const,
            title: { zh: '数据从哪里来', en: 'Where data comes from' },
            body: {
              zh: '双链价格、税费、index、余额和 HELIX 额度来自公开 RPC；持仓、合约验证和事件来自区块浏览器索引。',
              en: 'Dual-chain prices, taxes, index, balances and HELIX quotas come from public RPC; holders, verification and events come from explorer indexes.',
            },
          },
          {
            icon: 'clock' as const,
            title: { zh: '多久刷新', en: 'Refresh policy' },
            body: {
              zh: '首页约 10 分钟，链上数据约 15 分钟，产品约 30 分钟，新闻约 15 分钟，钱包仓位约 90 秒；页面隐藏时停止轮询。',
              en: 'Home about 10 minutes, on-chain data about 15 minutes, products about 30 minutes, news about 15 minutes and wallet positions about 90 seconds. Polling pauses when the page is hidden.',
            },
          },
          {
            icon: 'alert' as const,
            title: { zh: '什么时候写 N/A', en: 'When N/A is used' },
            body: {
              zh: '接口没有返回、合约没有公开可读字段或历史状态不可用时写 N/A。不会用参考站配置、旧截图或演示数据替代。',
              en: 'N/A is used when an endpoint is missing, a contract exposes no readable field, or historical state is unavailable. No reference-site config, screenshots or demo data are substituted.',
            },
          },
        ].map((item) => (
          <div key={item.title.en} className="card card-pad">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentsoft text-accent">
              <Icon name={item.icon} size={16} />
            </div>
            <div className="mt-3 text-[12.5px] font-semibold">{pick(item.title)}</div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">{pick(item.body)}</p>
          </div>
        ))}
      </div>

      <section className="mt-9">
        <SectionHeader
          title={pick({ zh: '作者与联系', en: 'Author & contact' })}
          desc={pick({ zh: '数据纠错、来源补充或合作可直接联系。', en: 'Contact for data corrections, source additions or collaboration.' })}
        />
        <div className="card card-pad flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-[15px] font-semibold text-white">
              D
            </span>
            <div>
              <div className="text-[14px] font-semibold">{APP.author}</div>
              <div className="mt-0.5 text-[10px] text-muted">{pick({ zh: '独立开发与维护', en: 'Independent development and maintenance' })}</div>
            </div>
          </div>
          <a href={`mailto:${APP.email}`} className="btn btn-accent">
            <Icon name="news" size={14} /> {APP.email}
          </a>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader title={pick({ zh: '主要数据来源', en: 'Primary sources' })} />
        <div className="card divide-y divide-line">
          {[
            { name: 'Anubis RPC', detail: 'LGNS, index, HELIX quotas, balances', url: CHAINS.anubis.rpc[0] },
            { name: 'Anubis Blockscout', detail: 'holders, events, contract verification', url: CHAINS.anubis.explorer },
            { name: 'Polygon RPC', detail: 'LGNS, pool reserves, gas, historical state', url: CHAINS.polygon.rpc[0] },
            { name: 'AWAKE HELIX DApp Registry', detail: 'published contract addresses', url: DAPP_REGISTRY_URL },
            { name: 'External news sources', detail: 'titles, dates and source links only', url: 'https://lgns.tech/news' },
          ].map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#fbfaf6]"
            >
              <div>
                <div className="text-[11.5px] font-semibold">{source.name}</div>
                <div className="mt-0.5 text-[9.5px] text-muted">{source.detail}</div>
              </div>
              <Icon name="external" size={13} className="shrink-0 text-muted" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-9 rounded-2xl border border-[#efceca] bg-dangersoft/50 p-5 md:p-6">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-danger">
          <Icon name="alert" size={15} /> {pick({ zh: '边界与免责声明', en: 'Limits and disclaimer' })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#78433d]">
          {pick({
            zh: '本站是独立第三方数据工具，与 Awake、Origin、Anubis、LGNS 或 HELIX 项目方无隶属关系。链上数据可能延迟、缺失、被操纵或无法解释；风险说明不是投资、法律或税务建议。钱包连接严格只读，不提供交易、托管或兑付服务。',
            en: 'This is an independent third-party data tool and is not affiliated with Awake, Origin, Anubis, LGNS or HELIX project operators. On-chain data can be delayed, missing, manipulated or ambiguous. Risk notes are not investment, legal or tax advice. Wallet access is strictly read-only and no trading, custody or redemption service is provided.',
          })}
        </p>
      </section>
    </div>
  )
}
