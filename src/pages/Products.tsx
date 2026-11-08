import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useProducts } from '../lib/api'
import { PRODUCTS, STATUS_LABEL } from '../data/products'
import { fmtPct, fmtToken } from '../lib/format'
import { Icon } from '../components/Icons'
import { ProductMiniCard } from '../components/dataViews'
import {
  ErrorView,
  LoadingView,
  PageIntro,
  Pill,
  SectionHeader,
  SourceStrip,
  UpdatedAt,
  WarningList,
} from '../components/ui'

export default function Products() {
  const { lang, pick } = useI18n()
  const query = useProducts()
  const core = query.data?.data?.core

  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView rows={8} />
      </div>
    )
  }
  if (query.isError || !core) {
    return (
      <div className="container-page py-10">
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const anubis = core.yields.find((item) => item.chain === 'anubis')
  const polygon = core.yields.find((item) => item.chain === 'polygon')

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'PRODUCT EVIDENCE', en: 'PRODUCT EVIDENCE' })}
        title={pick({ zh: '产品与对比', en: 'Products & comparison' })}
        desc={pick({
          zh: '不是产品介绍册。这里先回答哪些数据能在链上读取、哪些只能看到不可读，再判断产品是否值得继续研究。',
          en: 'This is not a product brochure. It first shows what can be read on-chain, what remains unavailable, and only then supports further research.',
        })}
        action={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <UpdatedAt
              timestamp={query.data?.retrievedAt}
              partial={core.warnings.length > 0}
              maxAgeMinutes={35}
              onRefresh={() => void query.refetch()}
              refreshing={query.isFetching}
            />
            <SourceStrip sources={query.data?.sources ?? []} />
          </div>
        }
      />

      <WarningList items={core.warnings} />

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductMiniCard key={product.id} product={product} data={core} />
        ))}
      </div>

      <section className="mt-10">
        <SectionHeader
          title={pick({ zh: '横向对比', en: 'Side-by-side comparison' })}
          desc={pick({
            zh: '链上不可读不是一个空白格，而是本次阅读的结论：没有证据，不参与收益排序。',
            en: '“Unreadable” is a conclusion, not a blank cell: without evidence, a product is not ranked by yield.',
          })}
        />
        <div className="card table-wrap">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>{pick({ zh: '产品', en: 'Product' })}</th>
                <th>{pick({ zh: '链', en: 'Chain' })}</th>
                <th>{pick({ zh: '数据状态', en: 'Data state' })}</th>
                <th>{pick({ zh: '资产', en: 'Asset' })}</th>
                <th>{pick({ zh: '期限', en: 'Term' })}</th>
                <th>{pick({ zh: '基础 index 24h', en: 'Base index 24h' })}</th>
                <th>{pick({ zh: '可读字段', en: 'Readable' })}</th>
                <th>{pick({ zh: '不可读字段', en: 'Unreadable' })}</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((product) => {
                let daily = 'N/A'
                if (product.metric === 'staking') {
                  daily = `${fmtPct(anubis?.windows[0]?.dailyPct, lang, 3)} / ${fmtPct(polygon?.windows[0]?.dailyPct, lang, 3)}`
                }
                return (
                  <tr key={product.id}>
                    <td>
                      <Link to={`/${lang}/products/${product.id}`} className="font-semibold text-ink hover:text-accent">
                        {pick(product.name)}
                      </Link>
                    </td>
                    <td>{product.chain === 'both' ? pick({ zh: '双链', en: 'Both' }) : product.chain === 'anubis' ? 'Anubis' : 'Polygon'}</td>
                    <td>
                      <Pill tone={product.status === 'live' ? 'ok' : product.status === 'partial' ? 'warn' : 'neutral'}>
                        {pick(STATUS_LABEL[product.status])}
                      </Pill>
                    </td>
                    <td>{pick(product.asset)}</td>
                    <td>{pick(product.term)}</td>
                    <td className="num">{daily}</td>
                    <td className="text-[10px] leading-relaxed">{pick(product.readable)}</td>
                    <td className="text-[10px] leading-relaxed text-warn">{pick(product.unreadable ?? { zh: '无', en: 'None' })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[9.5px] leading-relaxed text-muted">
          {pick({
            zh: '24h 日化的 A/P 分别是 Anubis 与 Polygon 的 index 读数；长期产品的额外奖励没有公开可读参数，不能把基础 index 直接当作完整产品收益。',
            en: 'A/P show Anubis and Polygon index readings respectively. Long-term extra incentives lack readable parameters, so base index is not treated as the complete product yield.',
          })}
        </p>
      </section>

      <section className="mt-9 grid gap-3 md:grid-cols-3">
        {([
          ['01', { zh: '链上可读', en: 'Readable on-chain' }, { zh: '合约返回具体数值，可与浏览器交叉核对。', en: 'The contract returns concrete values that can be cross-checked in the explorer.' }],
          ['02', { zh: '部分可读', en: 'Partially readable' }, { zh: '余额与事件可见，但规则或额外收益无法完整复现。', en: 'Balances and events are visible, but rules or extra returns cannot be fully reproduced.' }],
          ['03', { zh: '不可读', en: 'Unavailable' }, { zh: '没有稳定的公开读取接口，不使用估算数值替代。', en: 'No stable public read interface exists; estimates are not used as substitutes.' }],
        ] as const).map(([number, title, body]) => (
          <div key={String(number)} className="card card-pad">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accentsoft text-[10px] font-semibold text-accent">{number}</span>
              <span className="text-[12px] font-semibold">{pick(title)}</span>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">{pick(body)}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
