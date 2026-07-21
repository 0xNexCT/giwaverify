import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import GiwaAirdropAbi from "../abis/GiwaAirdrop.json"

export default function AirdropSection() {
  const [airdropId, setAirdropId] = useState("")
  const { writeContract, isPending } = useWriteContract()

  const { data: count } = useReadContract({
    address: CONTRACTS.airdrop,
    abi: GiwaAirdropAbi,
    functionName: "airdropCount",
  })

  function handleClaim() {
    if (!airdropId) return
    writeContract({
      address: CONTRACTS.airdrop,
      abi: GiwaAirdropAbi,
      functionName: "claim",
      args: [BigInt(airdropId)],
    })
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)", borderWidth: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: "var(--text-secondary)" }} className="text-sm font-medium">Airdrop</h3>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>{Number(count ?? 0)} active</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>Claim tokens from verified-only distributions.</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={airdropId}
          onChange={(e) => setAirdropId(e.target.value)}
          placeholder="Airdrop ID"
          className="flex-1 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleClaim}
          disabled={!airdropId || isPending}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
        >
          {isPending ? "..." : "Claim"}
        </button>
      </div>
    </div>
  )
}
