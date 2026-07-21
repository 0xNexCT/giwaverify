import { useConnect } from "wagmi"

const wallets = [
  { id: "metaMask", name: "MetaMask", icon: "🦊", connector: "metaMask" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵", connector: "coinbaseWallet" },
  { id: "walletConnect", name: "WalletConnect", icon: "🔗", connector: "walletConnect" },
  { id: "injected", name: "Browser Wallet", icon: "🌐", connector: "injected" },
]

export default function WalletModal({ onClose }) {
  const { connect, connectors } = useConnect()
  const walletConnectProjectId = "a7a3a5a5a5a5a5a5a5a5a5a5a5a5a5a5"

  function handleConnect(walletId) {
    const connector = connectors.find((c) => c.id === walletId)
    if (!connector) return
    if (walletId === "walletConnect") {
      connect({ connector, options: { projectId: walletConnectProjectId } })
    } else if (walletId === "coinbase") {
      connect({ connector, options: { appName: "GiwaVerify" } })
    } else {
      connect({ connector })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>
        <div className="space-y-2">
          {wallets.map((w) => {
            const available = connectors.some((c) => c.id === w.connector)
            return (
              <button
                key={w.id}
                onClick={() => handleConnect(w.connector)}
                disabled={!available}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  available
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                }`}
              >
                <span className="text-xl">{w.icon}</span>
                <span className="flex-1 text-left">{w.name}</span>
                {!available && <span className="text-xs text-gray-600">N/A</span>}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-600 text-center mt-4">
          By connecting, you agree to the terms of service.
        </p>
      </div>
    </div>
  )
}
