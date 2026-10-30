import { json, fail, cached, fetchJson, rpcBatch, word, toBig } from '../_lib/utils'

const API = 'https://browser.anubispace.org/api/v2'
const RPC = 'https://rpc.anubispace.org'
const LGNS = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const DEAD = '0x000000000000000000000000000000000000dEaD'

const TOKENS = {
  ailgns: '0xeA3Bf6D39cF067c2a967F452982B0d8b78ac85D8',
  hpnft: '0x77E6ab1C5557FD456b0656304E0e5c02a6d7DcCA',
  helixPower: '0xeAfb3594381BC0861703c9ec2C290d0Bf7d904EF',
}

const dayAgo = () => Date.now() - 24 * 3600 * 1000

async function tokenInfo(key: string, address: string) {
  const [token, counters, holders, transfers, addr] = await Promise.all([
    fetchJson<any>(`${API}/tokens/${address}`),
    fetchJson<any>(`${API}/tokens/${address}/counters`).catch(() => ({})),
    fetchJson<any>(`${API}/tokens/${address}/holders`).catch(() => ({ items: [] })),
    fetchJson<any>(`${API}/tokens/${address}/transfers`).catch(() => ({ items: [] })),
    fetchJson<any>(`${API}/addresses/${address}`).catch(() => ({})),
  ])

  const type = token.type || 'ERC-20'
  const decimals = Number(token.decimals || 0)
  const rawSupply = Number(token.total_supply || 0)
  const supply = type === 'ERC-721' ? rawSupply : rawSupply / 10 ** decimals
  const top = (holders.items || [])[0]
  const topRaw = Number(top?.value || 0)
  const topValue = type === 'ERC-721' ? topRaw : topRaw / 10 ** decimals
  const items = transfers.items || []
  const cutoff = dayAgo()
  const in24h = items.filter((x: any) => new Date(x.timestamp).getTime() >= cutoff).length

  return {
    key,
    address,
    name: token.name || key,
    symbol: token.symbol || '',
    type,
    supply,
    holders: Number(token.holders_count || counters.token_holders_count || 0),
    transfers: Number(counters.transfers_count || 0),
    topHolder: top?.address?.hash || '',
    topHolderShare: supply ? (topValue / supply) * 100 : 0,
    latestTransfer: items[0]?.timestamp || null,
    in24h,
    sample: items.length,
    verified: Boolean(addr.is_verified),
    proxy: addr.proxy_type || null,
  }
}

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 600, 1800, async () => {
    try {
      const [ailgns, hpnft, helixPower, lgnsToken, burnRpc] = await Promise.all([
        tokenInfo('ailgns', TOKENS.ailgns),
        tokenInfo('hpnft', TOKENS.hpnft),
        tokenInfo('helixPower', TOKENS.helixPower),
        fetchJson<any>(`${API}/tokens/${LGNS}`).catch(() => ({})),
        rpcBatch(RPC, [
          {
            method: 'eth_call',
            params: [{ to: LGNS, data: '0x70a08231' + DEAD.slice(2).toLowerCase().padStart(64, '0') }, 'latest'],
          },
        ]).catch(() => [null]),
      ])

      const supply = Number(lgnsToken.total_supply || 0) / 1e9
      const dead = Number(toBig(burnRpc[0])) / 1e9

      return json(
        {
          ailgns,
          hpnft,
          helixPower,
          lgnsBurn: { dead, supply, pct: supply ? (dead / supply) * 100 : 0 },
          ts: new Date().toISOString(),
        },
        { ttl: 600, swr: 1800, sources: [{ name: 'Blockscout' }, { name: 'Anubis RPC' }] },
      )
    } catch (e) {
      return fail('ECOSYSTEM_UPSTREAM')
    }
  }, context)
}
