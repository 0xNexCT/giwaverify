import { useState } from "react"
import { useWriteContract, useReadContract, useSwitchChain, useChainId } from "wagmi"
import { parseEther } from "viem"
import { CONTRACTS, GIWA_CHAIN } from "../config"
import GiwaP2PAbi from "../abis/GiwaP2P.json"

export default function P2PSection() {
  const [id, setId] = useState("")
  const [price, setPrice] = useState("")
  const [switchStatus, setSwitchStatus] = useState("idle")
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const { data: count } = useReadContract({
    address: CONTRACTS.p2p,
    abi: GiwaP2PAbi,
    functionName: "listingCount",
  })

  async function handleBuy() {
    if (!id || !price) return
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
      address: CONTRACTS.p2p,
      abi: GiwaP2PAbi,
      functionName: "buy",
      args: [BigInt(id)],
      value: parseEther(price),
    })
  }

  const total = Number(count ?? 0)

  return (
    <div
      className="rounded-xl card-accent-p2p"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>P2P Marketplace</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>Trade directly with verified peers</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            {total} {total === 1 ? "listing" : "listings"}
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
              disabled={!id || !price || isPending || switchStatus === "switching"}
              className="btn-accent-p2p px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"
            >
              {switchStatus === "switching" ? "Switching..." : isPending ? "Buying..." : "Buy"}
            </button>
          </div>
        </div>

        {switchStatus === "switching" && (
          <p className="text-xs" style={{ color: "var(--accent-p2p)" }}>Switching to GIWA network...</p>
        )}
        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}

        {total === 0 && (
          <div className="text-center pt-2">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No listings yet</p>
            <p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-dim)" }}>New trades will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
