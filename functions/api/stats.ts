import { json, fail, cached, fetchJson, rpcBatch } from '../_lib/utils'

const API = 'https://browser.anubispace.org/api/v2'
const ANUBIS_RPC = 'https://rpc.anubispace.org'
const POLYGON_RPC = 'https://polygon-bor-rpc.publicnode.com'

const hexToInt = (h: string | null) => (h ? Number.parseInt(h, 16) : 0)
export const onRequestGet = async (context: any) => {
  const { request } = context
  return cached(request, 300, 900, async () => {
    try {
      const [stats, blocks, aRpc, pRpc] = await Promise.all([
        fetchJson<any>(`${API}/stats`),
        fetchJson<any[]>(`${API}/main-page/blocks`).catch(() => []),
        rpcBatch(ANUBIS_RPC, [
          { method: 'eth_blockNumber', params: [] },
          { method: 'eth_getBlockByNumber', params: ['latest', false] },
        ]).catch(() => [null, null]),
        rpcBatch(POLYGON_RPC, [
          { method: 'eth_blockNumber', params: [] },
          { method: 'eth_gasPrice', params: [] },
        ]).catch(() => [null, null]),
      ])

      const latest = aRpc[0] ? hexToInt(aRpc[0]) : 0
      const latestBlock: any = aRpc[1] || null
      const tNow = latestBlock ? hexToInt(latestBlock.timestamp) : 0

      let blocksPerDay: number | null = null
      let blockTime: number | null = null
      let blockReward: number | null = null
      let avgBlockFee: number | null = null
      let dailyFee: number | null = null

      const sampleBlocks = 86400
      if (latest > sampleBlocks) {
        const oldHex = await rpcBatch(ANUBIS_RPC, [
          { method: 'eth_getBlockByNumber', params: ['0x' + (latest - sampleBlocks).toString(16), false] },
        ]).catch(() => [null])
        const oldBlock: any = oldHex[0]
        if (oldBlock && tNow) {
          const tOld = hexToInt(oldBlock.timestamp)
          const span = Math.max(1, tNow - tOld)
          blocksPerDay = (sampleBlocks / span) * 86400
          blockTime = span / sampleBlocks
        }
      }

      const fees = (blocks || [])
        .map((b: any) => Number(b.transaction_fees || 0) / 1e18)
        .filter((n: number) => Number.isFinite(n))
      if (fees.length) {
        avgBlockFee = fees.reduce((a, b) => a + b, 0) / fees.length
        if (blocksPerDay) dailyFee = avgBlockFee * blocksPerDay
      }
      const rewardLists = (blocks || []).map((b: any) => b.rewards).filter(Array.isArray)
      if (rewardLists.length) {
        blockReward = rewardLists.some((r: any[]) => r.length > 0)
          ? rewardLists.reduce((acc: number, r: any[]) => acc + Number(r[0]?.reward || 0), 0) / rewardLists.length
          : 0
      }

      const pLatest = pRpc[0] ? hexToInt(pRpc[0]) : 0
      const gasGwei = pRpc[1] ? Number(BigInt(pRpc[1])) / 1e9 : 0
      let pBlocksPerDay: number | null = null
      let pBlockTime: number | null = null
      if (pLatest > 43200) {
        const pOld = await rpcBatch(POLYGON_RPC, [
          { method: 'eth_getBlockByNumber', params: ['0x' + (pLatest - 43200).toString(16), false] },
        ]).catch(() => [null])
        const pNow = await rpcBatch(POLYGON_RPC, [
          { method: 'eth_getBlockByNumber', params: ['0x' + pLatest.toString(16), false] },
        ]).catch(() => [null])
        const oldBlock: any = pOld[0]
        const nowBlock: any = pNow[0]
        if (oldBlock && nowBlock) {
          const span = Math.max(1, hexToInt(nowBlock.timestamp) - hexToInt(oldBlock.timestamp))
          pBlocksPerDay = (43200 / span) * 86400
          pBlockTime = span / 43200
        }
      }

      return json(
        {
          anubis: {
            chainId: 6714,
            blockNumber: Number(stats.total_blocks || latest),
            blockTime: blockTime ?? Number(stats.average_block_time || 1000) / 1000,
            totalAddresses: Number(stats.total_addresses || 0),
            totalTransactions: Number(stats.total_transactions || 0),
            txToday: Number(stats.transactions_today || 0),
            gas: stats.gas_prices || { slow: null, average: null, fast: null },
            utilization: Number(stats.network_utilization_percentage || 0),
            nativePrice: Number(stats.coin_price || 1),
            blocksPerDay,
            blockReward,
            avgBlockFee,
            dailyFee,
            feeSample: fees.length,
          },
          polygon: {
            chainId: 137,
            blockNumber: pLatest,
            gasPriceGwei: gasGwei,
            blockTime: pBlockTime,
            blocksPerDay: pBlocksPerDay,
            simpleTransferFee: gasGwei ? (gasGwei * 21000) / 1e9 : null,
          },
          blocks: (blocks || []).slice(0, 6).map((b: any) => ({
            height: b.height,
            txs: b.transactions_count ?? null,
            gasUsed: b.gas_used_percentage ?? null,
            timestamp: b.timestamp,
          })),
          ts: new Date().toISOString(),
        },
        {
          ttl: 300,
          swr: 900,
          sources: [
            { name: 'Blockscout' },
            { name: 'Anubis RPC' },
            { name: 'Polygon RPC' },
          ],
        },
      )
    } catch {
      return fail('STATS_UPSTREAM')
    }
  }, context)
}
