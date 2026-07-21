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
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center py-16 md:py-20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 mx-auto mb-6 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            KYC-Gated dApps on GIWA Chain
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed text-sm">
            GiwaVerify lets projects distribute tokens, trade assets, and govern
            communities with confidence. Every participant is a verified real person,
            powered by Dojang attestations from the GIWA ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12 max-w-2xl mx-auto">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-left">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9"/>
                  <path d="M21 3v6h-6"/>
                  <path d="M12 7v5l3 3"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Airdrop</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Distribute tokens only to verified wallets</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-left">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V7H7"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">P2P Trading</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Trade assets securely between verified peers</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-left">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Governance</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Vote on proposals with verified identity</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 max-w-xs mx-auto">
            <div className="w-10 h-10 rounded-xl bg-white/5 mx-auto mb-3 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-400 mb-1">Connect your wallet</h2>
            <p className="text-sm text-gray-600">Link your wallet to get started.</p>
          </div>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AirdropSection />
        <P2PSection />
        <VoteSection />
      </div>
    )
  }

  return null
}
