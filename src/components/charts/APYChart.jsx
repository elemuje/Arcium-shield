import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function APYChart({ data, color = '#F7A600', height = 200 }) {
  const gradId = `gradient-${color.replace('#', '')}`
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E232C" vertical={false} />
          <XAxis dataKey="month" stroke="#848E9C"
            tick={{ fill: '#848E9C', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={{ stroke: '#1E232C' }} tickLine={false} />
          <YAxis stroke="#848E9C"
            tick={{ fill: '#848E9C', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12161C', border: '1px solid #1E232C', borderRadius: '8px', fontSize: '12px', fontFamily: 'Space Grotesk' }}
            labelStyle={{ color: '#848E9C' }}
            formatter={(value) => [`${Number(value).toFixed(2)}%`, 'APY']} />
          <Area type="monotone" dataKey="apy" stroke={color} strokeWidth={2}
            fill={`url(#${gradId})`} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
