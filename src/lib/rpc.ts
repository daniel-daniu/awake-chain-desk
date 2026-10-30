import { ANUBIS, POLYGON } from '../config/chain'

const RPC = ANUBIS.rpc

export async function rpcCallTo<T = unknown>(
  url: string,
  method: string,
  params: unknown[],
  timeout = 6_000,
): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    if (!res.ok) throw new Error(`rpc ${res.status}`)
    const json = (await res.json()) as { result?: T; error?: { message?: string } }
    if (json.error) throw new Error(json.error.message || 'rpc error')
    return json.result as T
  } finally {
    clearTimeout(timer)
  }
}

export const rpcCall = <T = unknown>(method: string, params: unknown[], timeout = 6_000) =>
  rpcCallTo<T>(RPC, method, params, timeout)

export const polygonCall = <T = unknown>(method: string, params: unknown[], timeout = 6_000) =>
  rpcCallTo<T>(POLYGON.rpc, method, params, timeout)

export const SEL = {
  balanceOf: '0x70a08231',
  totalSupply: '0x18160ddd',
  token0: '0x0dfe1681',
  token1: '0xd21220a7',
  getReserves: '0x0902f1ac',
}

export const padAddress = (address: string) => address.toLowerCase().replace(/^0x/, '').padStart(64, '0')

export const callData = (selector: string, address?: string) =>
  address ? selector + padAddress(address) : selector

export async function ethCall(to: string, data: string): Promise<string | null> {
  return await rpcCall<string | null>('eth_call', [{ to, data }, 'latest'])
}

export function decodeUint(hex: string | null | undefined): bigint {
  if (!hex || hex === '0x') return 0n
  try {
    return BigInt(hex)
  } catch {
    return 0n
  }
}

export function wordAt(hex: string | null | undefined, index: number): string | null {
  if (!hex) return null
  const body = hex.startsWith('0x') ? hex.slice(2) : hex
  const chunk = body.slice(index * 64, (index + 1) * 64)
  return chunk ? '0x' + chunk : null
}

export const addressFromWord = (word: string | null): string =>
  word ? '0x' + word.slice(-40) : ''

export async function getNativeBalance(address: string): Promise<number> {
  const hex = await rpcCall<string>('eth_getBalance', [address, 'latest'])
  return Number(decodeUint(hex)) / 1e18
}
