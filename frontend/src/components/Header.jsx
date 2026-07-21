import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"

export default function Header() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-white">GiwaVerify</span>
          <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
            GIWA Testnet
          </span>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button onClick={disconnect} className="text-sm text-gray-500 hover:text-gray-300">
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
