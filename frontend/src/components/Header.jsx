import { useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import WalletModal from "./WalletModal"

export default function Header({ theme, onToggleTheme }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)

  return (
    <header className="border-b backdrop-blur-sm sticky top-0 z-40" style={{ borderColor: "var(--border-header)", backgroundColor: "var(--bg-header)" }}>
      <div className="px-6 md:px-12 lg:px-20 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span className="font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>GiwaVerify</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg transition-all"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {theme === "dark" ? (
                <>
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              )}
            </svg>
          </button>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--text-accent)" }} />
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {address.slice(0, 4)}...{address.slice(-3)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="text-xs transition-colors font-medium"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </header>
  )
}
