import { useAccount } from "wagmi"
import { useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import DemoVerifierAbi from "../abis/DemoVerifier.json"
import FaucetSection from "../components/FaucetSection"

export default function FaucetPage({ onConnectRequest }) {
  const { address, isConnected } = useAccount()
  const { data: isVerified } = useReadContract({
    address: CONTRACTS.demoVerifier,
    abi: DemoVerifierAbi,
    functionName: "verified",
    args: [address],
    query: { enabled: !!address },
  })

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Faucet</h1>
        <p className="text-base mt-1" style={{ color: "var(--text-muted)" }}>Claim test tokens to develop and experiment on GIWA Chain.</p>
      </div>
      <FaucetSection
        isConnected={isConnected}
        isVerified={isVerified}
        onConnectRequest={onConnectRequest}
      />
    </div>
  )
}
