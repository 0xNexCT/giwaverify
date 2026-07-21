import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { CONTRACTS } from "../config"
import GiwaP2PAbi from "../abis/GiwaP2P.json"

export default function P2PSection() {
  const [price, setPrice] = useState("")
  const [listingId, setListingId] = useState("")
  const { writeContract } = useWriteContract()

  const { data: listingCount } = useReadContract({
    address: CONTRACTS.p2p,
    abi: GiwaP2PAbi,
    functionName: "listingCount",
  })

  async function handleBuy() {
    if (!listingId || !price) return
    writeContract({
      address: CONTRACTS.p2p,
      abi: GiwaP2PAbi,
      functionName: "buy",
      args: [BigInt(listingId)],
      value: parseEther(price),
    })
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤝</span>
        <h2 className="text-lg font-bold">Verified P2P Marketplace</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Active Listings</p>
          <p className="text-2xl font-bold">{Number(listingCount ?? 0)}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Buy Listing (Demo)</p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              placeholder="Listing ID"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in ETH"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={handleBuy}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
