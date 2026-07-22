import { useAccount } from "wagmi"
import VoteSection from "../components/VoteSection"

export default function GovernancePage({ onConnectRequest }) {
  const { isConnected } = useAccount()

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Governance</h1>
        <p className="text-base mt-1" style={{ color: "var(--text-muted)" }}>
          Vote on ecosystem decisions like new tokens, faucet parameters, and platform changes.
        </p>
      </div>
      <VoteSection
        isConnected={isConnected}
        onConnectRequest={onConnectRequest}
      />
    </div>
  )
}
