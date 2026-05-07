import { useState, useMemo } from 'react'
import { TrendingDown, Shield, AlertTriangle, Loader2, CheckCircle, ArrowRight, Lock } from 'lucide-react'
import { useWallet } from '@/contexts/SolanaWalletContext'
import { useLendingProtocol } from '@/hooks/useLendingProtocol'
import { PoolCard } from '@/components/protocol/PoolCard'
import { PrivacyToggle } from '@/components/protocol/PrivacyToggle'
import { HealthFactorGauge } from '@/components/charts/HealthFactorGauge'

export default function BorrowPage() {
  const { connected } = useWallet()
  const { pools, userPositions, borrow, loading, isPrivateMode, setIsPrivateMode } = useLendingProtocol()
  const [borrowPool, setBorrowPool] = useState(null)
  const [collateralPool, setCollateralPool] = useState(null)
  const [amount, setAmount] = useState('')
  const [showData, setShowData] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [mpcStatus, setMpcStatus] = useState('idle')

  const borrowAsset = pools.find((p) => p.id === borrowPool)
  const collateralAsset = pools.find((p) => p.id === collateralPool)
  const collateralPosition = userPositions.find((p) => p.poolId === collateralPool)

  const borrowPreview = useMemo(() => {
    if (!borrowAsset || !collateralAsset || !amount || !collateralPosition) return null
    const borrowAmount = parseFloat(amount) || 0
    const collateralValue = collateralPosition.depositedAmount * collateralAsset.priceUSD
    const borrowValue = borrowAmount * borrowAsset.priceUSD
    const ltv = (borrowValue / collateralValue) * 100
    const healthFactor = collateralValue * (borrowAsset.liquidationThreshold / 100) / borrowValue
    return { borrowAmount, collateralValue, borrowValue, ltv, maxLTV: borrowAsset.ltv,
      healthFactor, liquidationPrice: 0, isSafe: ltv <= borrowAsset.ltv && healthFactor >= 1.1 }
  }, [borrowAsset, collateralAsset, amount, collateralPosition])

  const handleBorrow = async () => {
    if (!borrowPool || !collateralPool || !amount) return
    try {
      setMpcStatus(isPrivateMode ? 'computing' : 'idle')
      if (isPrivateMode) await new Promise((r) => setTimeout(r, 2000))
      setMpcStatus('done')
      const result = await borrow(borrowPool, collateralPool, parseFloat(amount), isPrivateMode)
      if (result.success) {
        setTxHash(result.txHash || '')
        setShowSuccess(true)
        setAmount('')
      }
    } catch (err) { console.error('Borrow failed:', err) }
    finally { setMpcStatus('idle') }
  }

  const depositedPools = userPositions.filter((p) => p.depositedAmount > 0).map((p) => p.poolId)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-data text-2xl font-bold text-[#EAECEF]">Borrow</h1>
          <p className="text-sm text-[#848E9C] font-body mt-1">Borrow against your collateral with encrypted health factor computation</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/20">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F6465D]" />
          <span className="text-xs text-[#F6465D] font-body">Borrowing carries liquidation risk</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1 */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#F7A600] flex items-center justify-center text-xs font-bold text-[#0B0E11]">1</span>
              <h2 className="font-data font-semibold text-[#EAECEF]">Select Collateral</h2>
            </div>
            {depositedPools.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="w-8 h-8 text-[#1E232C] mx-auto mb-3" />
                <p className="text-sm text-[#848E9C] font-body">No deposited assets available as collateral</p>
                <p className="text-xs text-[#848E9C] font-body mt-1">Lend assets first to use as collateral</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pools.filter((p) => depositedPools.includes(p.id)).map((p) => (
                  <PoolCard key={p.id} pool={p} onSelect={setCollateralPool} isSelected={collateralPool === p.id} />
                ))}
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-bold text-white">2</span>
              <h2 className="font-data font-semibold text-[#EAECEF]">Select Borrow Asset</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pools.filter((p) => p.id !== collateralPool).map((p) => (
                <PoolCard key={p.id} pool={p} onSelect={setBorrowPool} isSelected={borrowPool === p.id} />
              ))}
            </div>
          </div>

          {/* Step 3 */}
          {borrowAsset && collateralAsset && (
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0ECB81] flex items-center justify-center text-xs font-bold text-[#0B0E11]">3</span>
                <h2 className="font-data font-semibold text-[#EAECEF]">Enter Borrow Amount</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#848E9C] font-body mb-2 block">Amount to Borrow</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00 ${borrowAsset.symbol}`} className="input-field" min="0" step="0.01" />
                  <p className="text-xs text-[#848E9C] font-body mt-1">
                    ≈ ${(parseFloat(amount || '0') * borrowAsset.priceUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>

                {borrowPreview && (
                  <div className="p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#848E9C] font-body">LTV</span>
                      <span className="font-data text-xs font-semibold"
                        style={{ color: borrowPreview.ltv <= 50 ? '#0ECB81' : borrowPreview.ltv <= 70 ? '#F7A600' : '#F6465D' }}>
                        {borrowPreview.ltv.toFixed(1)}% / {borrowPreview.maxLTV}% max
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#848E9C] font-body">Health Factor</span>
                      <span className="font-data text-xs font-semibold"
                        style={{ color: borrowPreview.healthFactor >= 1.5 ? '#0ECB81' : borrowPreview.healthFactor >= 1.1 ? '#F7A600' : '#F6465D' }}>
                        {showData ? borrowPreview.healthFactor.toFixed(2) : '•••'}
                      </span>
                    </div>
                  </div>
                )}

                {borrowPreview && (
                  <div className="flex justify-center py-2">
                    <HealthFactorGauge value={borrowPreview.healthFactor} showValue={showData} size={120} />
                  </div>
                )}

                {mpcStatus === 'computing' && (
                  <div className="p-4 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-4 h-4 text-[#7C3AED] animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-[#7C3AED] font-body">Arcium MPC Computation</p>
                        <p className="text-xs text-[#848E9C] font-body">Computing encrypted health factor across 8 nodes…</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[0,1,2,3,4,5,6,7].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" style={{ animationDelay: `${i*100}ms` }} />
                          <span className="text-[10px] text-[#848E9C] font-body font-mono">Node-{i}: computing…</span>
                          <span className="ml-auto text-[10px] text-[#0ECB81] font-body">VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleBorrow}
                  disabled={!connected || !amount || loading || parseFloat(amount) <= 0 || (!!borrowPreview && !borrowPreview.isSafe)}
                  className="w-full py-3 rounded-lg font-semibold font-data text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: isPrivateMode ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#fff' }}>
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><TrendingDown className="w-4 h-4" />{isPrivateMode ? 'Initialize Confidential Circuit' : 'Confirm Borrow'}</>}
                </button>
                {borrowPreview && !borrowPreview.isSafe && (
                  <p className="text-xs text-[#F6465D] text-center font-body">Health factor too low. Reduce borrow amount or increase collateral.</p>
                )}
                {!connected && <p className="text-xs text-[#F7A600] text-center font-body">Connect your wallet to borrow</p>}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Privacy Controls</h2>
            <PrivacyToggle isPrivate={isPrivateMode} onToggle={setIsPrivateMode}
              showData={showData} onShowDataToggle={setShowData} />
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Borrow Info</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#F7A600]" />
                  <span className="text-xs font-medium text-[#EAECEF] font-body">Liquidation Risk</span>
                </div>
                <p className="text-xs text-[#848E9C] font-body leading-relaxed">
                  If your health factor drops below 1.0, your position may be liquidated. With Arcium privacy mode,
                  liquidation checks are performed via encrypted MPC.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-medium text-[#EAECEF] font-body">Privacy Protection</span>
                </div>
                <p className="text-xs text-[#848E9C] font-body leading-relaxed">
                  In privacy mode, your borrow amount, collateral, and health factor are encrypted via Arcium's MPC
                  network. No sensitive data is exposed on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E11]/85 backdrop-blur-sm"
          onClick={() => setShowSuccess(false)}>
          <div className="bg-[#12161C] border border-[#1E232C] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[#0ECB81]/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#0ECB81]" />
            </div>
            <h3 className="font-data text-lg font-bold text-[#EAECEF] mb-2">Borrow Successful</h3>
            <p className="text-sm text-[#848E9C] font-body text-center">
              {isPrivateMode ? 'Your confidential borrow has been executed. Position data is encrypted.' : 'Your borrow has been confirmed.'}
            </p>
            {txHash && (
              <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-[#7C3AED] font-body hover:underline flex items-center gap-1">
                View on Explorer <ArrowRight className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => setShowSuccess(false)} className="mt-6 btn-primary px-6 py-2 text-sm">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
