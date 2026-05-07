import { Shield, ShieldOff, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function PrivacyToggle({ isPrivate, onToggle, showData, onShowDataToggle }) {
  const [animating, setAnimating] = useState(false)

  const handlePrivacyToggle = () => {
    setAnimating(true)
    onToggle(!isPrivate)
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#12161C] border border-[#1E232C]">
        <div className="flex items-center gap-3">
          <div className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-500 ${isPrivate ? 'bg-[#7C3AED]/20' : 'bg-[#1E232C]'}`}>
            {isPrivate
              ? <Lock className={`w-4 h-4 text-[#7C3AED] ${animating ? 'animate-pulse' : ''}`} />
              : <ShieldOff className="w-4 h-4 text-[#848E9C]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#EAECEF] font-body">{isPrivate ? 'Arcium Privacy On' : 'Standard Mode'}</p>
            <p className="text-[10px] text-[#848E9C] font-body">{isPrivate ? 'Encrypted via MPC' : 'Data visible on-chain'}</p>
          </div>
        </div>
        <button onClick={handlePrivacyToggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPrivate ? 'bg-[#7C3AED]' : 'bg-[#1E232C]'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`}>
            {isPrivate && <Shield className="w-3 h-3 absolute top-1 left-1 text-[#7C3AED]" />}
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-[#12161C] border border-[#1E232C]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${showData ? 'bg-[#F7A600]/20' : 'bg-[#1E232C]'}`}>
            {showData ? <Eye className="w-4 h-4 text-[#F7A600]" /> : <EyeOff className="w-4 h-4 text-[#848E9C]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#EAECEF] font-body">{showData ? 'Data Visible' : 'Data Hidden'}</p>
            <p className="text-[10px] text-[#848E9C] font-body">{showData ? 'Sensitive values revealed locally' : 'Values masked with encryption'}</p>
          </div>
        </div>
        <button onClick={() => onShowDataToggle(!showData)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${showData ? 'bg-[#F7A600]' : 'bg-[#1E232C]'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${showData ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {isPrivate && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/20">
          <Shield className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-[#848E9C] font-body leading-relaxed">
            Your transaction parameters are encrypted and processed through Arcium's multi-party
            computation network. No sensitive data is exposed on-chain.
          </p>
        </div>
      )}
    </div>
  )
}
