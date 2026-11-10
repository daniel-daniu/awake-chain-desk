import { afterEach, describe, expect, it, vi } from 'vitest'
import { rpcBatch } from '../../functions/_lib/utils'

describe('rpcBatch failover', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('continues to the next provider when a batch is only partially complete', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = String(input)
        const payload =
          url === 'https://first.invalid'
            ? [
                { jsonrpc: '2.0', id: 1, result: '0x1' },
                { jsonrpc: '2.0', id: 2, error: { message: 'limited' } },
              ]
            : [
                { jsonrpc: '2.0', id: 1, result: '0x1' },
                { jsonrpc: '2.0', id: 2, result: '0x2' },
              ]
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      })

    const result = await rpcBatch(
      ['https://first.invalid', 'https://second.invalid'],
      [
        { method: 'eth_chainId', params: [] },
        { method: 'eth_blockNumber', params: [] },
      ],
      3_000,
    )

    expect(result).toEqual(['0x1', '0x2'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
