import { useState, useMemo } from 'react'
import { TrendingUp, Calculator, ArrowRight, CheckCircle, Loader2, Info } from 'lucide-react'
import { useWallet } from '@/contexts/SolanaWalletContext'
import { useLendingProtocol } from '@/hooks/useLendingProtocol'
import { PoolCard } from '@/components/protocol/PoolCard'
import { APYChart } from '@/components/charts/APYChart'
import { PrivacyToggle } from '@/components/protocol/PrivacyToggle'

const PROJECTION_PERIODS = [
  { label: '30 Days', months: 1 },
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
]

const MONTHLY_APY_DATA = [
  { month: 'M1', apy: 3.8 }, { month: 'M2', apy: 4.1 }, { month: 'M3', apy: 4.5 },
  { month: 'M4', apy: 4.3 }, { month: 'M5', apy: 4.7 }, { month: 'M6', apy: 5.1 },
]

export default function LendPage() {
  const { connected } = useWallet()
  const { pools, deposit, loading, isPrivateMode, setIsPrivateMode } = useLendingProtocol()
  const [selectedPool, setSelectedPool] = useState(null)
  const [amount, setAmount] = useState('')
  const [showData, setShowData] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')

  const pool = pools.find((p) => p.id === selectedPool)

  const projectedYields = useMemo(() => {
    if (!pool || !amount) return []
    const depositAmount = parseFloat(amount) || 0
    return PROJECTION_PERIODS.map((period) => {
      const yieldAmt = depositAmount * (pool.depositAPY / 100) * (period.months / 12)
      return { period: period.label, yield: yieldAmt, total: depositAmount + yieldAmt, apy: pool.depositAPY }
    })
  }, [pool, amount])

  const handleDeposit = async () => {
    if (!selectedPool || !amount) return
    try {
      const result = await deposit(selectedPool, parseFloat(amount), isPrivateMode)
      if (result.success) {
        setTxHash(result.txHash || '')
        setShowSuccess(true)
        setAmount('')
      }
    } catch (err) {
      console.error('Deposit failed:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-data text-2xl font-bold text-[#EAECEF]">Lend</h1>
          <p className="text-sm text-[#848E9C] font-body mt-1">Deposit assets to earn yield with Arcium privacy protection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Select Asset Pool</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pools.map((p) => (
                <PoolCard key={p.id} pool={p} onSelect={setSelectedPool} isSelected={selectedPool === p.id} />
              ))}
            </div>
          </div>

          {pool && (
            <div className="glass-panel rounded-xl p-5">
              <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Deposit {pool.symbol}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#848E9C] font-body mb-2 block">Amount</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                      placeholder={`0.00 ${pool.symbol}`} className="input-field pr-20" min="0" step="0.01" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button onClick={() => setAmount('100')}
                        className="text-[10px] text-[#F7A600] font-body px-2 py-1 rounded bg-[#F7A600]/10 hover:bg-[#F7A600]/20 transition-colors">MAX</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[#848E9C] font-body">
                      ≈ ${(parseFloat(amount || '0') * pool.priceUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-[#848E9C] font-body">APY: <span className="text-[#0ECB81] font-semibold">{pool.depositAPY}%</span></p>
                  </div>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="w-4 h-4 text-[#F7A600]" />
                      <span className="text-sm font-medium text-[#EAECEF] font-body">Projected Yield</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {projectedYields.map((proj) => (
                        <div key={proj.period} className="text-center p-3 rounded-lg bg-[#12161C]">
                          <p className="text-[10px] text-[#848E9C] font-body mb-1">{proj.period}</p>
                          <p className="font-data text-sm font-semibold text-[#0ECB81]">+{proj.yield.toFixed(4)} {pool.symbol}</p>
                          <p className="text-[10px] text-[#848E9C] font-body mt-0.5">${proj.yield.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-[#0B0E11]/60 border border-[#1E232C]">
                  <APYChart data={MONTHLY_APY_DATA} color="#0ECB81" height={180} />
                </div>

                <button onClick={handleDeposit}
                  disabled={!connected || !amount || loading || parseFloat(amount) <= 0}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><TrendingUp className="w-4 h-4" />{isPrivateMode ? 'Authorize Private Deposit' : 'Authorize Deposit'}</>}
                </button>

                {!connected && (
                  <p className="text-xs text-[#F7A600] text-center font-body">Connect your wallet to deposit</p>
                )}
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

          {pool && (
            <div className="glass-panel rounded-xl p-5">
              <h2 className="font-data font-semibold text-[#EAECEF] mb-4">Pool Statistics</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Deposited', value: `${pool.totalDeposited.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${pool.symbol}` },
                  { label: 'Total Borrowed', value: `${pool.totalBorrowed.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${pool.symbol}` },
                  { label: 'Utilization', value: `${pool.utilizationRate}%`, color: '#F7A600' },
                  { label: 'Available Liquidity', value: `${(pool.totalDeposited - pool.totalBorrowed).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${pool.symbol}`, color: '#0ECB81' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#848E9C] font-body">{stat.label}</span>
                    <span className="font-data text-sm" style={{ color: stat.color || '#EAECEF' }}>{stat.value}</span>
                  </div>
                ))}
                <div className="w-full h-2 rounded-full bg-[#1E232C] overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0ECB81] to-[#F7A600] transition-all duration-500"
                    style={{ width: `${pool.utilizationRate}%` }} />
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[#848E9C] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-[#EAECEF] font-body mb-1">How Lending Works</h3>
                <p className="text-xs text-[#848E9C] font-body leading-relaxed">
                  Deposit your assets into a liquidity pool to earn yield. Your deposits are protected by
                  over-collateralization. With Arcium privacy mode, your deposit amounts remain encrypted on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E11]/85 backdrop-blur-sm"
          onClick={() => setShowSuccess(false)}>
          <div className="bg-[#12161C] border border-[#1E232C] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[#0ECB81]/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#0ECB81]" />
            </div>
            <h3 className="font-data text-lg font-bold text-[#EAECEF] mb-2">Deposit Successful</h3>
            <p className="text-sm text-[#848E9C] font-body text-center">
              Your deposit has been confirmed and pool shares have been updated.
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
