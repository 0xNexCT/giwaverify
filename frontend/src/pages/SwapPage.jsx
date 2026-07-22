import { useAccount } from "wagmi"
import SwapSection from "../components/SwapSection"

export default function SwapPage({ onConnectRequest }) {
  const { isConnected } = useAccount()

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Token Swap</h1>
        <p className="text-base mt-1" style={{ color: "var(--text-muted)" }}>Swap between verified-only test tokens using an automated market maker.</p>
      </div>
      <SwapSection
        isConnected={isConnected}
        onConnectRequest={onConnectRequest}
      />
    </div>
  )
}
