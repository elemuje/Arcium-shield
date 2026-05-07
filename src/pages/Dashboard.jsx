import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Shield, Activity, Lock, Zap,
  ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'
import { useLendingProtocol } from '@/hooks/useLendingProtocol'
import { PrivacyToggle } from '@/components/protocol/PrivacyToggle'
import { HealthFactorGauge } from '@/components/charts/HealthFactorGauge'
import { APYChart } from '@/components/charts/APYChart'
import { arciumEngine } from '@/arcium/ArciumPrivacy'

const APY_HISTORY = [
  { month: 'Jan', apy: 3.2 }, { month: 'Feb', apy: 3.8 }, { month: 'Mar', apy: 4.1 },
  { month: 'Apr', apy: 3.9 }, { month: 'May', apy: 4.5 }, { month: 'Jun', apy: 5.1 },
  { month: 'Jul', apy: 5.4 },
]

export default function Dashboard() {
  const { pools, userPositions, totalDeposited, totalBorrowed, netAPY,
    isPrivateMode, setIsPrivateMode, transactions } = useLendingProtocol()
  const [showSensitive, setShowSensitive] = useState(false)
  const [arciumStatus, setArciumStatus] = useState('idle')

  useEffect(() => {
    arciumEngine.initialize().then(() => setArciumStatus('ready'))
  }, [])

  const overallHF = totalBorrowed > 0 ? (totalDeposited * 0.8) / totalBorrowed : 999
  const riskLevel = overallHF >= 1.5 ? 'SAFE' : overallHF >= 1.1 ? 'WARNING' : 'DANGER'
  const riskColor = riskLevel === 'SAFE' ? '#0ECB81' : riskLevel === 'WARNING' ? '#F7A600' : '#F6465D'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-data text-2xl font-bold text-[#EAECEF]">Dashboard</h1>
          <p className="text-sm text-[#848E9C] font-body mt-1">Overview of your private lending portfolio</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12161C] border border-[#1E232C]">
          <div className={`w-2 h-2 rounded-full ${arciumStatus === 'ready' ? 'bg-[#0ECB81]' : 'bg-[#F7A600] animate-pulse'}`} />
          <span className="text-xs text-[#848E9C] font-body">Arcium {arciumStatus === 'ready' ? 'Ready' : 'Initializing'}</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#0ECB81]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#0ECB81]" />
            </div>
            <span className="text-[10px] font-body text-[#0ECB81] bg-[#0ECB81]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />+2.4%
            </span>
          </div>
          <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Total Deposited</p>
          <p className="font-data text-xl font-bold text-[#EAECEF] mt-1">
            {showSensitive ? `$${totalDeposited.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••••••'}
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#F6465D]/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#F6465D]" />
            </div>
            <span className="text-[10px] font-body text-[#F6465D] bg-[#F6465D]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />-1.2%
            </span>
          </div>
          <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Total Borrowed</p>
          <p className="font-data text-xl font-bold text-[#EAECEF] mt-1">
            {showSensitive ? `$${totalBorrowed.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••••••'}
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#F7A600]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F7A600]" />
            </div>
          </div>
          <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Net APY</p>
          <p className="font-data text-xl font-bold text-[#0ECB81] mt-1">
            {netAPY >= 0 ? '+' : ''}{netAPY.toFixed(2)}%
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
            </div>
          </div>
          <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Risk Level</p>
          <p className="font-data text-xl font-bold mt-1" style={{ color: riskColor }}>{riskLevel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-data font-semibold text-[#EAECEF]">APY Performance</h2>
              <span className="text-xs text-[#848E9C] font-body">Last 7 months</span>
            </div>
            <APYChart data={APY_HISTORY} color="#F7A600" height={250} />
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Active Positions</h2>
            {userPositions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-[#1E232C] mx-auto mb-3" />
                <p className="text-sm text-[#848E9C] font-body">No active positions yet</p>
                <p className="text-xs text-[#848E9C] font-body mt-1">Start lending or borrowing to see your positions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPositions.map((pos) => (
                  <div key={pos.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7A600]/20 to-[#7C3AED]/20 flex items-center justify-center">
                        <span className="font-data text-lg">{pools.find((p) => p.id === pos.poolId)?.icon || '◎'}</span>
                      </div>
                      <div>
                        <p className="font-data text-sm font-medium text-[#EAECEF]">{pos.assetSymbol}</p>
                        <p className="text-xs text-[#848E9C] font-body">{pos.depositedAmount > 0 ? 'Lending' : 'Borrowing'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-data text-sm font-medium text-[#EAECEF]">
                        {showSensitive
                          ? pos.depositedAmount > 0
                            ? `${pos.depositedAmount.toFixed(4)} ${pos.assetSymbol}`
                            : `${pos.borrowedAmount.toFixed(4)} ${pos.assetSymbol}`
                          : '••••••'}
                      </p>
                      <p className="text-xs text-[#848E9C] font-body">
                        {showSensitive ? `$${(pos.depositedAmount > 0 ? pos.collateralValue : pos.borrowValue).toFixed(2)}` : '••••'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Privacy Controls</h2>
            <PrivacyToggle isPrivate={isPrivateMode} onToggle={setIsPrivateMode}
              showData={showSensitive} onShowDataToggle={setShowSensitive} />
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Health Factor</h2>
            <div className="flex justify-center py-4">
              <HealthFactorGauge value={overallHF} showValue={showSensitive} size={140} />
            </div>
            {totalBorrowed > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#848E9C] font-body">LTV Ratio</span>
                  <span className="font-data text-sm font-medium text-[#EAECEF]">
                    {showSensitive ? `${((totalBorrowed / totalDeposited) * 100).toFixed(1)}%` : '•••'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1E232C] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: showSensitive ? `${Math.min((totalBorrowed / totalDeposited) * 100, 100)}%` : '0%',
                      background: 'linear-gradient(90deg, #0ECB81, #F7A600, #F6465D)' }} />
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Recent Activity</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-[#848E9C] font-body text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0E11]/40">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-[#0ECB81]/10' : tx.type === 'borrow' ? 'bg-[#F6465D]/10' : 'bg-[#F7A600]/10'}`}>
                        {tx.type === 'deposit'
                          ? <TrendingUp className="w-3 h-3 text-[#0ECB81]" />
                          : tx.type === 'borrow'
                          ? <TrendingDown className="w-3 h-3 text-[#F6465D]" />
                          : <Activity className="w-3 h-3 text-[#F7A600]" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#EAECEF] font-body capitalize">{tx.type}</p>
                        <p className="text-[10px] text-[#848E9C] font-body">{tx.asset}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-data text-xs text-[#EAECEF]">
                        {showSensitive ? tx.amount.toFixed(4) : '•••'}
                      </span>
                      {tx.isPrivate && <Lock className="w-3 h-3 text-[#7C3AED]" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
