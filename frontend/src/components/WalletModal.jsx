import { useConnect } from "wagmi"

const wallets = [
  { id: "metaMask", name: "MetaMask", icon: "M", connector: "metaMask" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "C", connector: "coinbaseWallet" },
  { id: "walletConnect", name: "WalletConnect", icon: "W", connector: "walletConnect" },
  { id: "injected", name: "Browser Wallet", icon: "B", connector: "injected" },
]

export default function WalletModal({ onClose }) {
  const { connect, connectors } = useConnect()

  function handleConnect(walletId) {
    const connector = connectors.find((c) => c.id === walletId)
    if (!connector) return

    const opts = {}
    if (walletId === "walletConnect") {
      opts.projectId = "a7a3a5a5a5a5a5a5a5a5a5a5a5a5a5a5"
    }
    if (walletId === "coinbase") {
      opts.appName = "GiwaVerify"
    }
    connect({ connector, ...(Object.keys(opts).length ? { options: opts } : {}) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#121214] border border-white/10 rounded-xl p-5 w-72 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="space-y-1.5">
          {wallets.map((w) => {
            const available = connectors.some((c) => c.id === w.connector)
            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w.connector)}
                disabled={!available}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  available
                    ? "text-gray-300 hover:bg-white/5 hover:text-white"
                    : "text-gray-600 cursor-not-allowed"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                  {w.icon}
                </div>
                <span className="flex-1 text-left">{w.name}</span>
                {!available && <span className="text-xs text-gray-600">Unavailable</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
