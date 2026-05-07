import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork, BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

// ---------------------------------------------------------------------------
// Custom Backpack adapter — uses window.backpack injected by the extension
// Avoids the deprecated @solana/wallet-adapter-backpack npm package entirely
// ---------------------------------------------------------------------------
class BackpackWalletAdapter extends BaseMessageSignerWalletAdapter {
  constructor() {
    super()
    this.name = 'Backpack'
    this.url = 'https://backpack.app'
    this.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRTMzRTNGIi8+PHBhdGggZD0iTTEwIDIyVjE0QzEwIDExLjc5MDkgMTEuNzkwOSAxMCAxNCAxMEgxOEMyMC4yMDkxIDEwIDIyIDExLjc5MDkgMjIgMTRWMjIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHJlY3QgeD0iOCIgeT0iMTgiIHdpZHRoPSIxNiIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjIyIiByPSIxLjUiIGZpbGw9IiNFMzNFM0YiLz48L3N2Zz4='
    this._connecting = false
    this._wallet = null
    this._publicKey = null
  }

  get publicKey() { return this._publicKey }
  get connecting() { return this._connecting }
  get readyState() {
    if (typeof window === 'undefined') return WalletReadyState.Unsupported
    return (window.backpack && window.backpack.isBackpack)
      ? WalletReadyState.Installed
      : WalletReadyState.NotDetected
  }

  async connect() {
    if (this.readyState !== WalletReadyState.Installed) {
      throw new Error('Backpack not installed — visit https://backpack.app')
    }
    this._connecting = true
    try {
      const resp = await window.backpack.connect()
      this._publicKey = resp.publicKey
      this._wallet = window.backpack
      this.emit('connect', this._publicKey)
    } finally {
      this._connecting = false
    }
  }

  async disconnect() {
    if (this._wallet) {
      await this._wallet.disconnect?.()
      this._wallet = null
      this._publicKey = null
    }
    this.emit('disconnect')
  }

  async signTransaction(transaction) {
    if (!this._wallet) throw new Error('Not connected')
    return this._wallet.signTransaction(transaction)
  }

  async signAllTransactions(transactions) {
    if (!this._wallet) throw new Error('Not connected')
    return this._wallet.signAllTransactions(transactions)
  }

  async signMessage(message) {
    if (!this._wallet) throw new Error('Not connected')
    return this._wallet.signMessage(message)
  }
}

// ---------------------------------------------------------------------------

const NETWORK = WalletAdapterNetwork.Devnet
const ENDPOINT = clusterApiUrl(NETWORK)

const WalletContext = createContext({
  publicKey: null,
  connected: false,
  connecting: false,
  disconnect: () => {},
  openModal: () => {},
  walletName: null,
  walletIcon: null,
  balance: 0,
  isDevnet: true,
})

export const useWallet = () => useContext(WalletContext)

function WalletStateProvider({ children }) {
  const { connection } = useConnection()
  const wallet = useSolanaWallet()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState(0)

  const fetchBalance = useCallback(async () => {
    if (wallet.publicKey) {
      try {
        const bal = await connection.getBalance(wallet.publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch {
        setBalance(0)
      }
    } else {
      setBalance(0)
    }
  }, [connection, wallet.publicKey])

  useEffect(() => {
    if (wallet.connected) {
      fetchBalance()
      const interval = setInterval(fetchBalance, 15000)
      return () => clearInterval(interval)
    }
  }, [wallet.connected, fetchBalance])

  const value = {
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    connecting: wallet.connecting,
    disconnect: wallet.disconnect,
    openModal: () => setVisible(true),
    walletName: wallet.wallet?.adapter?.name ?? null,
    walletIcon: wallet.wallet?.adapter?.icon ?? null,
    balance,
    isDevnet: true,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function SolanaWalletContextProvider({ children }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStateProvider>{children}</WalletStateProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
