import { useQuery } from '@tanstack/react-query'
import { CONTRACTS } from '../config/contracts'
import { callData, decodeUint, ethCall, getNativeBalance, SEL, wordAt } from './rpc'
import type { Balances } from '../types'

export type { Balances }

export function useBalances(address?: string | null) {
  return useQuery({
    queryKey: ['balances', address],
    enabled: Boolean(address),
    refetchInterval: 60_000,
    queryFn: async (): Promise<Balances> => {
      const owner = address!
      const [native, lgns, glgns, lp, lpTotal, reserves] = await Promise.all([
        getNativeBalance(owner).catch(() => 0),
        ethCall(CONTRACTS.lgns.address, callData(SEL.balanceOf, owner)).catch(() => null),
        ethCall(CONTRACTS.glgns.address, callData(SEL.balanceOf, owner)).catch(() => null),
        ethCall(CONTRACTS.pairPrimary.address, callData(SEL.balanceOf, owner)).catch(() => null),
        ethCall(CONTRACTS.pairPrimary.address, SEL.totalSupply).catch(() => null),
        ethCall(CONTRACTS.pairPrimary.address, SEL.getReserves).catch(() => null),
      ])

      const total = Number(decodeUint(lpTotal))
      const share = total ? Number(decodeUint(lp)) / total : 0

      return {
        native,
        lgns: Number(decodeUint(lgns)) / 1e9,
        glgns: Number(decodeUint(glgns)) / 1e18,
        lp: Number(decodeUint(lp)) / 1e18,
        lpTotal: total / 1e18,
        lpShare: share,
        poolLgns: Number(decodeUint(wordAt(reserves, 0))) / 1e9,
        poolDai: Number(decodeUint(wordAt(reserves, 1))) / 1e18,
      }
    },
  })
}
