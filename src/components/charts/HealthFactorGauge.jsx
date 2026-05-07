export function HealthFactorGauge({ value, showValue, size = 120 }) {
  const getColor = (hf) => hf >= 1.5 ? '#0ECB81' : hf >= 1.1 ? '#F7A600' : '#F6465D'
  const getLabel = (hf) => hf >= 1.5 ? 'SAFE' : hf >= 1.1 ? 'WARNING' : 'DANGER'

  const strokeWidth = 8
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * Math.PI
  const percentage = Math.min(value / 3, 1)
  const strokeDashoffset = circumference * (1 - percentage)
  const color = getColor(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E232C" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue ? (
            <>
              <span className="font-data text-lg font-bold" style={{ color }}>{value.toFixed(2)}</span>
              <span className="text-[9px] text-[#848E9C] font-body">Health Factor</span>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-3 rounded bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
              <span className="text-[9px] text-[#7C3AED] font-body mt-1">Encrypted</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs font-semibold font-data px-2 py-0.5 rounded-full"
        style={{ color, backgroundColor: `${color}15` }}>
        {getLabel(value)}
      </span>
    </div>
  )
}
