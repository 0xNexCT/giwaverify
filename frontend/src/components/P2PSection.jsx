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
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">P2P Marketplace</h3>
        <span className="text-xs text-gray-600">{Number(count ?? 0)} listings</span>
      </div>
      <p className="text-xs text-gray-600 mb-4">Trade directly with verified peers.</p>
      <div className="space-y-2">
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Listing ID"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ETH"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600"
          />
          <button
            onClick={handleBuy}
            disabled={!id || !price || isPending}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-gray-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
          >
            {isPending ? "..." : "Buy"}
          </button>
        </div>
      </div>
    </div>
  )
}
