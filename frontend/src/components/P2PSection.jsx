import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { CONTRACTS } from "../config"
import GiwaP2PAbi from "../abis/GiwaP2P.json"

export default function P2PSection() {
  const [id, setId] = useState("")
  const [price, setPrice] = useState("")
  const { writeContract, isPending } = useWriteContract()

  const { data: count } = useReadContract({
    address: CONTRACTS.p2p,
    abi: GiwaP2PAbi,
    functionName: "listingCount",
  })

  function handleBuy() {
    if (!id || !price) return
    writeContract({
      address: CONTRACTS.p2p,
      abi: GiwaP2PAbi,
      functionName: "buy",
      args: [BigInt(id)],
      value: parseEther(price),
    })
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)", borderWidth: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: "var(--text-secondary)" }} className="text-sm font-medium">P2P Marketplace</h3>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>{Number(count ?? 0)} listings</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>Trade directly with verified peers.</p>
      <div className="space-y-2">
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Listing ID"
          className="w-full rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ETH"
            className="flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleBuy}
            disabled={!id || !price || isPending}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
          >
            {isPending ? "..." : "Buy"}
          </button>
        </div>
      </div>
    </div>
  )
}
