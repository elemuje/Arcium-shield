export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#F7A600] to-[#7C3AED] opacity-20 animate-pulse" />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="relative z-10 p-3">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="lg" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F7A600" /><stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i}
              className="w-2 h-2 rounded-full bg-[#F7A600] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-xs text-[#848E9C] font-body">Loading ArciumShield…</p>
      </div>
    </div>
  )
}
