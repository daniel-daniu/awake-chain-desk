import { json, fail, cached, fetchJson } from '../_lib/utils'

const API = 'https://browser.anubispace.org/api/v2'
const LGNS = '0x4D1D808a081FdAc440703b3765FC61f8028C06B8'
const STAKING = '0x7a2E3fA6eA60437F0441b8eb5e60674B80339228'
const LGNS_DECIMALS = 9

interface RawHolder {
  address?: { hash?: string; is_contract?: boolean; name?: string | null }
  value?: string
}

export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 600, 1800, async () => {
    try {
      const [token, holdersRes] = await Promise.all([
        fetchJson<any>(`${API}/tokens/${LGNS}`),
        fetchJson<{ items?: RawHolder[] }>(`${API}/tokens/${LGNS}/holders`).catch(() => ({ items: [] })),
      ])

      const totalSupply = Number(token.total_supply || 0) / 10 ** LGNS_DECIMALS
      const holders = (holdersRes.items || []).map((h) => {
        const value = Number(h.value || 0) / 10 ** LGNS_DECIMALS
        return {
          address: h.address?.hash || '',
          value,
          share: totalSupply ? value / totalSupply : 0,
          isContract: Boolean(h.address?.is_contract),
          name: h.address?.name || null,
        }
      })

      const top10 = holders.slice(0, 10)
      const eoas = holders.filter((h) => !h.isContract)
      const price = token.exchange_rate ? Number(token.exchange_rate) : 0

      return json(
        {
          address: LGNS,
          symbol: token.symbol || 'LGNS',
          name: token.name || 'Longinus',
          decimals: LGNS_DECIMALS,
          totalSupply,
          holders: Number(token.holders_count || 0),
          price,
          marketCap: totalSupply * price,
          volume24h: Number(token.volume_24h || 0),
          stakingBalance: holders.find((h) => h.address.toLowerCase() === STAKING.toLowerCase())?.value || 0,
          topHolders: top10,
          concentration: {
            top1: top10[0]?.share || 0,
            top10: top10.reduce((a, h) => a + h.share, 0),
            top1Eoa: eoas[0]?.share || 0,
            top10Eoa: eoas.slice(0, 10).reduce((a, h) => a + h.share, 0),
          },
          ts: new Date().toISOString(),
        },
        { ttl: 600, swr: 1800, sources: [{ name: 'Blockscout' }, { name: 'Anubis RPC' }] },
      )
    } catch {
      return fail('TOKEN_UPSTREAM')
    }
  }, context)
}
