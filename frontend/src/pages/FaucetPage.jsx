import { useAccount } from "wagmi"
import FaucetSection from "../components/FaucetSection"

export default function FaucetPage({ onConnectRequest }) {
  const { isConnected } = useAccount()

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Faucet</h1>
        <p className="text-base mt-1" style={{ color: "var(--text-muted)" }}>Claim test tokens to develop and experiment on GIWA Chain.</p>
      </div>
      <FaucetSection
        isConnected={isConnected}
        onConnectRequest={onConnectRequest}
      />
    </div>
  )
}
