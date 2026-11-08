import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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
}

const WalletContext = createContext<WalletValue>({
  wallets: [],
  active: null,
  address: null,
  chainId: null,
  connecting: false,
  error: null,
  connect: async () => undefined,
  disconnect: () => undefined,
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
  if (window.bitkeep?.ethereum) {
    found.push({ uuid: 'bitget', name: 'Bitget Wallet', provider: window.bitkeep.ethereum })
  }
  if (window.ethereum?.providers?.length) {
    window.ethereum.providers.forEach((provider, index) => {
      found.push({
        uuid: `injected-${index}`,
        name: (provider as Eip1193Provider & { isMetaMask?: boolean }).isMetaMask
          ? 'MetaMask'
          : `Injected ${index + 1}`,
        provider,
      })
    })
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
    const announce = (event: Event) => {
      const detail = (event as CustomEvent).detail as WalletInfo | undefined
      if (!detail?.provider) return
      setWallets((current) =>
        current.some((wallet) => wallet.uuid === detail.uuid) ? current : [...current, detail],
      )
    }
    window.addEventListener('eip6963:announceProvider', announce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    const timer = setTimeout(() => {
      setWallets((current) => (current.length ? current : fallbackWallets()))
    }, 400)
    return () => {
      window.removeEventListener('eip6963:announceProvider', announce)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!active?.provider) return
    const provider = active.provider
    const accountHandler = (accounts: unknown) => {
      const list = accounts as string[]
      setAddress(list?.[0] ?? null)
      if (!list?.length) setActive(null)
    }
    const chainHandler = (id: unknown) => setChainId(Number.parseInt(String(id), 16))
    provider.on?.('accountsChanged', accountHandler)
    provider.on?.('chainChanged', chainHandler)
    void (async () => {
      try {
        const accounts = (await provider.request({ method: 'eth_accounts' })) as string[]
        setAddress(accounts?.[0] ?? null)
        const value = (await provider.request({ method: 'eth_chainId' })) as string
        setChainId(Number.parseInt(value, 16))
      } catch {
        setAddress(null)
      }
    })()
    return () => {
      provider.removeListener?.('accountsChanged', accountHandler)
      provider.removeListener?.('chainChanged', chainHandler)
    }
  }, [active])

  const connect = useCallback(
    async (wallet?: WalletInfo) => {
      const target =
        wallet ||
        wallets.find((candidate) => candidate.uuid === localStorage.getItem(STORAGE_KEY)) ||
        wallets[0]
      if (!target) {
        setError('NO_WALLET')
        return
      }
      setConnecting(true)
      setError(null)
      try {
        const accounts = (await target.provider.request({ method: 'eth_requestAccounts' })) as string[]
        if (!accounts?.[0]) throw new Error('No account returned')
        setActive(target)
        setAddress(accounts[0])
        localStorage.setItem(STORAGE_KEY, target.uuid)
        const value = (await target.provider.request({ method: 'eth_chainId' })) as string
        setChainId(Number.parseInt(value, 16))
      } catch (cause) {
        const errorObject = cause as { code?: number; message?: string }
        if (errorObject.code === 4001) setError('REJECTED')
        else if (errorObject.code === -32002) setError('PENDING')
        else setError(errorObject.message || 'CONNECT_FAILED')
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
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ wallets, active, address, chainId, connecting, error, connect, disconnect }),
    [wallets, active, address, chainId, connecting, error, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => useContext(WalletContext)
