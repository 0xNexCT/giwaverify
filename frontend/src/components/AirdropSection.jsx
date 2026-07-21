import { useState } from "react"
import { useWriteContract, useReadContract, useSwitchChain, useChainId } from "wagmi"
import { CONTRACTS, GIWA_CHAIN } from "../config"
import GiwaAirdropAbi from "../abis/GiwaAirdrop.json"

export default function AirdropSection() {
  const [airdropId, setAirdropId] = useState("")
  const [switchStatus, setSwitchStatus] = useState("idle")
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const { data: count } = useReadContract({
    address: CONTRACTS.airdrop,
    abi: GiwaAirdropAbi,
    functionName: "airdropCount",
  })

  async function handleClaim() {
    if (!airdropId) return
    setSwitchStatus("idle")

    if (chainId !== GIWA_CHAIN.id) {
      try {
        setSwitchStatus("switching")
        await switchChainAsync({ chainId: GIWA_CHAIN.id })
        setSwitchStatus("idle")
      } catch {
        setSwitchStatus("error")
        return
      }
    }

    writeContract({
      address: CONTRACTS.airdrop,
      abi: GiwaAirdropAbi,
      functionName: "claim",
      args: [BigInt(airdropId)],
    })
  }

  const total = Number(count ?? 0)

  return (
    <div
      className="rounded-xl card-accent-airdrop"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-airdrop-soft)", color: "var(--accent-airdrop)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9"/>
              <path d="M21 3v6h-6"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>Airdrop</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-dim)" }}>Verified-only token claims</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--accent-airdrop-soft)", color: "var(--accent-airdrop)" }}>
            {total} {total === 1 ? "active" : "active"}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            value={airdropId}
            onChange={(e) => setAirdropId(e.target.value)}
            placeholder="Airdrop ID"
            className="flex-1 rounded-lg px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border-input)" }}
          />
          <button
            onClick={handleClaim}
            disabled={!airdropId || isPending || switchStatus === "switching"}
            className="btn-accent-airdrop px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"
          >
            {switchStatus === "switching" ? "Switching..." : isPending ? "Claiming..." : "Claim"}
          </button>
        </div>

        {switchStatus === "switching" && (
          <p className="text-xs" style={{ color: "var(--accent-airdrop)" }}>Switching to GIWA network...</p>
        )}
        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}

        {total === 0 && (
          <div className="text-center pt-2">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: "var(--accent-airdrop-soft)", color: "var(--accent-airdrop)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9"/>
                <path d="M21 3v6h-6"/>
              </svg>
            </div>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>No active airdrops yet</p>
            <p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-dim)", opacity: 0.5 }}>New airdrops will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
