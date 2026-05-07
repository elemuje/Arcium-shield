import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Zap, TrendingUp, ChevronRight, Github, BookOpen,
  ArrowRight, EyeOff, Server, Fingerprint } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0E11]/80 backdrop-blur-xl border-b border-[#1E232C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#F7A600] to-[#7C3AED] opacity-20" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="url(#nav-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="nav-grad" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F7A600" /><stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-data font-bold text-[#EAECEF]">ArciumShield</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://docs.arcium.com" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-[#848E9C] hover:text-[#EAECEF] transition-colors font-body">
              <BookOpen className="w-4 h-4" /> Docs
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-[#848E9C] hover:text-[#EAECEF] transition-colors font-body">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7C3AED]/50 text-sm font-body text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors">
              Launch App <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-[#F7A600]/5 blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 mb-8">
            <Shield className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm text-[#7C3AED] font-body">Powered by Arcium Encrypted Computation</span>
          </div>
          <h1 className="font-data text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EAECEF] leading-tight mb-6">
            The Future of
            <span className="text-gradient block mt-2">Encrypted Finance</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#848E9C] font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Execute lending, borrowing, and swaps under cryptographic lock. Zero-knowledge meets DeFi on Solana.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
              Enter the App <ChevronRight className="w-5 h-5" />
            </button>
            <a href="https://docs.arcium.com" target="_blank" rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
              <BookOpen className="w-4 h-4" /> Learn More
            </a>
          </div>

          {/* Supported wallets callout */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <span className="text-xs text-[#848E9C] font-body">Supported wallets:</span>
            {[
              { name: 'Phantom', color: '#AB9FF2' },
              { name: 'Solflare', color: '#FC7227' },
              { name: 'Backpack', color: '#E33E3F' },
            ].map((w) => (
              <span key={w.name} className="text-xs font-data font-semibold px-2.5 py-1 rounded-full border"
                style={{ color: w.color, borderColor: `${w.color}30`, backgroundColor: `${w.color}10` }}>
                {w.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4 sm:px-6 border-t border-[#1E232C]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-data text-3xl font-bold text-[#EAECEF] mb-4">The Problem with Public DeFi</h2>
            <p className="text-[#848E9C] font-body max-w-xl mx-auto">Traditional DeFi exposes all financial data on-chain, creating significant risks.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: EyeOff, title: 'Front-Running', desc: 'MEV bots exploit visible transactions to extract value from your trades.', color: '#F6465D' },
              { icon: Server, title: 'Data Exposure', desc: 'All positions, collateral amounts, and health factors are publicly visible.', color: '#F7A600' },
              { icon: Fingerprint, title: 'Privacy Loss', desc: 'Financial privacy is compromised as anyone can track your DeFi activity.', color: '#848E9C' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-[#12161C] border border-[#1E232C] hover:border-[#F6465D]/30 transition-all">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-data font-semibold text-[#EAECEF] mb-2">{item.title}</h3>
                <p className="text-sm text-[#848E9C] font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-4 sm:px-6 border-t border-[#1E232C]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-data text-3xl font-bold text-[#EAECEF] mb-4">Arcium Privacy Solution</h2>
            <p className="text-[#848E9C] font-body max-w-xl mx-auto">Arcium enables encrypted computation on Solana, keeping your data private.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Encrypted Collateral', desc: 'Your collateral value is never revealed on-chain.', color: '#7C3AED' },
              { icon: Shield, title: 'Private Health Factor', desc: 'Health factor computed via MPC, never exposed.', color: '#0ECB81' },
              { icon: Zap, title: 'Anti-MEV Design', desc: 'Time-delayed releases prevent front-running.', color: '#F7A600' },
              { icon: TrendingUp, title: 'Secure Liquidations', desc: 'Encrypted checks protect from bot exploitation.', color: '#F7A600' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-[#12161C] border border-[#1E232C] hover:border-[#7C3AED]/30 transition-all group">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-data font-semibold text-[#EAECEF] mb-2">{item.title}</h3>
                <p className="text-sm text-[#848E9C] font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-[#1E232C]/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-panel rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 to-[#F7A600]/10 pointer-events-none" />
            <div className="relative z-10">
              <Shield className="w-12 h-12 text-[#7C3AED] mx-auto mb-6" />
              <h2 className="font-data text-3xl font-bold text-[#EAECEF] mb-4">Ready to Lend Privately?</h2>
              <p className="text-[#848E9C] font-body mb-8 max-w-lg mx-auto">
                Join the next generation of DeFi. Your financial data stays encrypted, your positions stay protected.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-base px-10 py-4">
                Launch App <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 border-t border-[#1E232C]/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#848E9C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-[#848E9C] font-body">ArciumShield © 2025. Built on Solana Devnet.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://docs.arcium.com" target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#848E9C] hover:text-[#EAECEF] transition-colors font-body">Arcium Docs</a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#848E9C] hover:text-[#EAECEF] transition-colors font-body">Solana</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
