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
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Airdrop</h3>
        <span className="text-xs text-gray-600">{Number(count ?? 0)} active</span>
      </div>
      <p className="text-xs text-gray-600 mb-4">Claim tokens from verified-only distributions.</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={airdropId}
          onChange={(e) => setAirdropId(e.target.value)}
          placeholder="Airdrop ID"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600"
        />
        <button
          onClick={handleClaim}
          disabled={!airdropId || isPending}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-gray-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
        >
          {isPending ? "..." : "Claim"}
        </button>
      </div>
    </div>
  )
}
