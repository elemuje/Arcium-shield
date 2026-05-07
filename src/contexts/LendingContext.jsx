import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { arciumEngine } from '@/arcium/ArciumPrivacy'

const MOCK_POOLS = [
  { id: 'sol',  name: 'Solana',           symbol: 'SOL',  icon: '◎', decimals: 9,
    totalDeposited: 2456789.42, totalBorrowed: 1234567.89, depositAPY: 4.32,
    borrowAPY: 8.76,  utilizationRate: 50.2, priceUSD: 145.67,  ltv: 75, liquidationThreshold: 80 },
  { id: 'usdc', name: 'USD Coin',          symbol: 'USDC', icon: '$', decimals: 6,
    totalDeposited: 5678901.23, totalBorrowed: 3456789.45, depositAPY: 6.54,
    borrowAPY: 10.23, utilizationRate: 60.8, priceUSD: 1.0,     ltv: 80, liquidationThreshold: 85 },
  { id: 'usdt', name: 'Tether',            symbol: 'USDT', icon: '₮', decimals: 6,
    totalDeposited: 4567890.12, totalBorrowed: 2345678.9,  depositAPY: 5.87,
    borrowAPY: 9.45,  utilizationRate: 51.4, priceUSD: 1.0,     ltv: 80, liquidationThreshold: 85 },
  { id: 'btc',  name: 'Wrapped Bitcoin',   symbol: 'wBTC', icon: '₿', decimals: 8,
    totalDeposited: 123.45,     totalBorrowed: 45.67,      depositAPY: 1.23,
    borrowAPY: 5.67,  utilizationRate: 37.0, priceUSD: 98456.78, ltv: 70, liquidationThreshold: 75 },
  { id: 'eth',  name: 'Wrapped Ethereum',  symbol: 'wETH', icon: 'Ξ', decimals: 18,
    totalDeposited: 2345.67,    totalBorrowed: 1234.56,    depositAPY: 2.34,
    borrowAPY: 6.78,  utilizationRate: 52.6, priceUSD: 3456.78,  ltv: 75, liquidationThreshold: 80 },
]

const LendingContext = createContext(null)

