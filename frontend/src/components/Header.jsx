import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAccount, useDisconnect } from "wagmi"
import WalletModal from "./WalletModal"

export default function Header({ theme, onToggleTheme, onConnectRequest }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b backdrop-blur-sm sticky top-0 z-40" style={{ borderColor: "var(--border-header)", backgroundColor: "var(--bg-header)" }}>
      <div className="px-6 md:px-12 lg:px-20 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>GiwaVerify</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link text-base transition-all duration-150 pb-1 ${isActive ? "font-semibold nav-active" : "font-medium"}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/faucet"
              className={({ isActive }) =>
                `nav-link text-base transition-all duration-150 pb-1 ${isActive ? "font-semibold nav-active" : "font-medium"}`
              }
            >
              Faucet
            </NavLink>
            <NavLink
              to="/swap"
              className={({ isActive }) =>
                `nav-link text-base transition-all duration-150 pb-1 ${isActive ? "font-semibold nav-active" : "font-medium"}`
              }
            >
              Swap
            </NavLink>
            <NavLink
              to="/governance"
              className={({ isActive }) =>
                `nav-link text-base transition-all duration-150 pb-1 ${isActive ? "font-semibold nav-active" : "font-medium"}`
              }
            >
              Governance
            </NavLink>
          </nav>

          <style>{`
            .nav-link {
              color: var(--text-dim);
              border-bottom: 2px solid transparent;
            }
            .nav-link:hover {
              color: var(--text-primary) !important;
            }
            .nav-link.nav-active {
              color: var(--text-primary) !important;
              border-bottom-color: var(--text-primary);
            }
            .nav-link.nav-active:hover {
              color: var(--text-primary) !important;
            }
          `}</style>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle theme"
            className="relative rounded-full shrink-0 transition-all duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-[var(--text-accent)]"
            style={{ width: 68, height: 34, backgroundColor: theme === "dark" ? "#2a2a2e" : "#e8e8ec" }}
          >
            {/* faint inactive icon on the track */}
            <span
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ [theme === "dark" ? "left" : "right"]: 8 }}
            >
              {theme === "dark" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </span>

            {/* sliding white thumb with active icon */}
            <span
              className="absolute top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-transform duration-200 ease-in-out pointer-events-none"
              style={{
                width: 28,
                height: 28,
                backgroundColor: "#ffffff",
                transform: `translateX(${theme === "dark" ? 36 : 4}px)`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              {theme === "dark" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1" stroke="none" strokeWidth="0">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </span>
          </button>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--text-accent)" }} />
                <span className="text-base font-mono" style={{ color: "var(--text-muted)" }}>
                  {address.slice(0, 4)}...{address.slice(-3)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="text-base transition-colors font-medium"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectRequest}
              className="btn-primary px-5 py-2 rounded-lg text-base font-medium"
            >
              Connect Wallet
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--text-dim)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 6h18M3 12h18M3 18h18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-3 flex flex-col gap-1" style={{ borderColor: "var(--border-header)", backgroundColor: "var(--bg-header)" }}>
          <NavLink to="/" end onClick={() => setMobileOpen(false)}
            className="text-base font-medium py-2 px-3 rounded-lg"
            style={({ isActive }) => ({ color: isActive ? "var(--text-primary)" : "var(--text-dim)", backgroundColor: isActive ? "var(--bg-card)" : "transparent" })}
          >Home</NavLink>
          <NavLink to="/faucet" onClick={() => setMobileOpen(false)}
            className="text-base font-medium py-2 px-3 rounded-lg"
            style={({ isActive }) => ({ color: isActive ? "var(--accent-faucet)" : "var(--text-dim)", backgroundColor: isActive ? "var(--accent-faucet-soft)" : "transparent" })}
          >Faucet</NavLink>
          <NavLink to="/swap" onClick={() => setMobileOpen(false)}
            className="text-base font-medium py-2 px-3 rounded-lg"
            style={({ isActive }) => ({ color: isActive ? "var(--accent-p2p)" : "var(--text-dim)", backgroundColor: isActive ? "var(--accent-p2p-soft)" : "transparent" })}
          >Swap</NavLink>
          <NavLink to="/governance" onClick={() => setMobileOpen(false)}
            className="text-base font-medium py-2 px-3 rounded-lg"
            style={({ isActive }) => ({ color: isActive ? "var(--accent-vote)" : "var(--text-dim)", backgroundColor: isActive ? "var(--accent-vote-soft)" : "transparent" })}
          >Governance</NavLink>
        </div>
      )}
    </header>
  )
}
