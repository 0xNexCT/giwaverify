import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useConnect } from "wagmi"

const wallets = [
  {
    id: "metaMask",
    name: "MetaMask",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path fill="#FF5C16" d="m18.9 18.925-3.434-.993-2.59 1.504h-1.807l-2.592-1.504-3.433.993L4 15.5l1.044-3.802L4 8.484 5.044 4.5l5.365 3.114h3.127L18.9 4.5l1.045 3.984-1.045 3.214 1.045 3.802z"/>
        <path fill="#FF5C16" d="m5.045 4.5 5.364 3.116-.213 2.14zm3.433 11.001 2.36 1.747-2.36.684zm2.172-2.888-.454-2.856-2.904 1.942h-.001l.009 2 1.177-1.086zM18.9 4.5l-5.364 3.116.213 2.14zm-3.433 11.001-2.36 1.747 2.36.684zm1.187-3.801v-.002h-.001l-2.904-1.941-.453 2.856h2.171l1.178 1.086z"/>
        <path fill="#E34807" d="m8.477 17.932-3.433.993L4 15.501h4.477zm2.172-5.32.656 4.13-.91-2.297-3.097-.746 1.178-1.087zm4.818 5.32 3.433.993 1.045-3.424h-4.478zm-2.171-5.32-.656 4.13.909-2.297 3.097-.746-1.179-1.087z"/>
        <path fill="#FF8D5D" d="m4 15.5 1.044-3.802H7.29l.008 2 3.098.747.909 2.296-.468.505-2.36-1.747zm15.945 0L18.9 11.698h-2.245l-.009 2-3.097.747-.909 2.296.467.505 2.36-1.747zm-6.409-7.886h-3.127l-.213 2.139 1.109 6.985h1.335l1.11-6.985z"/>
        <path fill="#661800" d="M5.044 4.5 4 8.484l1.044 3.214H7.29l2.905-1.943zM10 13.441H8.982l-.553.528 1.967.474zM18.9 4.5l1.045 3.984-1.045 3.214h-2.245l-2.906-1.943zm-4.954 8.941h1.02l.553.529-1.97.475zm-1.071 4.632.232-.825-.467-.506h-1.336l-.467.506.232.825"/>
        <path fill="#C0C4CD" d="M12.875 18.073v1.364h-1.806v-1.364z"/>
        <path fill="#E7EBF6" d="m8.478 17.93 2.592 1.506v-1.363l-.232-.826zm6.99 0-2.593 1.506v-1.363l.232-.826z"/>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect width="24" height="24" rx="5" fill="#48D1A0"/>
        <path fill="#fff" d="M19.918 13.04c.629-1.461-2.478-5.543-5.446-7.243-1.87-1.317-3.82-1.136-4.215-.558-.866 1.27 2.869 2.345 5.367 3.6a2.9 2.9 0 0 0-1.34 1.235c-.932-1.058-2.976-1.969-5.375-1.235-1.616.495-2.96 1.66-3.479 3.422a1 1 0 0 0-.412-.091c-.562 0-1.018.474-1.018 1.059s.456 1.059 1.018 1.059c.104 0 .43-.073.43-.073l5.204.04c-2.082 3.435-3.726 3.937-3.726 4.532s1.573.434 2.164.212c2.83-1.062 5.868-4.372 6.389-5.325 2.19.284 4.03.318 4.44-.634"/>
        <path fill="#fff" fill-rule="evenodd" d="M15.624 8.839c.116-.048.097-.225.066-.365-.073-.321-1.334-1.617-2.518-2.197-1.614-.791-2.802-.75-2.978-.386.329.701 1.853 1.36 3.444 2.047.679.293 1.37.591 1.986.901"/>
        <path fill="#fff" fill-rule="evenodd" d="M13.576 15.894a9 9 0 0 0-1.114-.357c.447-.832.541-2.064.119-2.843-.592-1.092-1.336-1.674-3.063-1.674-.95 0-3.508.333-3.554 2.555q-.008.349.016.644l4.672.035a16.7 16.7 0 0 1-1.736 2.397c.62.165 1.131.304 1.601.431.446.121.854.232 1.28.345a20 20 0 0 0 1.78-1.533"/>
        <path fill="#B7E6C5" d="M5.368 13.99c.19 1.688 1.113 2.35 2.997 2.545 1.884.196 2.964.065 4.403.201 1.202.114 2.275.751 2.673.53.358-.197.157-.913-.322-1.372-.621-.596-1.481-1.01-2.994-1.157.301-.859.217-2.063-.251-2.719-.678-.947-1.927-1.376-3.51-1.189-1.652.196-3.235 1.043-2.996 3.161"/>
      </svg>
    ),
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect width="24" height="24" rx="5" fill="#AB9FF2"/>
        <path fill="#fff" d="M5.893 18.4c2.042 0 3.576-1.706 4.492-3.054a2.5 2.5 0 0 0-.173.883c0 .787.47 1.348 1.398 1.348 1.275 0 2.636-1.074 3.341-2.23q-.075.25-.074.464c0 .55.322.895.978.895 2.066 0 4.145-3.52 4.145-6.597C20 7.711 18.738 5.6 15.57 5.6 10.002 5.6 4 12.137 4 16.36c0 1.658.928 2.04 1.893 2.04m7.759-8.553c0-.597.347-1.014.854-1.014.495 0 .841.417.841 1.014 0 .596-.346 1.026-.841 1.026-.508 0-.854-.43-.854-1.026m2.648 0c0-.597.347-1.014.854-1.014.495 0 .841.417.841 1.014 0 .596-.346 1.026-.841 1.026-.507 0-.854-.43-.854-1.026"/>
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
