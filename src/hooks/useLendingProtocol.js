import { useState, useCallback, useEffect } from 'react'
import { arciumEngine } from '@/arcium/ArciumPrivacy'

const MOCK_POOLS = [
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', decimals: 9,
    totalDeposited: 2456789.42, totalBorrowed: 1234567.89, depositAPY: 4.32,
    borrowAPY: 8.76, utilizationRate: 50.2, priceUSD: 145.67, ltv: 75, liquidationThreshold: 80 },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '$', decimals: 6,
    totalDeposited: 5678901.23, totalBorrowed: 3456789.45, depositAPY: 6.54,
    borrowAPY: 10.23, utilizationRate: 60.8, priceUSD: 1.0, ltv: 80, liquidationThreshold: 85 },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮', decimals: 6,
    totalDeposited: 4567890.12, totalBorrowed: 2345678.9, depositAPY: 5.87,
    borrowAPY: 9.45, utilizationRate: 51.4, priceUSD: 1.0, ltv: 80, liquidationThreshold: 85 },
  { id: 'btc', name: 'Wrapped Bitcoin', symbol: 'wBTC', icon: '₿', decimals: 8,
    totalDeposited: 123.45, totalBorrowed: 45.67, depositAPY: 1.23,
    borrowAPY: 5.67, utilizationRate: 37.0, priceUSD: 98456.78, ltv: 70, liquidationThreshold: 75 },
  { id: 'eth', name: 'Wrapped Ethereum', symbol: 'wETH', icon: 'Ξ', decimals: 18,
    totalDeposited: 2345.67, totalBorrowed: 1234.56, depositAPY: 2.34,
    borrowAPY: 6.78, utilizationRate: 52.6, priceUSD: 3456.78, ltv: 75, liquidationThreshold: 80 },
]

