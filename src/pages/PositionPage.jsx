import { useState } from 'react'
import { Shield, TrendingUp, TrendingDown, Lock, AlertTriangle, Loader2, X, Activity } from 'lucide-react'
import { useLendingProtocol } from '@/hooks/useLendingProtocol'
import { PrivacyToggle } from '@/components/protocol/PrivacyToggle'
import { HealthFactorGauge } from '@/components/charts/HealthFactorGauge'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E11]/85 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-[#12161C] border border-[#1E232C] rounded-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-data text-lg font-bold text-[#EAECEF]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1E232C] transition-colors">
            <X className="w-4 h-4 text-[#848E9C]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function PositionPage() {
  const {
    pools, depositPositions, borrowPositions,
    loading, isPrivateMode, setIsPrivateMode, repay, withdraw,
  } = useLendingProtocol()

  const [showData,           setShowData]           = useState(true)
  const [repayAmount,        setRepayAmount]        = useState('')
  const [selectedPosition,   setSelectedPosition]   = useState(null)
  const [showRepayDialog,    setShowRepayDialog]    = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawAmount,     setWithdrawAmount]     = useState('')

  const handleRepay = async () => {
    if (!selectedPosition || !repayAmount) return
    try {
      await repay(selectedPosition, parseFloat(repayAmount))
      setShowRepayDialog(false); setRepayAmount(''); setSelectedPosition(null)
    } catch (err) { console.error('Repay failed:', err) }
  }

  const handleWithdraw = async () => {
    if (!selectedPosition || !withdrawAmount) return
    const position = depositPositions.find((p) => p.id === selectedPosition)
    if (!position) return
    try {
      await withdraw(position.poolId, parseFloat(withdrawAmount))
      setShowWithdrawDialog(false); setWithdrawAmount(''); setSelectedPosition(null)
    } catch (err) { console.error('Withdraw failed:', err) }
  }

  const openRepayDialog    = (id) => { setSelectedPosition(id); setRepayAmount('');    setShowRepayDialog(true)    }
  const openWithdrawDialog = (id) => { setSelectedPosition(id); setWithdrawAmount(''); setShowWithdrawDialog(true) }

  const totalDeposited = depositPositions.reduce((s, p) => s + p.collateralValue, 0)
  const totalBorrowed  = borrowPositions.reduce( (s, p) => s + p.borrowValue,     0)
  const overallHF      = totalBorrowed > 0 ? (totalDeposited * 0.8) / totalBorrowed : 999
  const netAPY         = totalDeposited > 0
    ? depositPositions.reduce((s, p) => {
        const pool = pools.find((pl) => pl.id === p.poolId)
        return s + (p.depositedAmount * (pool?.depositAPY || 0))
      }, 0) / totalDeposited
    : 0

  const hasAnyPosition = depositPositions.length > 0 || borrowPositions.length > 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-data text-2xl font-bold text-[#EAECEF]">Positions</h1>
        <p className="text-sm text-[#848E9C] font-body mt-1">Manage your lending and borrowing positions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0ECB81]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#0ECB81]" />
            </div>
            <div>
              <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Total Supplied</p>
              <p className="font-data text-lg font-bold text-[#EAECEF]">
                {showData
                  ? `$${totalDeposited.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : '••••••'}
              </p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F6465D]/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#F6465D]" />
            </div>
            <div>
              <p className="text-[10px] text-[#848E9C] font-body uppercase tracking-wider">Total Borrowed</p>
              <p className="font-data text-lg font-bold text-[#EAECEF]">
                {showData
                  ? `$${totalBorrowed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : '••••••'}
              </p>
            </div>
          </div>
        </div>
        <div className="metric-card flex items-center justify-center">
          <HealthFactorGauge value={overallHF} showValue={showData} size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Empty state */}
          {!hasAnyPosition && (
            <div className="glass-panel rounded-xl p-10 text-center">
              <Activity className="w-12 h-12 text-[#1E232C] mx-auto mb-4" />
              <p className="font-data text-lg font-semibold text-[#EAECEF] mb-2">No positions yet</p>
              <p className="text-sm text-[#848E9C] font-body">
                Head to <strong>Lend</strong> to deposit assets, then come back here to see and manage your positions.
              </p>
            </div>
          )}

          {/* Lending Positions */}
          {depositPositions.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#0ECB81]" />
                <h2 className="font-data font-semibold text-[#EAECEF]">Lending Positions</h2>
                <span className="ml-auto text-xs text-[#848E9C] font-body">{depositPositions.length} position{depositPositions.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {depositPositions.map((pos) => {
                  const pool = pools.find((p) => p.id === pos.poolId)
                  return (
                    <div key={pos.id} className="p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C] hover:border-[#0ECB81]/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7A600]/20 to-[#7C3AED]/20 flex items-center justify-center">
                            <span className="font-data text-lg">{pool?.icon || '◎'}</span>
                          </div>
                          <div>
                            <p className="font-data text-sm font-medium text-[#EAECEF]">{pos.assetSymbol}</p>
                            <p className="text-[10px] text-[#0ECB81] font-body">+{pool?.depositAPY}% APY</p>
                          </div>
                        </div>
                        {pos.isPrivate && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                            <Lock className="w-3 h-3 text-[#7C3AED]" />
                            <span className="text-[10px] text-[#7C3AED] font-body">Private</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] text-[#848E9C] font-body">Deposited</p>
                          <p className="font-data text-sm font-medium text-[#EAECEF]">
                            {showData
                              ? `${pos.depositedAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pos.assetSymbol}`
                              : '••••••'}
                          </p>
                          <p className="text-[10px] text-[#848E9C] font-body">
                            {showData ? `$${pos.collateralValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••••'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[#848E9C] font-body">Accrued Yield</p>
                          <p className="font-data text-sm font-medium text-[#0ECB81]">
                            {showData
                              ? `+${(pos.depositedAmount * (pool?.depositAPY || 0) / 100 / 365).toFixed(6)} ${pos.assetSymbol}/day`
                              : '•••'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openWithdrawDialog(pos.id)}
                        className="w-full py-2 rounded-lg border border-[#1E232C] text-xs text-[#EAECEF] font-body hover:bg-[#F6465D]/10 hover:border-[#F6465D]/30 hover:text-[#F6465D] transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Borrowing Positions */}
          {borrowPositions.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-[#F6465D]" />
                <h2 className="font-data font-semibold text-[#EAECEF]">Borrowing Positions</h2>
                <span className="ml-auto text-xs text-[#848E9C] font-body">{borrowPositions.length} position{borrowPositions.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {borrowPositions.map((pos) => {
                  const pool    = pools.find((p) => p.id === pos.poolId)
                  const hfStatus = pos.healthFactor >= 1.5 ? 'SAFE' : pos.healthFactor >= 1.1 ? 'WARNING' : 'DANGER'
                  const hfColor  = hfStatus === 'SAFE' ? '#0ECB81' : hfStatus === 'WARNING' ? '#F7A600' : '#F6465D'
                  return (
                    <div key={pos.id} className="p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C] hover:border-[#F6465D]/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7A600]/20 to-[#7C3AED]/20 flex items-center justify-center">
                            <span className="font-data text-lg">{pool?.icon || '◎'}</span>
                          </div>
                          <div>
                            <p className="font-data text-sm font-medium text-[#EAECEF]">{pos.assetSymbol}</p>
                            <p className="text-[10px] text-[#F6465D] font-body">{pool?.borrowAPY}% APY</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pos.isPrivate && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#7C3AED]/10 border border-[#7C3AED]/20">
                              <Lock className="w-3 h-3 text-[#7C3AED]" />
                              <span className="text-[10px] text-[#7C3AED] font-body">Private</span>
                            </div>
                          )}
                          <span className="text-[10px] font-semibold font-data px-2 py-0.5 rounded-full"
                            style={{ color: hfColor, backgroundColor: `${hfColor}15` }}>{hfStatus}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-[#848E9C] font-body">Borrowed</p>
                          <p className="font-data text-sm font-medium text-[#EAECEF]">
                            {showData
                              ? `${pos.borrowedAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${pos.assetSymbol}`
                              : '••••'}
                          </p>
                          <p className="text-[10px] text-[#848E9C] font-body">
                            {showData ? `$${pos.borrowValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••••'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#848E9C] font-body">LTV</p>
                          <p className="font-data text-sm font-medium text-[#EAECEF]">
                            {showData ? `${pos.ltv.toFixed(1)}%` : '•••'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#848E9C] font-body">Health Factor</p>
                          <p className="font-data text-sm font-medium" style={{ color: hfColor }}>
                            {showData ? pos.healthFactor.toFixed(2) : '•••'}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#12161C] border border-[#1E232C] mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#7C3AED]" />
                          <span className="text-xs text-[#848E9C] font-body">Encrypted Health Factor</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                          <span className="text-[10px] text-[#7C3AED] font-body">MPC Protected</span>
                        </div>
                      </div>
                      {hfStatus === 'DANGER' && (
                        <div className="p-3 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/30 mb-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#F6465D] mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-[#F6465D] font-body">
                              At risk of liquidation. Repay debt or add collateral immediately.
                            </p>
                          </div>
                        </div>
                      )}
                      <button onClick={() => openRepayDialog(pos.id)}
                        className="w-full py-2 rounded-lg border border-[#1E232C] text-xs text-[#EAECEF] font-body hover:bg-[#0ECB81]/10 hover:border-[#0ECB81]/30 hover:text-[#0ECB81] transition-colors">
                        Repay
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Privacy Controls</h2>
            <PrivacyToggle isPrivate={isPrivateMode} onToggle={setIsPrivateMode}
              showData={showData} onShowDataToggle={setShowData} />
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Portfolio Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#848E9C] font-body">Net APY</span>
                <span className={`font-data text-sm font-semibold ${netAPY >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {netAPY >= 0 ? '+' : ''}{netAPY.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#848E9C] font-body">Lending Positions</span>
                <span className="font-data text-sm text-[#EAECEF]">{depositPositions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#848E9C] font-body">Borrow Positions</span>
                <span className="font-data text-sm text-[#EAECEF]">{borrowPositions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#848E9C] font-body">Private Positions</span>
                <span className="font-data text-sm text-[#7C3AED]">
                  {[...depositPositions, ...borrowPositions].filter((p) => p.isPrivate).length}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#7C3AED] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-[#EAECEF] font-body mb-2">Encrypted Position Data</h3>
                <p className="text-xs text-[#848E9C] font-body leading-relaxed">
                  Health factor, LTV, and liquidation thresholds are computed through Arcium's MPC network —
                  never exposed on-chain, protecting you from MEV bots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repay Modal */}
      <Modal open={showRepayDialog} onClose={() => setShowRepayDialog(false)} title="Repay Loan">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#848E9C] font-body mb-2 block">Amount to Repay</label>
            <div className="relative">
              <input type="number" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="0.00" className="input-field pr-16" min="0" step="0.01" />
              {selectedPosition && (
                <button onClick={() => {
                  const pos = borrowPositions.find((p) => p.id === selectedPosition)
                  if (pos) setRepayAmount(pos.borrowedAmount.toString())
                }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#F7A600] font-body px-2 py-1 rounded bg-[#F7A600]/10 hover:bg-[#F7A600]/20 transition-colors">
                  MAX
                </button>
              )}
            </div>
          </div>
          <button onClick={handleRepay}
            disabled={loading || !repayAmount || parseFloat(repayAmount) <= 0}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Repay'}
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={showWithdrawDialog} onClose={() => setShowWithdrawDialog(false)} title="Withdraw">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#848E9C] font-body mb-2 block">Amount to Withdraw</label>
            <div className="relative">
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00" className="input-field pr-16" min="0" step="0.01" />
              {selectedPosition && (
                <button onClick={() => {
                  const pos = depositPositions.find((p) => p.id === selectedPosition)
                  if (pos) setWithdrawAmount(pos.depositedAmount.toString())
                }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#F7A600] font-body px-2 py-1 rounded bg-[#F7A600]/10 hover:bg-[#F7A600]/20 transition-colors">
                  MAX
                </button>
              )}
            </div>
          </div>
          <button onClick={handleWithdraw}
            disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            className="w-full py-2.5 rounded-lg border border-[#F6465D]/30 text-[#F6465D] font-semibold font-body hover:bg-[#F6465D]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Withdraw'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
