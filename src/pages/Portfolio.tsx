import { Link } from 'react-router-dom'
import { CHAINS, explorerAddress } from '../config/site'
import { usePortfolio } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { useWallet } from '../lib/wallet'
import { fmtInt, fmtNum, fmtPct, fmtToken, shortAddr } from '../lib/format'
import { Icon } from '../components/Icons'
import {
  Address,
  ErrorView,
  LoadingView,
  PageIntro,
  Pill,
  SectionHeader,
  UpdatedAt,
  WarningList,
} from '../components/ui'

export default function Portfolio() {
  const { lang, pick } = useI18n()
  const { address, chainId, wallets, active, connect, connecting, disconnect, error } = useWallet()
  const query = usePortfolio(address)
  const data = query.data?.data

  return (
    <div className="container-page pb-2">
      <PageIntro
        eyebrow={pick({ zh: 'READ-ONLY WALLET', en: 'READ-ONLY WALLET' })}
        title={pick({ zh: '我的仓位', en: 'Portfolio' })}
        desc={pick({
          zh: '连接注入式钱包后读取双链余额、LP 与 HELIX Power。本站不会请求签名、授权或发送交易。',
          en: 'Connect an injected wallet to read balances, LP and HELIX Power on both chains. This site never requests signatures, approvals or transactions.',
        })}
        action={
          address ? (
            <div className="flex flex-wrap items-center gap-2">
              <UpdatedAt
                timestamp={query.data?.retrievedAt}
                partial={(query.data?.data?.warnings.length ?? 0) > 0}
                maxAgeMinutes={3}
                onRefresh={() => void query.refetch()}
                refreshing={query.isFetching}
              />
              <button type="button" onClick={disconnect} className="btn btn-ghost btn-sm">
                {pick({ zh: '断开', en: 'Disconnect' })}
              </button>
            </div>
          ) : (
            <Pill tone="ok">
              <Icon name="shield" size={11} /> {pick({ zh: '只读模式', en: 'Read-only mode' })}
            </Pill>
          )
        }
      />

      {!address ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card card-pad">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accentsoft text-accent">
                  <Icon name="wallet" size={21} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold">{pick({ zh: '选择浏览器钱包', en: 'Choose a browser wallet' })}</div>
                  <div className="mt-0.5 text-[10px] text-muted">{pick({ zh: '通过 EIP-6963 自动发现', en: 'Discovered through EIP-6963' })}</div>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {wallets.length ? (
                  wallets.map((wallet) => (
                    <button
                      key={wallet.uuid}
                      type="button"
                      onClick={() => void connect(wallet)}
                      disabled={connecting}
                      className="focus-ring flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-[#c9d8d3]"
                    >
                      <span className="flex items-center gap-2.5">
                        {wallet.icon ? (
                          <img src={wallet.icon} alt="" className="h-6 w-6 rounded-md" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas text-muted">
                            <Icon name="wallet" size={13} />
                          </span>
                        )}
                        <span className="text-[11.5px] font-medium">{wallet.name}</span>
                      </span>
                      <span className="text-[10px] text-accent">{connecting ? pick({ zh: '连接中…', en: 'Connecting…' }) : pick({ zh: '连接', en: 'Connect' })}</span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-[#efd7bc] bg-warnsoft px-4 py-3 text-[10.5px] leading-relaxed text-[#74400e]">
                    {pick({
                      zh: '未检测到钱包。请安装或在浏览器中启用 MetaMask、OKX Wallet、Bitget Wallet、TokenPocket 等插件。',
                      en: 'No wallet detected. Install or enable MetaMask, OKX Wallet, Bitget Wallet, TokenPocket or another browser extension.',
                    })}
                  </div>
                )}
                {error === 'REJECTED' && <div className="text-[10px] text-danger">{pick({ zh: '连接请求已拒绝。', en: 'Connection request rejected.' })}</div>}
                {error === 'PENDING' && <div className="text-[10px] text-warn">{pick({ zh: '钱包里已有待处理请求。', en: 'A wallet request is already pending.' })}</div>}
              </div>
            </div>
            <div className="card card-pad">
              <div className="label">{pick({ zh: '只读边界', en: 'Read-only boundary' })}</div>
              <ul className="mt-3 space-y-3 text-[10.5px] leading-relaxed text-ink-2">
                {[
                  { zh: '不请求签名或交易确认。', en: 'No signature or transaction confirmation is requested.' },
                  { zh: '不读取或保存私钥、助记词。', en: 'Private keys and seed phrases are never accessed or stored.' },
                  { zh: '地址只用于当前页面向同源接口查询公开链上数据。', en: 'The address is only sent to the same-origin API to read public chain data for this page.' },
                  { zh: '页面不会替你切换网络。', en: 'The page does not switch networks for you.' },
                ].map((item) => (
                  <li key={item.en} className="flex gap-2">
                    <Icon name="check" size={13} className="mt-0.5 shrink-0 text-ok" />
                    {pick(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.values(CHAINS).map((chain) => (
              <div key={chain.key} className="card card-pad">
                <div className="label">{chain.name}</div>
                <div className="mono mt-2 text-[11px] text-ink">chainId {chain.id}</div>
                <div className="mt-2 text-[10px] text-muted">{chain.native.symbol} · {chain.explorer}</div>
              </div>
            ))}
          </div>
        </>
      ) : query.isLoading ? (
        <LoadingView rows={4} />
      ) : query.isError || !data ? (
        <ErrorView message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <div className="card card-pad">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="label">{pick({ zh: '当前地址', en: 'Current address' })}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="mono text-[13px] font-semibold">{shortAddr(address, 8, 6)}</span>
                  <Pill tone="neutral">{active?.name || 'Wallet'}</Pill>
                  {chainId && <Pill tone="neutral">chainId {chainId}</Pill>}
                </div>
              </div>
            </div>
          </div>

          <WarningList items={data.warnings} />

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              { chain: 'anubis' as const, balances: data.anubis },
              { chain: 'polygon' as const, balances: data.polygon },
            ].map(({ chain, balances }) => (
              <div key={chain} className="card card-pad">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold">{CHAINS[chain].name}</div>
                    <div className="mono mt-0.5 text-[9px] text-muted">chainId {CHAINS[chain].id}</div>
                  </div>
                  <a
                    href={explorerAddress(chain, address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent hover:underline"
                  >
                    {pick({ zh: '浏览器查看', en: 'Explorer' })}
                  </a>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    [pick({ zh: '原生 Gas 币', en: 'Native gas' }), fmtNum(balances.native, lang, 4)],
                    ['LGNS', fmtToken(balances.lgns, lang, 'LGNS')],
                    ['gLGNS', balances.glgns === null ? 'N/A' : fmtToken(balances.glgns, lang, 'gLGNS')],
                    ['AiLGNS', balances.aiLgns === null ? 'N/A' : fmtToken(balances.aiLgns, lang, 'AiLGNS')],
                    ['LGNS/DAI LP', fmtNum(balances.lp, lang, 5)],
                    [pick({ zh: 'LP 占比', en: 'LP share' }), fmtPct(balances.lpShare === null ? null : balances.lpShare * 100, lang, 4)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#f5f3ed] px-3 py-2.5">
                      <div className="label">{label}</div>
                      <div className="num mt-1 text-[12px] font-semibold text-ink">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-line pt-3 text-[9.5px] leading-relaxed text-muted">
                  {balances.poolDai !== null && balances.poolLgns !== null
                    ? `${pick({ zh: '池子当前约含', en: 'Pool currently contains' })} ${fmtToken(balances.poolDai, lang, 'DAI')} + ${fmtToken(balances.poolLgns, lang, 'LGNS')}`
                    : pick({ zh: '池子储备暂时不可读。', en: 'Pool reserves are unavailable.' })}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6">
            <SectionHeader
              title={pick({ zh: 'HELIX Power', en: 'HELIX Power' })}
              desc={pick({ zh: '来自 Power Ledger 的地址读取，不代表未来一定会产生相同排放。', en: 'Read from the Power Ledger for this address; it does not guarantee future emissions.' })}
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [pick({ zh: '生效 Power', en: 'Active Power' }), data.helix.activePower],
                [pick({ zh: '待生效 Power', en: 'Pending Power' }), data.helix.pendingPower],
                [pick({ zh: '累计 Power', en: 'Total Power' }), data.helix.totalPower],
                [pick({ zh: '待领取 AiLGNS', en: 'Accrued AiLGNS' }), data.helix.accruedAiLgns],
              ].map(([label, value]) => (
                <div key={String(label)} className="card card-pad">
                  <div className="label">{label}</div>
                  <div className="num mt-2 text-[18px] font-semibold">{fmtNum(value as number | null, lang, 4)}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-white/70 px-4 py-3 text-[10px] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Icon name="shield" size={14} className="text-ok" />
              {pick({ zh: '只读接口不会发送交易。所有资产价格仍应结合链上税后价格和滑点判断。', en: 'The read-only API sends no transactions. Asset prices must still be interpreted with on-chain tax and slippage.' })}
            </span>
            <Link to={`/${lang}/learn`} className="shrink-0 font-semibold text-accent">
              {pick({ zh: '核对指标', en: 'Read the basics' })}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
