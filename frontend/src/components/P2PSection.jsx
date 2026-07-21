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
    <div
      className="rounded-xl card-accent-p2p"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>P2P Marketplace</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>Trade directly with verified peers</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            {Number(count ?? 0)} listings
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Listing ID"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border-input)" }}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in ETH"
              className="flex-1 rounded-lg px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--border-input)" }}
            />
            <button
              onClick={handleBuy}
              disabled={!id || !price || isPending}
              className="btn-accent-p2p px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              {isPending ? "Buying..." : "Buy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
