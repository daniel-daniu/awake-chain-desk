import { useI18n } from '../i18n'
import { ANUBIS, POLYGON } from '../config/chain'
import { CONTRACTS, addressUrl, tokenUrl } from '../config/contracts'
import { ExternalLink, Pill, SectionHeader } from '../components/ui'
import { IconAlert, IconClock, IconGlobe, IconInfo, IconShield } from '../components/Icons'

export default function About() {
  const { t, lang } = useI18n()

  const sources = [
    { name: 'Anubis Blockscout API', url: `${ANUBIS.explorer}/api-docs`, desc: 'chain stats / tokens / holders / blocks' },
    { name: 'Anubis Chain RPC', url: ANUBIS.rpc, desc: 'eth_call · pair reserves · balances' },
    { name: 'Polygon public RPC', url: POLYGON.rpc, desc: 'block number · gas price' },
    { name: 'RocketSwap LGNS/DAI', url: addressUrl(CONTRACTS.pairPrimary.address), desc: 'primary pool reserves' },
    { name: 'Official / media pages', url: 'https://origindao.io/', desc: 'announcements and coverage' },
  ]

  return (
    <div className="container-page py-8 md:py-10">
      <div className="max-w-3xl">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{t('about.title')}</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{t('about.intro')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone="accent">
            <IconGlobe size={12} /> {t('brand.nonofficial')}
          </Pill>
          <Pill tone="ok">
            <IconShield size={12} /> {t('portfolio.readonly')}
          </Pill>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          { icon: <IconGlobe size={18} />, title: t('about.sources'), body: t('about.sourcesDesc') },
          { icon: <IconClock size={18} />, title: t('about.frequency'), body: t('about.frequencyDesc') },
          { icon: <IconInfo size={18} />, title: t('about.limits'), body: t('about.limitsDesc') },
        ].map((x) => (
          <div key={x.title} className="card card-pad">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentsoft text-accent">{x.icon}</div>
            <div className="mt-3 text-[13px] font-semibold text-ink">{x.title}</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{x.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeader title={t('about.sources')} desc={t('about.sourcesDesc')} />
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('common.source')}</th>
                  <th>{t('insights.note')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.name}>
                    <td className="font-medium text-ink">{s.name}</td>
                    <td className="mono text-[11px]">{s.desc}</td>
                    <td className="text-right">
                      <ExternalLink href={s.url}>{t('common.viewExplorer')}</ExternalLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title={t('products.evidence')} desc={t('about.limitsDesc')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(CONTRACTS).map((c) => (
            <a
              key={c.address}
              href={c.kind === 'token' ? tokenUrl(c.address) : addressUrl(c.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-pad group transition hover:border-[#cfd9df]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[12.5px] font-semibold text-ink">{c.label[lang]}</div>
                <Pill tone={c.verified ? 'ok' : 'warn'}>{c.verified ? t('common.verified') : t('common.unverified')}</Pill>
              </div>
              <div className="mono mt-2 text-[10.5px] leading-relaxed text-muted">{c.address}</div>
              <div className="mt-2 text-[11px] text-muted">{c.note[lang]}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="rounded-2xl border border-[#F3D9D5] bg-danger-soft p-6">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#8E2E23]">
            <IconAlert size={16} /> {t('about.disclaimer')}
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#7A2B21]">{t('about.disclaimerText')}</p>
          <p className="mt-3 text-[11px] leading-relaxed text-[#8E2E23]">{t('about.nonofficial')}</p>
        </div>
      </section>

      <section className="mt-8 card card-pad">
        <div className="text-[13px] font-semibold text-ink">{t('about.built')}</div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{t('about.builtDesc')}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted">
          {['Cloudflare Pages', 'Pages Functions', 'React + Vite', 'Raw JSON-RPC', 'No cookies', 'No analytics'].map((x) => (
            <span key={x} className="rounded-md bg-canvas px-2 py-1">
              {x}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
