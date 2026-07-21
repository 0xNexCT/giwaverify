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
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-white/5 mx-auto mb-4 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="text-base font-medium text-gray-400 mb-1">Connect your wallet</h2>
        <p className="text-sm text-gray-600">Link your wallet to access the GiwaVerify ecosystem.</p>
      </div>
    )
  }

  if (isConnected && isVerified === false) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 mx-auto mb-4 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="text-base font-medium text-amber-400 mb-1">Unverified Wallet</h2>
        <p className="text-sm text-gray-500 mb-4">This wallet is not on the verified list.</p>
        <div className="inline-block px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-400">
          Contact the contract owner for access
        </div>
      </div>
    )
  }

  if (isConnected && isVerified) {
    return (
      <div className="space-y-6">
        <div className="text-center pb-6 border-b border-white/5">
          <p className="text-sm text-emerald-400 font-medium">Verified wallet</p>
          <p className="text-xs text-gray-600 mt-1">Full access granted</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AirdropSection />
          <P2PSection />
          <VoteSection />
        </div>
      </div>
    )
  }

  return null
}
