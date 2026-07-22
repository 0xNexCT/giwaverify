import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { CONTRACTS, GIWA_CHAIN } from "../config"
import GiwaP2PAbi from "../abis/GiwaP2P.json"

const GIWA_CHAIN_HEX = "0x" + GIWA_CHAIN.id.toString(16)

async function ensureChain() {
  if (!window.ethereum) return false
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GIWA_CHAIN_HEX }],
    })
    return true
  } catch (e) {
    if (e.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: GIWA_CHAIN_HEX,
            chainName: GIWA_CHAIN.name,
            nativeCurrency: GIWA_CHAIN.nativeCurrency,
            rpcUrls: GIWA_CHAIN.rpcUrls.default.http,
            blockExplorerUrls: [GIWA_CHAIN.blockExplorers.default.url],
          }],
        })
        return true
      } catch { return false }
    }
    return false
  }
}

export default function P2PSection({ isConnected, isVerified, onConnectRequest }) {
  const [id, setId] = useState("")
  const [price, setPrice] = useState("")
  const [switchStatus, setSwitchStatus] = useState("idle")
  const { writeContract, isPending } = useWriteContract()

  const { data: count } = useReadContract({
    address: CONTRACTS.p2p,
    abi: GiwaP2PAbi,
    functionName: "listingCount",
  })

  async function handleBuy() {
    if (!id || !price) return
    setSwitchStatus("idle")

    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
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
      className="rounded-xl card card-accent-p2p"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-7 flex flex-col gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" style={{ color: "var(--text-primary)" }}>P2P Marketplace</h3>
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>Trade directly with verified peers</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm font-medium px-4 py-1.5 rounded-lg" style={{ backgroundColor: "var(--accent-p2p-soft)", color: "var(--accent-p2p)" }}>
            {total} {total === 1 ? "listing" : "listings"}
          </span>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Listing ID"
            className="w-full rounded-lg px-4 py-3 text-base"
            style={{ borderColor: "var(--border-input)" }}
          />
          <div className="flex gap-3">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in ETH"
              className="flex-1 rounded-lg px-4 py-3 text-base"
              style={{ borderColor: "var(--border-input)" }}
            />
            {(() => {
              if (!isConnected) {
                return (
                  <button onClick={onConnectRequest} className="btn-accent-p2p px-6 py-3 rounded-lg text-base font-semibold shrink-0">
                    Connect Wallet
                  </button>
                )
              }
              if (isVerified === false) {
                return (
                  <div className="px-4 py-3 rounded-lg text-sm shrink-0 flex items-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)" }}>
                    Not verified
                  </div>
                )
              }
              if (isVerified === undefined) {
                return (
                  <div className="px-4 py-3 rounded-lg text-sm shrink-0 flex items-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-muted)" }}>
                    Verifying...
                  </div>
                )
              }
              return (
                <button
                  onClick={handleBuy}
                  disabled={!id || !price || isPending || switchStatus === "switching"}
                  className="btn-accent-p2p px-6 py-3 rounded-lg text-base font-semibold shrink-0"
                >
                  {switchStatus === "switching" ? "Switching..." : isPending ? "Buying..." : "Buy"}
                </button>
              )
            })()}
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
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No listings yet</p>
            <p className="text-[0.65rem] mt-0.5" style={{ color: "var(--text-dim)" }}>New trades will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
