import { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

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
