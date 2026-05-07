import { TrendingUp, TrendingDown, Layers } from 'lucide-react'

export function PoolCard({ pool, onSelect, isSelected }) {
  return (
    <button onClick={() => onSelect(pool.id)}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
        isSelected
          ? 'border-[#F7A600]/40 bg-[#F7A600]/5'
          : 'border-[#1E232C] bg-[#12161C]/60 hover:border-[#7C3AED]/30 hover:bg-[#1A1F28]'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7A600]/20 to-[#7C3AED]/20 flex items-center justify-center">
            <span className="font-data text-lg">{pool.icon}</span>
          </div>
          <div>
            <h3 className="font-data font-semibold text-[#EAECEF] text-sm">{pool.name}</h3>
            <p className="text-xs text-[#848E9C] font-body">{pool.symbol}</p>
          </div>
        </div>
        <span className="text-xs font-body text-[#848E9C]">${pool.priceUSD.toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-[#0ECB81]" />
            <span className="text-[10px] text-[#848E9C] font-body">Deposit APY</span>
          </div>
          <p className="font-data text-sm font-semibold text-[#0ECB81]">{pool.depositAPY.toFixed(2)}%</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-[#F6465D]" />
            <span className="text-[10px] text-[#848E9C] font-body">Borrow APY</span>
          </div>
          <p className="font-data text-sm font-semibold text-[#F6465D]">{pool.borrowAPY.toFixed(2)}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#848E9C]" />
          <span className="text-[10px] text-[#848E9C] font-body">
            ${(pool.totalDeposited * pool.priceUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })} TVL
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#848E9C] font-body">Utilization</span>
          <div className="w-16 h-1.5 rounded-full bg-[#1E232C] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pool.utilizationRate}%`,
                backgroundColor: pool.utilizationRate > 80 ? '#F6465D' : pool.utilizationRate > 50 ? '#F7A600' : '#0ECB81',
              }} />
          </div>
          <span className="text-[10px] font-data text-[#EAECEF]">{pool.utilizationRate.toFixed(0)}%</span>
        </div>
      </div>
    </button>
  )
}