export function LendingProvider({ children }) {
  const [pools]          = useState(MOCK_POOLS)
  // depositPositions: one entry per pool the user has lent into
  // borrowPositions:  one entry per borrow event
  const [depositPositions, setDepositPositions] = useState([])
  const [borrowPositions,  setBorrowPositions]  = useState([])
  const [transactions,     setTransactions]     = useState([])
  const [loading,          setLoading]          = useState(false)
  const [isPrivateMode,    setIsPrivateMode]    = useState(true)

  useEffect(() => { arciumEngine.initialize().catch(console.error) }, [])

  // ── combined view used by Dashboard / Positions ──────────────────────────
  const userPositions = [
    ...depositPositions,
    ...borrowPositions,
  ]

  const totalDeposited = depositPositions.reduce((s, p) => s + p.collateralValue, 0)
  const totalBorrowed  = borrowPositions.reduce( (s, p) => s + p.borrowValue, 0)
  const netAPY = totalDeposited > 0
    ? depositPositions.reduce((s, p) => {
        const pool = pools.find((x) => x.id === p.poolId)
        return s + (p.depositedAmount * (pool?.depositAPY || 0))
      }, 0) / totalDeposited
    : 0

  // ── deposit ───────────────────────────────────────────────────────────────
  const deposit = useCallback(async (poolId, amount, isPrivate = false) => {
    setLoading(true)
    try {
      const pool = pools.find((p) => p.id === poolId)
      if (!pool) throw new Error('Pool not found')
      await new Promise((r) => setTimeout(r, 1200))

      setDepositPositions((prev) => {
        const idx = prev.findIndex((p) => p.poolId === poolId)
        if (idx >= 0) {
          // accumulate into existing deposit position
          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            depositedAmount:  updated[idx].depositedAmount + amount,
            collateralValue:  updated[idx].collateralValue + amount * pool.priceUSD,
          }
          return updated
        }
        return [...prev, {
          id: `dep_${poolId}_${Date.now()}`,
          poolId,
          assetSymbol:    pool.symbol,
          depositedAmount: amount,
          borrowedAmount:  0,
          collateralValue: amount * pool.priceUSD,
          borrowValue:     0,
          healthFactor:    999,
          ltv:             0,
          liquidationPrice: 0,
          netAPY:          pool.depositAPY,
          isPrivate,
        }]
      })

      const tx = {
        id: `tx_${Date.now()}`, type: 'deposit', asset: pool.symbol, amount,
        timestamp: Date.now(), status: 'confirmed',
        txHash: `sim_${Math.random().toString(36).substring(2, 10)}`, isPrivate,
      }
      setTransactions((prev) => [tx, ...prev])
      return { success: true, txHash: tx.txHash }
    } finally { setLoading(false) }
  }, [pools])

  // ── borrow ────────────────────────────────────────────────────────────────
  const borrow = useCallback(async (poolId, collateralPoolId, amount, isPrivate = false) => {
    setLoading(true)
    try {
      const pool     = pools.find((p) => p.id === poolId)
      const collPool = pools.find((p) => p.id === collateralPoolId)
      if (!pool || !collPool) throw new Error('Pool not found')

      // use functional update so we read fresh depositPositions
      let collAmt = 0
      setDepositPositions((prev) => {
        const pos = prev.find((p) => p.poolId === collateralPoolId)
        collAmt = pos?.depositedAmount || 0
        return prev  // no change, just reading
      })

      if (isPrivate) await new Promise((r) => setTimeout(r, 2000))
      else           await new Promise((r) => setTimeout(r, 1200))

      const borrowValue     = amount * pool.priceUSD
      const collateralValue = collAmt  * collPool.priceUSD
      const healthFactor    = borrowValue > 0
        ? (collateralValue * (pool.liquidationThreshold / 100)) / borrowValue
        : 999
      const ltv = collateralValue > 0 ? (borrowValue / collateralValue) * 100 : 0

      setBorrowPositions((prev) => [...prev, {
        id: `brw_${poolId}_${Date.now()}`,
        poolId,
        assetSymbol:    pool.symbol,
        depositedAmount: 0,
        borrowedAmount:  amount,
        collateralValue,
        borrowValue,
        healthFactor,
        ltv,
        liquidationPrice: 0,
        netAPY: -pool.borrowAPY,
        isPrivate,
      }])

      const tx = {
        id: `tx_${Date.now()}`, type: 'borrow', asset: pool.symbol, amount,
        timestamp: Date.now(), status: 'confirmed',
        txHash: `sim_${Math.random().toString(36).substring(2, 10)}`, isPrivate,
      }
      setTransactions((prev) => [tx, ...prev])
      return { success: true, txHash: tx.txHash, healthFactor }
    } finally { setLoading(false) }
  }, [pools])

  // ── repay ─────────────────────────────────────────────────────────────────
  const repay = useCallback(async (positionId, amount) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      setBorrowPositions((prev) => prev
        .map((p) => {
          if (p.id !== positionId) return p
          const pool        = pools.find((x) => x.id === p.poolId)
          const newBorrow   = Math.max(0, p.borrowedAmount - amount)
          const newBorrowV  = newBorrow * (pool?.priceUSD || 1)
          return {
            ...p,
            borrowedAmount: newBorrow,
            borrowValue:    newBorrowV,
            healthFactor:   newBorrowV > 0 ? (p.collateralValue * 0.8) / newBorrowV : 999,
            ltv:            newBorrowV > 0 ? (newBorrowV / p.collateralValue) * 100 : 0,
          }
        })
        .filter((p) => p.borrowedAmount > 0)
      )
      const pos = borrowPositions.find((p) => p.id === positionId)
      setTransactions((prev) => [{
        id: `tx_${Date.now()}`, type: 'repay', asset: pos?.assetSymbol || '',
        amount, timestamp: Date.now(), status: 'confirmed', isPrivate: false,
      }, ...prev])
      return { success: true }
    } finally { setLoading(false) }
  }, [pools, borrowPositions])

  // ── withdraw ──────────────────────────────────────────────────────────────
  const withdraw = useCallback(async (poolId, amount) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      setDepositPositions((prev) => prev
        .map((p) => {
          if (p.poolId !== poolId) return p
          const pool   = pools.find((x) => x.id === poolId)
          const newAmt = Math.max(0, p.depositedAmount - amount)
          return { ...p, depositedAmount: newAmt, collateralValue: newAmt * (pool?.priceUSD || 1) }
        })
        .filter((p) => p.depositedAmount > 0)
      )
      const pool = pools.find((p) => p.id === poolId)
      setTransactions((prev) => [{
        id: `tx_${Date.now()}`, type: 'withdraw', asset: pool?.symbol || '',
        amount, timestamp: Date.now(), status: 'confirmed', isPrivate: false,
      }, ...prev])
      return { success: true }
    } finally { setLoading(false) }
  }, [pools])

  const value = {
    pools,
    userPositions,
    depositPositions,
    borrowPositions,
    transactions,
    loading,
    totalDeposited,
    totalBorrowed,
    netAPY,
    isPrivateMode,
    setIsPrivateMode,
    deposit,
    borrow,
    repay,
    withdraw,
  }

  return <LendingContext.Provider value={value}>{children}</LendingContext.Provider>
}

export function useLendingProtocol() {
  const ctx = useContext(LendingContext)
  if (!ctx) throw new Error('useLendingProtocol must be used inside <LendingProvider>')
  return ctx
}
