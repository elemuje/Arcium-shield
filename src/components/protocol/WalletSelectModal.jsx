import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { X, Shield } from 'lucide-react'

// This component exists so our custom "Connect Wallet" button
// can trigger the official wallet-adapter modal which handles
// Phantom, Solflare, and Backpack deep-links automatically.
// The actual modal rendering is done by WalletModalProvider in
// SolanaWalletContext — this is just a helper re-export.

export function useConnectModal() {
  const { setVisible } = useWalletModal()
  return { openModal: () => setVisible(true) }
}
