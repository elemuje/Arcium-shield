import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { FluidBackground } from '../effects/FluidBackground'
import { WalletButton } from '../protocol/WalletButton'

export function Layout() {
  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF]">
      <FluidBackground />
      <div className="noise-overlay" />
      <Sidebar />
      <main className="lg:ml-[240px] min-h-screen relative z-10">
        <header className="sticky top-0 z-20 bg-[#0B0E11]/80 backdrop-blur-xl border-b border-[#1E232C]/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <h2 className="font-data font-semibold text-lg text-[#EAECEF]">ArciumShield</h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-body bg-[#F7A600]/10 text-[#F7A600] border border-[#F7A600]/20">
                BETA
              </span>
            </div>
            <WalletButton />
          </div>
        </header>
        <div className="px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
