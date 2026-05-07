import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Shield, BookOpen, Wallet,
  ChevronRight, LogOut,
} from 'lucide-react'
import { useWallet } from '@/contexts/SolanaWalletContext'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lend', label: 'Lend', icon: TrendingUp },
  { path: '/borrow', label: 'Borrow', icon: TrendingDown },
  { path: '/positions', label: 'Positions', icon: Shield },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { publicKey, connected, disconnect, connecting, openModal } = useWallet()

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-screen bg-[#0B0E11]/95 border-r border-[#1E232C] fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#F7A600] to-[#7C3AED] opacity-20" />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative z-10">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F7A600" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1 className="font-data font-bold text-[#EAECEF] text-sm leading-tight">ArciumShield</h1>
          <p className="text-[10px] text-[#848E9C] font-body">Private DeFi Lending</p>
        </div>
      </div>

      {/* Network Badge */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#12161C] border border-[#1E232C]">
          <div className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
          <span className="text-xs text-[#848E9C] font-body">Solana Devnet</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`nav-item w-full ${isActive ? 'active' : ''}`}>
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-body text-sm flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F7A600]" />}
            </button>
          )
        })}
        <a href="https://docs.arcium.com" target="_blank" rel="noopener noreferrer"
          className="nav-item w-full flex items-center gap-3 text-[#848E9C] hover:text-[#EAECEF]">
          <BookOpen className="w-[18px] h-[18px]" />
          <span className="font-body text-sm flex-1 text-left">Docs</span>
        </a>
      </nav>

      {/* Wallet Section */}
      <div className="p-4 border-t border-[#1E232C]">
        {!connected ? (
          <button onClick={openModal} disabled={connecting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
            <Wallet className="w-4 h-4" />
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="px-3 py-2.5 rounded-lg bg-[#12161C] border border-[#1E232C]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#0ECB81]" />
                <span className="text-xs text-[#848E9C] font-body">Connected</span>
              </div>
              <p className="font-data text-sm text-[#EAECEF] font-medium">
                {publicKey?.toBase58().slice(0, 6)}…{publicKey?.toBase58().slice(-4)}
              </p>
            </div>
            <button onClick={() => disconnect()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#F6465D]/30 text-[#F6465D] text-xs font-body hover:bg-[#F6465D]/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
