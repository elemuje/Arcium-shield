import { useState, useEffect, useRef } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import { useWallet } from '@/contexts/SolanaWalletContext'

const WALLET_COLORS = {
  Phantom: '#AB9FF2',
  Solflare: '#FC7227',
  Backpack: '#E33E3F',
}

const WALLET_ICONS = {
  Phantom: (
    <svg width="16" height="16" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="32" fill="#AB9FF2"/>
      <path d="M110.5 64C110.5 89.4051 89.9051 110 64.5 110C39.0949 110 18.5 89.4051 18.5 64C18.5 38.5949 39.0949 18 64.5 18C89.9051 18 110.5 38.5949 110.5 64Z" fill="white"/>
      <path d="M64.5 87C76.9264 87 87 76.9264 87 64.5C87 52.0736 76.9264 42 64.5 42C52.0736 42 42 52.0736 42 64.5C42 76.9264 52.0736 87 64.5 87Z" fill="#AB9FF2"/>
    </svg>
  ),
  Solflare: (
    <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#FC7227"/>
      <path d="M32 14L46 38H18L32 14Z" fill="white"/>
      <path d="M32 50L18 38H46L32 50Z" fill="white" fillOpacity="0.6"/>
    </svg>
  ),
  Backpack: (
    <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="16" fill="#E33E3F"/>
      <path d="M20 44V28C20 24.686 22.686 22 26 22H38C41.314 22 44 24.686 44 28V44" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <rect x="16" y="36" width="32" height="12" rx="4" fill="white"/>
      <circle cx="32" cy="42" r="2" fill="#E33E3F"/>
    </svg>
  ),
}

export function WalletButton() {
  const { connected, connecting, publicKey, disconnect, openModal, walletName } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const accentColor = WALLET_COLORS[walletName] ?? '#F7A600'

  if (!connected) {
    return (
      <button
        onClick={openModal}
        disabled={connecting}
        className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
      >
        <Wallet className="w-4 h-4" />
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12161C] border border-[#1E232C] hover:border-[#F7A600]/30 transition-colors"
      >
        {walletName && WALLET_ICONS[walletName] ? (
          <span className="flex-shrink-0">{WALLET_ICONS[walletName]}</span>
        ) : (
          <div className="w-2 h-2 rounded-full bg-[#0ECB81]" />
        )}
        <span className="font-data text-sm text-[#EAECEF]">
          {publicKey?.toBase58().slice(0, 4)}…{publicKey?.toBase58().slice(-4)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#848E9C] transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#12161C] border border-[#1E232C] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Wallet info header */}
          <div className="p-4 border-b border-[#1E232C]">
            <div className="flex items-center gap-3 mb-3">
              {walletName && WALLET_ICONS[walletName] && (
                <span>{WALLET_ICONS[walletName]}</span>
              )}
              <div>
                <p className="text-xs text-[#848E9C] font-body">Connected via</p>
                <p className="font-data text-sm font-semibold" style={{ color: accentColor }}>
                  {walletName ?? 'Unknown Wallet'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0ECB81]/10 border border-[#0ECB81]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse" />
                <span className="text-[10px] text-[#0ECB81] font-body">Devnet</span>
              </div>
            </div>
            <p className="text-xs text-[#848E9C] font-body mb-1">Address</p>
            <div className="flex items-center gap-2 bg-[#0B0E11]/60 rounded-lg px-3 py-2">
              <p className="font-data text-xs text-[#EAECEF] truncate flex-1">
                {publicKey?.toBase58()}
              </p>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-[#1E232C] transition-colors flex-shrink-0"
                title="Copy address"
              >
                <Copy className="w-3.5 h-3.5 text-[#848E9C]" />
              </button>
            </div>
            {copied && <p className="text-[10px] text-[#0ECB81] mt-1 font-body">Copied!</p>}
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                window.open(
                  `https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`,
                  '_blank'
                )
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#848E9C] hover:bg-[#1A1F28] hover:text-[#EAECEF] transition-colors font-body"
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </button>
            <button
              onClick={() => {
                disconnect()
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#F6465D] hover:bg-[#F6465D]/10 transition-colors font-body"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
