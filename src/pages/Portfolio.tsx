import { useI18n } from '../i18n'
import { useWallet } from '../lib/wallet'
import { useBalances } from '../lib/balances'
import { usePrice } from '../lib/api'
import { fmtNum, fmtPct, fmtUsd, shortAddr } from '../lib/format'
import { CopyButton, Pill, SectionHeader } from '../components/ui'
import { MetricCard } from '../components/blocks'
import { IconAlert, IconInfo, IconLock, IconWallet } from '../components/Icons'
import { ANUBIS } from '../config/chain'

export default function Portfolio() {
  const { t, lang } = useI18n()
  const { address, chainId, wallets, active, connect, connecting, disconnect, switchToAnubis, error } = useWallet()
  const balancesQ = useBalances(address)
  const priceQ = usePrice()
  const price = priceQ.data?.data
  const b = balancesQ.data

  const errText =
    error === 'NO_WALLET'
      ? t('portfolio.noWallet')
      : error === 'REJECTED'
        ? 'Request rejected in wallet (4001).'
        : error === 'PENDING'
          ? 'A wallet request is already pending (-32002).'
          : error === 'SWITCH_FAILED'
            ? 'Network switch was rejected or unsupported.'
            : error

  return (
    <div className="container-page py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{t('portfolio.title')}</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{t('portfolio.desc')}</p>
        </div>
        <Pill tone="ok">
          <IconLock size={12} /> {t('portfolio.readonly')}
        </Pill>
      </div>

      {!address ? (
        <>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card card-pad">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentsoft text-accent">
                <IconWallet size={22} />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-ink">{t('portfolio.connect')}</div>
                <div className="text-[11px] text-muted">{t('portfolio.readonlyNote')}</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {wallets.length === 0 && <div className="rounded-lg bg-warn-soft px-4 py-3 text-[12px] text-[#7A4A0C]">{t('portfolio.noWallet')}</div>}
              {wallets.map((w) => (
                <button
                  key={w.uuid}
                  onClick={() => connect(w)}
                  disabled={connecting}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-[#cfd9df] hover:bg-surface-2"
                >
                  <span className="flex items-center gap-2.5">
                    {w.icon ? (
                      <img src={w.icon} alt="" className="h-6 w-6 rounded-md" />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas text-muted">
                        <IconWallet size={14} />
                      </span>
                    )}
                    <span className="text-[13px] font-medium text-ink">{w.name}</span>
                  </span>
                  <span className="text-[11px] text-accent">{connecting ? t('portfolio.connecting') : t('portfolio.connect')}</span>
                </button>
              ))}
            </div>

            {errText && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] text-[#8E2E23]">
                <IconAlert size={13} className="mt-0.5 shrink-0" /> {errText}
              </div>
            )}
          </div>

          <div className="card card-pad">
            <div className="label">{t('portfolio.readonly')}</div>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-ink-2">
              <li className="flex gap-2">
                <IconInfo size={14} className="mt-0.5 shrink-0 text-accent" /> {t('portfolio.readonlyNote')}
              </li>
              <li className="flex gap-2">
                <IconInfo size={14} className="mt-0.5 shrink-0 text-accent" /> {t('about.limitsDesc')}
              </li>
              <li className="flex gap-2">
                <IconInfo size={14} className="mt-0.5 shrink-0 text-accent" /> {t('portfolio.riskNote')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="card card-pad sm:col-span-2">
            <div className="label">{t('portfolio.wallets')}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['MetaMask', 'OKX Wallet', 'Bitget Wallet', 'TokenPocket', 'Rabby', 'Browser Wallet'].map((w) => (
                <span key={w} className="rounded-lg border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink-2">
                  {w}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {t('portfolio.eip6963')}
            </p>
          </div>
          <div className="card card-pad">
            <div className="label">{t('common.chain')}</div>
            <div className="mt-2 space-y-1.5 text-[11px] text-muted">
              <div className="flex justify-between">
                <span>Anubis</span>
                <span className="mono text-ink">6714</span>
              </div>
              <div className="flex justify-between">
                <span>Polygon</span>
                <span className="mono text-ink">137</span>
              </div>
              <div className="flex justify-between">
                <span>Gas token</span>
                <span className="mono text-ink">DAI</span>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        <>
          <div className="mt-6 card card-pad">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label">{t('portfolio.connected')}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="mono text-[15px] font-semibold text-ink">{shortAddr(address, 8, 6)}</span>
                  <CopyButton value={address} />
                  <Pill tone="neutral">{active?.name}</Pill>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {chainId !== ANUBIS.id ? (
                  <button onClick={switchToAnubis} className="btn btn-accent btn-sm">
                    {t('portfolio.switch')} · 6714
                  </button>
                ) : (
                  <Pill tone="ok">Anubis · 6714</Pill>
                )}
                <button onClick={() => balancesQ.refetch()} className="btn btn-ghost btn-sm">
                  {t('portfolio.refresh')}
                </button>
                <button onClick={disconnect} className="btn btn-ghost btn-sm">
                  {t('portfolio.disconnect')}
                </button>
              </div>
            </div>
            {chainId !== ANUBIS.id && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-[11px] text-[#7A4A0C]">
                <IconAlert size={13} className="mt-0.5 shrink-0" />
                {t('portfolio.wrongNetwork')}. Balances are still read from the Anubis RPC directly, so they remain accurate.
              </div>
            )}
          </div>

          <section className="mt-6">
            <SectionHeader title={t('portfolio.balances')} desc={t('portfolio.riskNote')} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard label={t('portfolio.native')} value={b ? fmtNum(b.native, lang, 4) : '…'} hint="DAI · 18" />
              <MetricCard
                label={t('portfolio.lgns')}
                value={b ? fmtNum(b.lgns, lang, 2) : '…'}
                hint={b && price ? fmtUsd(b.lgns * price.primary, lang) : undefined}
              />
              <MetricCard label={t('portfolio.glgns')} value={b ? fmtNum(b.glgns, lang, 2) : '…'} hint="gLGNS · 18" />
              <MetricCard
                label={t('portfolio.lp')}
                value={b ? fmtNum(b.lp, lang, 4) : '…'}
                hint={b ? `${t('common.share')} ${fmtPct(b.lpShare, lang, 4)}` : undefined}
              />
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="card card-pad">
              <div className="text-[13px] font-semibold text-ink">{t('portfolio.positions')}</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-canvas px-4 py-3">
                  <div>
                    <div className="text-[12px] font-medium text-ink">LGNS/DAI LP</div>
                    <div className="text-[11px] text-muted">
                      {b ? `${fmtNum(b.lpShare * b.poolLgns, lang, 2)} LGNS + ${fmtNum(b.lpShare * b.poolDai, lang, 2)} DAI` : '…'}
                    </div>
                  </div>
                  <div className="num text-[13px] font-semibold text-ink">
                    {b && price ? fmtUsd(b.lpShare * b.poolDai * 2, lang) : '…'}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-line px-4 py-3">
                  <div>
                    <div className="text-[12px] font-medium text-ink">{t('portfolio.staked')}</div>
                    <div className="mt-1 text-[11px] leading-relaxed text-muted">{t('products.contractUnverified')}</div>
                  </div>
                  <Pill tone="warn">{t('common.unavailable')}</Pill>
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <IconLock size={15} /> {t('portfolio.readonly')}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{t('portfolio.readonlyNote')}</p>
              <div className="mt-4 space-y-2 text-[11px] text-muted">
                <div className="flex items-center justify-between">
                  <span>{t('common.wallet')}</span>
                  <span className="text-ink">{active?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('common.chain')}</span>
                  <span className="mono text-ink">{chainId ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>RPC</span>
                  <span className="mono text-ink">rpc.anubispace.org</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <div className="mt-8 flex items-start gap-2 rounded-xl border border-line bg-white px-5 py-4 text-[11px] leading-relaxed text-muted">
        <IconInfo size={14} className="mt-0.5 shrink-0" />
        {t('products.notAdvice')}
      </div>
    </div>
  )
}