export function useLendingProtocol() {
  const [pools] = useState(MOCK_POOLS)
  const [userPositions, setUserPositions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalDeposited, setTotalDeposited] = useState(0)
  const [totalBorrowed, setTotalBorrowed] = useState(0)
  const [netAPY, setNetAPY] = useState(0)
  const [isPrivateMode, setIsPrivateMode] = useState(true)

  useEffect(() => { arciumEngine.initialize().catch(console.error) }, [])

  useEffect(() => {
    const deposited = userPositions.reduce((s, p) => s + p.collateralValue, 0)
    const borrowed = userPositions.reduce((s, p) => s + p.borrowValue, 0)
    setTotalDeposited(deposited)
    setTotalBorrowed(borrowed)
    if (deposited > 0) {
      const weighted = userPositions.reduce((s, p) => {
        const pool = pools.find((x) => x.id === p.poolId)
        if (!pool) return s
        return s + (p.depositedAmount * pool.depositAPY - p.borrowedAmount * pool.borrowAPY)
      }, 0)
      setNetAPY(weighted / deposited)
    }
  }, [userPositions, pools])

  const deposit = useCallback(async (poolId, amount, isPrivate = false) => {
    setLoading(true)
    try {
      const pool = pools.find((p) => p.id === poolId)
      if (!pool) throw new Error('Pool not found')
      await new Promise((r) => setTimeout(r, 1500))
      const newPos = {
        id: `pos_${Date.now()}`,
        poolId, assetSymbol: pool.symbol,
        depositedAmount: amount, borrowedAmount: 0,
        collateralValue: amount * pool.priceUSD, borrowValue: 0,
        healthFactor: 999, ltv: 0, liquidationPrice: 0, netAPY: pool.depositAPY,
      }
      setUserPositions((prev) => {
        const idx = prev.findIndex((p) => p.poolId === poolId && p.borrowedAmount === 0)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx],
            depositedAmount: updated[idx].depositedAmount + amount,
            collateralValue: updated[idx].collateralValue + amount * pool.priceUSD }
          return updated
        }
        return [...prev, newPos]
      })
      const tx = { id: `tx_${Date.now()}`, type: 'deposit', asset: pool.symbol, amount,
        timestamp: Date.now(), status: 'confirmed',
        txHash: `sim_${Math.random().toString(36).substring(2, 15)}`, isPrivate }
      setTransactions((prev) => [tx, ...prev])
      return { success: true, txHash: tx.txHash }
    } finally { setLoading(false) }
  }, [pools])

  const borrow = useCallback(async (poolId, collateralPoolId, amount, isPrivate = false) => {
    setLoading(true)
    try {
      const pool = pools.find((p) => p.id === poolId)
      const collPool = pools.find((p) => p.id === collateralPoolId)
      if (!pool || !collPool) throw new Error('Pool not found')
      if (isPrivate) await new Promise((r) => setTimeout(r, 2000))
      else await new Promise((r) => setTimeout(r, 1200))
      const collPos = userPositions.find((p) => p.poolId === collateralPoolId)
      const collAmt = collPos?.depositedAmount || 0
      const borrowValue = amount * pool.priceUSD
      const collateralValue = collAmt * collPool.priceUSD
      const healthFactor = borrowValue > 0 ? (collateralValue * (pool.liquidationThreshold / 100)) / borrowValue : 999
      const newPos = { id: `pos_${Date.now()}`, poolId, assetSymbol: pool.symbol,
        depositedAmount: 0, borrowedAmount: amount, collateralValue, borrowValue,
        healthFactor, ltv: borrowValue > 0 ? (borrowValue / collateralValue) * 100 : 0,
        liquidationPrice: 0, netAPY: -pool.borrowAPY }
      setUserPositions((prev) => [...prev, newPos])
      const tx = { id: `tx_${Date.now()}`, type: 'borrow', asset: pool.symbol, amount,
        timestamp: Date.now(), status: 'confirmed',
        txHash: `sim_${Math.random().toString(36).substring(2, 15)}`, isPrivate }
      setTransactions((prev) => [tx, ...prev])
      return { success: true, txHash: tx.txHash, healthFactor }
    } finally { setLoading(false) }
  }, [pools, userPositions])

  const repay = useCallback(async (positionId, amount) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      setUserPositions((prev) => prev.map((p) => {
        if (p.id !== positionId) return p
        const pool = pools.find((x) => x.id === p.poolId)
        const newBorrow = Math.max(0, p.borrowedAmount - amount)
        const newBorrowValue = newBorrow * (pool?.priceUSD || 1)
        return { ...p, borrowedAmount: newBorrow, borrowValue: newBorrowValue,
          healthFactor: newBorrowValue > 0 ? p.collateralValue * 0.8 / newBorrowValue : 999,
          ltv: newBorrowValue > 0 ? (newBorrowValue / p.collateralValue) * 100 : 0 }
      }).filter((p) => p.depositedAmount > 0 || p.borrowedAmount > 0))
      const pos = userPositions.find((p) => p.id === positionId)
      const tx = { id: `tx_${Date.now()}`, type: 'repay', asset: pos?.assetSymbol || '',
        amount, timestamp: Date.now(), status: 'confirmed', isPrivate: false }
      setTransactions((prev) => [tx, ...prev])
      return { success: true }
    } finally { setLoading(false) }
  }, [userPositions, pools])

  const withdraw = useCallback(async (poolId, amount) => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      setUserPositions((prev) => {
        const idx = prev.findIndex((p) => p.poolId === poolId && p.borrowedAmount === 0)
        if (idx < 0) return prev
        const updated = [...prev]
        const pool = pools.find((p) => p.id === poolId)
        const newAmt = Math.max(0, updated[idx].depositedAmount - amount)
        updated[idx] = { ...updated[idx], depositedAmount: newAmt,
          collateralValue: newAmt * (pool?.priceUSD || 1) }
        return updated.filter((p) => p.depositedAmount > 0 || p.borrowedAmount > 0)
      })
      const pool = pools.find((p) => p.id === poolId)
      const tx = { id: `tx_${Date.now()}`, type: 'withdraw', asset: pool?.symbol || '',
        amount, timestamp: Date.now(), status: 'confirmed', isPrivate: false }
      setTransactions((prev) => [tx, ...prev])
      return { success: true }
    } finally { setLoading(false) }
  }, [pools])

  return { pools, userPositions, transactions, loading, totalDeposited, totalBorrowed,
    netAPY, isPrivateMode, setIsPrivateMode, deposit, borrow, repay, withdraw }
}
