import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useConnect } from "wagmi"

const wallets = [
  {
    id: "metaMask",
    name: "MetaMask",
    icon: (
      <svg viewBox="0 0 35 33" fill="none" className="w-7 h-7">
        <path d="M32.958 1L19.814 10.87l2.442-5.8L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
        <path d="M2.003 1l13.08 9.935-2.38-5.864L2.004 1z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M28.19 23.594l-3.5 5.354 7.49 2.058 2.148-7.296-6.138-.116z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M1.703 23.71l2.137 7.296 7.49-2.058-3.5-5.354-6.127.116z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M10.796 14.424l-2.086 3.16 7.424.344-.295-7.998-5.043 4.494z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M24.166 14.424l-5.085-4.55-.232 8.054 7.403-.344-2.086-3.16z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M11.13 28.948l4.48-2.168-3.864-3.02-.616 5.188z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M19.352 26.78l4.48 2.168-.616-5.188-3.864 3.02z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M23.832 28.948l-4.48-2.168.358 2.88-.038 1.22 4.16-1.932z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25"/>
        <path d="M11.13 28.948l4.16 1.932-.027-1.22.347-2.88-4.48 2.168z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25"/>
        <path d="M15.385 21.586l-3.726-1.092 2.634-1.203 1.092 2.295z" fill="#233447" stroke="#233447" strokeWidth="0.25"/>
        <path d="M19.577 21.586l1.092-2.295 2.645 1.203-3.737 1.092z" fill="#233447" stroke="#233447" strokeWidth="0.25"/>
        <path d="M11.13 28.948l.648-5.355-4.19-.116 3.542 5.471z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
        <path d="M23.185 23.593l.647 5.355 3.542-5.471-4.19.116z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
        <path d="M24.166 14.424l-2.355 4.585 2.998 1.45 4.036-.527-4.679-5.508z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
        <path d="M10.796 14.424l-4.69 5.508 4.047.527 2.987-1.45-2.344-4.585z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25"/>
        <path d="M7.598 19.009l4.047.527.99-4.216-5.037 3.689z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
        <path d="M22.355 19.009l.99-4.216 4.036.527-5.026 3.689z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
        <path d="M13.645 19.536l-.99-4.216.809-4.585h-3.864l-5.796 6.778 4.047.527 2.987-1.45-.193 2.946z" fill="#E27525" stroke="#E27525" strokeWidth="0.25"/>
        <path d="M21.317 19.536l-2.987 1.45-.193-2.945 2.987 1.45.193.045z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
        <path d="M21.51 18.636l-2.998-1.45.237-1.012h-3.448l.237 1.012-2.998 1.45 1.092 2.295.616 3.924h3.864l.616-3.924 1.092-2.295z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25"/>
        <path d="M19.577 21.586l-.616 3.924h-3.864l-.616-3.924-1.092 2.295 1.718 1.45h3.864l1.718-1.45-1.092-2.295z" fill="#161616" stroke="#161616" strokeWidth="0.25"/>
        <path d="M22.355 19.009l.193 2.945-2.971-1.408 2.778-1.537z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25"/>
        <path d="M10.412 21.954l-2.987-1.45.193-2.945 2.794 1.537v2.858z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25"/>
        <path d="M20.866 23.851l-1.718 1.45h-3.864l-1.718-1.45.358-2.88 2.634-1.092h3.316l2.634 1.092.358 2.88z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25"/>
      </svg>
    ),
  },
  {
    id: "okxWallet",
    name: "OKX Wallet",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect width="40" height="40" rx="10" fill="#1A80F8"/>
        <path d="M12 12h4v4h-4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM12 18h4v4h-4v-4zm12 0h4v4h-4v-4zM12 24h4v4h-4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" fill="white"/>
      </svg>
    ),
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect width="40" height="40" rx="8" fill="#48D1A0"/>
        <path d="M20 8c-2.5 0-4.5 2-4.5 4.5v2h-2A2.5 2.5 0 0011 17v12a2.5 2.5 0 002.5 2.5h13A2.5 2.5 0 0029 29V17a2.5 2.5 0 00-2.5-2.5h-2v-2c0-2.5-2-4.5-4.5-4.5zm-2 6.5v-2a2 2 0 114 0v2h-4z" fill="white"/>
      </svg>
    ),
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect width="40" height="40" rx="8" fill="#AB9FF2"/>
        <path d="M26 14.5c-3.3 0-6 2.7-6 6v8h4v-8c0-1.1.9-2 2-2s2 .9 2 2v8h4v-8c0-3.3-2.7-6-6-6z" fill="white"/>
        <path d="M14 18.5c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z" fill="white" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "coinbaseWallet",
    name: "Coinbase",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect width="40" height="40" rx="8" fill="#0052FF"/>
        <path d="M20 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 8.5h-7c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h7c.3 0 .5.2.5.5s-.2.5-.5.5z" fill="white"/>
      </svg>
    ),
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
        <rect width="40" height="40" rx="8" fill="#3396FF"/>
        <path d="M13.5 15.5c3.5-3.4 9.5-3.4 13 0l.4.4c.2.2.2.5 0 .7l-1.5 1.4c-.2.2-.5.2-.7 0l-.4-.4c-2.5-2.4-6.5-2.4-9 0l-.4.4c-.2.2-.5.2-.7 0l-1.5-1.4c-.2-.2-.2-.5 0-.7l.4-.4zm16 3l1.3 1.3c.2.2.2.5 0 .7l-6 5.9c-.2.2-.5.2-.7 0l-4.3-4.2c-.1-.1-.2-.1-.3 0l-4.3 4.2c-.2.2-.5.2-.7 0l-6-5.9c-.2-.2-.2-.5 0-.7l1.3-1.3c.2-.2.5-.2.7 0l4.3 4.2c.1.1.2.1.3 0l4.3-4.2c.2-.2.5-.2.7 0l4.3 4.2c.1.1.2.1.3 0l4.3-4.2c.2-.2.5-.2.7 0z" fill="white"/>
      </svg>
    ),
  },
]

export default function WalletModal({ onClose }) {
  const { connect, connectors } = useConnect()
  const overlayRef = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  function handleConnect(walletId) {
    const connector = connectors.find((c) => c.id === walletId)
    if (!connector) return
    connect({ connector })
    onClose()
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-overlay)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="rounded-2xl p-6 w-80 shadow-2xl animate-scale"
        style={{ backgroundColor: "var(--bg-modal)", border: "1px solid var(--border-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Connect Wallet</h2>
          <button
            onClick={onClose}
            className="transition-colors p-1"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {wallets.map((w) => {
            const available = connectors.some((c) => c.id === w.id)
            if (!available) return null
            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w.id)}
                className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium transition-all border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-card)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-card-hover)"
                  e.currentTarget.style.borderColor = "var(--border-card-hover)"
                  e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-card)"
                  e.currentTarget.style.borderColor = "var(--border-card)"
                  e.currentTarget.style.color = "var(--text-secondary)"
                }}
              >
                {w.icon}
                <span className="text-xs">{w.name}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-center mt-5" style={{ color: "var(--text-secondary)" }}>
          New to Web3? Install MetaMask or OKX Wallet
        </p>
      </div>
    </div>,
    document.body
  )
}
