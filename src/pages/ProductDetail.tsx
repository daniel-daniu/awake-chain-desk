import { Link, Navigate, useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useProducts } from '../lib/api'
import { productById, PRODUCTS, STATUS_LABEL } from '../data/products'
import { explorerAddress, LGNS } from '../config/site'
import { fmtPct, fmtPrice, fmtToken, shortAddr } from '../lib/format'
import { ErrorView, LoadingView, PageIntro, Pill, SectionHeader, WarningList } from '../components/ui'
import { Icon } from '../components/Icons'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { lang, pick } = useI18n()
  const product = id ? productById(id) : undefined
  const query = useProducts()
  const core = query.data?.data?.core

  if (!product) return <Navigate to={`/${lang}/products`} replace />
  if (query.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingView rows={5} />
      </div>
    )
  }
  if (query.isError || !query.data || !core) {
    return (
      <div className="container-page py-10">
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const anubis = core.quotes.find((quote) => quote.chain === 'anubis')
  const polygon = core.quotes.find((quote) => quote.chain === 'polygon')
  const anubisYield = core.yields.find((item) => item.chain === 'anubis')?.windows[0]
  const polygonYield = core.yields.find((item) => item.chain === 'polygon')?.windows[0]
  const evidenceContracts =
    product.chain === 'both'
      ? [
          { chain: 'anubis' as const, address: LGNS.anubis.indexContract },
          { chain: 'polygon' as const, address: LGNS.polygon.indexContract },
        ]
      : product.contract
        ? [
            {
              chain: product.chain === 'polygon' ? ('polygon' as const) : ('anubis' as const),
              address: product.contract,
            },
          ]
        : []

  const metrics =
    product.metric === 'staking'
      ? [
          [pick({ zh: 'Anubis 基础 index 24h', en: 'Anubis base index 24h' }), fmtPct(anubisYield?.dailyPct, lang, 4)],
          [pick({ zh: 'Polygon 基础 index 24h', en: 'Polygon base index 24h' }), fmtPct(polygonYield?.dailyPct, lang, 4)],
          [pick({ zh: 'Anubis 基础 APY', en: 'Anubis base APY' }), fmtPct(anubisYield?.annualCompoundPct, lang, 1)],
          [pick({ zh: 'Polygon 基础 APY', en: 'Polygon base APY' }), fmtPct(polygonYield?.annualCompoundPct, lang, 1)],
        ]
      : product.metric === 'pool'
        ? [
            [pick({ zh: '池内 DAI', en: 'Pool DAI' }), fmtToken((product.chain === 'polygon' ? polygon : anubis)?.daiReserve, lang, 'DAI')],
            [pick({ zh: '池内 LGNS', en: 'Pool LGNS' }), fmtToken((product.chain === 'polygon' ? polygon : anubis)?.lgnsReserve, lang, 'LGNS')],
            [pick({ zh: '链上价格', en: 'On-chain price' }), fmtPrice((product.chain === 'polygon' ? polygon : anubis)?.priceDai, lang)],
            [pick({ zh: '卖出税', en: 'Sell tax' }), fmtPct((product.chain === 'polygon' ? polygon : anubis)?.sellTaxPct, lang, 3)],
          ]
        : [
            [pick({ zh: '数据状态', en: 'Data state' }), pick(STATUS_LABEL[product.status])],
            [pick({ zh: '链上收益', en: 'On-chain yield' }), 'N/A'],
            [pick({ zh: '合约身份', en: 'Contract identity' }), product.contractSource === 'public-docs' ? pick({ zh: '仅有公开说明', en: 'Public docs only' }) : pick({ zh: '地址可核验', en: 'Address available' })],
            [pick({ zh: '结论', en: 'Conclusion' }), pick({ zh: '先核查', en: 'Verify first' })],
          ]

  return (
    <div className="container-page pb-2">
      <Link to={`/${lang}/products`} className="mt-6 inline-flex items-center gap-1.5 text-[10.5px] text-muted hover:text-accent">
        <Icon name="arrow" size={12} className="rotate-180" /> {pick({ zh: '返回产品对比', en: 'Back to product comparison' })}
      </Link>
      <PageIntro
        eyebrow={product.chain === 'both' ? pick({ zh: 'ANUBIS + POLYGON', en: 'ANUBIS + POLYGON' }) : product.chain.toUpperCase()}
        title={pick(product.name)}
        desc={pick(product.description)}
        action={
          <Pill tone={product.status === 'live' ? 'ok' : product.status === 'partial' ? 'warn' : 'neutral'}>
            {pick(STATUS_LABEL[product.status])}
          </Pill>
        }
      />
      <WarningList items={core.warnings} />

      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="card card-pad">
            <div className="label">{label}</div>
            <div className="num mt-2 text-[19px] font-semibold text-ink">{value}</div>
          </div>
        ))}
      </section>

      <section className="mt-9 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeader title={pick({ zh: '产品结构', en: 'Product structure' })} />
          <div className="card divide-y divide-line">
            {[
              [pick({ zh: '参与资产', en: 'Asset' }), pick(product.asset)],
              [pick({ zh: '期限', en: 'Term' }), pick(product.term)],
              [pick({ zh: '进入方式', en: 'Entry' }), pick(product.entry)],
              [pick({ zh: '退出方式', en: 'Exit' }), pick(product.exit)],
              [pick({ zh: '可读字段', en: 'Readable' }), pick(product.readable)],
              [pick({ zh: '不可读字段', en: 'Unreadable' }), pick(product.unreadable ?? { zh: '本次没有记录到额外不可读项', en: 'No additional unreadable item recorded' })],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[110px_1fr] sm:gap-4">
                <div className="label pt-0.5">{label}</div>
                <div className="text-[11.5px] leading-relaxed text-ink-2">{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title={pick({ zh: '链上证据', en: 'On-chain evidence' })} />
          <div className="card card-pad">
            <div className="label">{pick({ zh: '合约地址', en: 'Contract address' })}</div>
            {evidenceContracts.length ? (
              <div className="mt-3 space-y-3">
                {evidenceContracts.map((evidence) => (
                  <div key={evidence.address} className="rounded-xl bg-[#f5f3ed] px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Pill tone={evidence.chain === 'anubis' ? 'accent' : 'neutral'}>
                        {evidence.chain === 'anubis' ? 'Anubis' : 'Polygon'}
                      </Pill>
                      <span className="mono break-all text-[10px] text-ink">
                        {evidence.address}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[9px] text-muted">{shortAddr(evidence.address, 10, 8)}</span>
                      <a
                        href={explorerAddress(evidence.chain, evidence.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
                      >
                        {pick({ zh: '浏览器核对', en: 'Verify' })} <Icon name="external" size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-warn">
                {pick({ zh: '没有稳定的公开合约地址。该产品不会根据名称猜测地址。', en: 'No stable public contract address. The site does not guess an address from the product name.' })}
              </p>
            )}
            <div className="mt-4 border-t border-line pt-4">
              <div className="label">{pick({ zh: '数据说明', en: 'Data note' })}</div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                {pick({
                  zh: '合约是否开源、代理实现和可读字段会在链上数据页持续更新。产品详情不使用静态收益。',
                  en: 'Verification, proxy implementation and readable fields are kept up to date on the on-chain page. Product details use no static yield.',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader title={pick({ zh: '相关产品', en: 'Related products' })} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.filter((candidate) => candidate.id !== product.id).slice(0, 3).map((candidate) => (
            <Link
              key={candidate.id}
              to={`/${lang}/products/${candidate.id}`}
              className="card card-pad flex items-center justify-between gap-3 transition hover:border-[#c9d8d3]"
            >
              <div>
                <div className="text-[12px] font-semibold">{pick(candidate.name)}</div>
                <div className="mt-1 line-clamp-1 text-[9.5px] text-muted">{pick(candidate.short)}</div>
              </div>
              <Icon name="arrow" size={14} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
