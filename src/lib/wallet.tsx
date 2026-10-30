import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ANUBIS } from '../config/chain'

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

export interface WalletInfo {
  uuid: string
  name: string
  icon?: string
  provider: Eip1193Provider
}

interface WalletValue {
  wallets: WalletInfo[]
  active: WalletInfo | null
  address: string | null
  chainId: number | null
  connecting: boolean
  error: string | null
  connect: (wallet?: WalletInfo) => Promise<void>
  disconnect: () => void
  switchToAnubis: () => Promise<void>
  hasProvider: boolean
}

const WalletContext = createContext<WalletValue>({
  wallets: [],
  active: null,
  address: null,
  chainId: null,
  connecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchToAnubis: async () => {},
  hasProvider: false,
})

const STORAGE_KEY = 'awake.wallet.uuid'

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[]; isMetaMask?: boolean }
    okxwallet?: Eip1193Provider
    bitkeep?: { ethereum?: Eip1193Provider }
  }
}

function fallbackWallets(): WalletInfo[] {
  const found: WalletInfo[] = []
  if (window.okxwallet) found.push({ uuid: 'okx', name: 'OKX Wallet', provider: window.okxwallet })
  if (window.bitkeep?.ethereum)
    found.push({ uuid: 'bitget', name: 'Bitget Wallet', provider: window.bitkeep.ethereum })
  if (window.ethereum?.providers?.length) {
    window.ethereum.providers.forEach((p, i) =>
      found.push({ uuid: `injected-${i}`, name: (p as { isMetaMask?: boolean }).isMetaMask ? 'MetaMask' : `Injected ${i + 1}`, provider: p }),
    )
  } else if (window.ethereum) {
    found.push({
      uuid: 'injected',
      name: window.ethereum.isMetaMask ? 'MetaMask' : 'Browser Wallet',
      provider: window.ethereum,
    })
  }
  return found
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [active, setActive] = useState<WalletInfo | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent).detail as WalletInfo | undefined
      if (!detail?.provider) return
      setWallets((prev) => {
        if (prev.some((w) => w.uuid === detail.uuid)) return prev
        return [...prev, detail]
      })
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    const timer = setTimeout(() => {
      setWallets((prev) => (prev.length ? prev : fallbackWallets()))
    }, 350)

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!active?.provider) return
    const provider = active.provider

    const handleAccounts = (accounts: unknown) => {
      const list = accounts as string[]
      setAddress(list?.[0] ?? null)
      if (!list?.length) setActive(null)
    }
    const handleChain = (id: unknown) => {
      setChainId(Number.parseInt(String(id), 16))
    }

    provider.on?.('accountsChanged', handleAccounts)
    provider.on?.('chainChanged', handleChain)

    ;(async () => {
      try {
        const accounts = (await provider.request({ method: 'eth_accounts' })) as string[]
        if (accounts?.[0]) setAddress(accounts[0])
        const cid = (await provider.request({ method: 'eth_chainId' })) as string
        setChainId(Number.parseInt(cid, 16))
      } catch {
        // ignore
      }
    })()

    return () => {
      provider.removeListener?.('accountsChanged', handleAccounts)
      provider.removeListener?.('chainChanged', handleChain)
    }
  }, [active])

  const connect = useCallback(
    async (wallet?: WalletInfo) => {
      const target =
        wallet ||
        wallets.find((w) => w.uuid === localStorage.getItem(STORAGE_KEY)) ||
        wallets[0]
      if (!target) {
        setError('NO_WALLET')
        return
      }
      setConnecting(true)
      setError(null)
      try {
        const accounts = (await target.provider.request({ method: 'eth_requestAccounts' })) as string[]
        if (!accounts?.[0]) throw new Error('NO_ACCOUNT')
        setActive(target)
        setAddress(accounts[0])
        localStorage.setItem(STORAGE_KEY, target.uuid)
        const cid = (await target.provider.request({ method: 'eth_chainId' })) as string
        setChainId(Number.parseInt(cid, 16))
      } catch (e) {
        const err = e as { code?: number; message?: string }
        if (err.code === 4001) setError('REJECTED')
        else if (err.code === -32002) setError('PENDING')
        else setError(err.message || 'CONNECT_FAILED')
      } finally {
        setConnecting(false)
      }
    },
    [wallets],
  )

  const disconnect = useCallback(() => {
    setActive(null)
    setAddress(null)
    setChainId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const switchToAnubis = useCallback(async () => {
    if (!active?.provider) return
    const provider = active.provider
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ANUBIS.hexId }],
      })
    } catch (e) {
      const err = e as { code?: number }
      if (err.code === 4902 || err.code === -32603) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ANUBIS.hexId,
              chainName: ANUBIS.name,
              nativeCurrency: ANUBIS.native,
              rpcUrls: [ANUBIS.rpc],
              blockExplorerUrls: [ANUBIS.explorer],
            },
          ],
        })
      } else {
        setError('SWITCH_FAILED')
      }
    }
  }, [active])

  const value = useMemo(
    () => ({
      wallets,
      active,
      address,
      chainId,
      connecting,
      error,
      connect,
      disconnect,
      switchToAnubis,
      hasProvider: wallets.length > 0,
    }),
    [wallets, active, address, chainId, connecting, error, connect, disconnect, switchToAnubis],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => useContext(WalletContext)
