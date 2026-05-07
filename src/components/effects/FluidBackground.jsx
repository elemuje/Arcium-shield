export function FluidBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full
        bg-gradient-radial from-[#7C3AED]/8 to-transparent blur-[120px] animate-pulse-slow" />
      <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full
        bg-gradient-radial from-[#F7A600]/5 to-transparent blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full
        bg-gradient-radial from-[#0ECB81]/4 to-transparent blur-[80px] animate-pulse-slow"
        style={{ animationDelay: '2s' }} />
    </div>
  )
}
