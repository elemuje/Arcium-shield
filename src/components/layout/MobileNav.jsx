import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, TrendingDown, Shield } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lend', label: 'Lend', icon: TrendingUp },
  { path: '/borrow', label: 'Borrow', icon: TrendingDown },
  { path: '/positions', label: 'Positions', icon: Shield },
]

export function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B0E11]/95 border-t border-[#1E232C] backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-[#F7A600]' : 'text-[#848E9C]'
              }`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-body">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
