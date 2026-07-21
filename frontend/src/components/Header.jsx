import { useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import WalletModal from "./WalletModal"

export default function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)

  return (
    <header className="border-b border-white/5 bg-white/[0.02]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-white">GiwaVerify</span>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-400 font-mono">
                  {address.slice(0, 4)}...{address.slice(-3)}
                </span>
              </div>
              <button onClick={disconnect} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </header>
  )
}
