import { useAccount } from "wagmi"
import { useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import DemoVerifierAbi from "../abis/DemoVerifier.json"
import AirdropSection from "./AirdropSection"
import P2PSection from "./P2PSection"
import VoteSection from "./VoteSection"

export default function Dashboard() {
  const { address, isConnected } = useAccount()

  const { data: isVerified } = useReadContract({
    address: CONTRACTS.demoVerifier,
    abi: DemoVerifierAbi,
    functionName: "verified",
    args: [address],
    query: { enabled: isConnected },
  })

  if (!isConnected) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        Connect your wallet to access GiwaVerify.
      </section>
    )
  }

  if (!isVerified) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-8 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-xl font-bold mb-2">Wallet Not Verified</h2>
          <p className="text-gray-400 mb-4">
            Your wallet is not yet verified on the DemoVerifier contract.
          </p>
          <p className="text-sm text-gray-500">
            Contact the contract owner to get verified for the demo.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4 mb-8 text-center">
        <span className="text-emerald-400 font-medium">✅ Verified Wallet — Full Access Granted</span>
      </div>
      <div className="grid gap-8">
        <AirdropSection />
        <P2PSection />
        <VoteSection />
      </div>
    </section>
  )
}
