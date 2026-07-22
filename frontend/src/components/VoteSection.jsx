import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { CONTRACTS, GIWA_CHAIN } from "../config"
import GiwaVoteAbi from "../abis/GiwaVote.json"

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

export default function VoteSection({ isConnected, isVerified, onConnectRequest }) {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [voteId, setVoteId] = useState("")
  const [switchStatus, setSwitchStatus] = useState("idle")
  const { writeContract, isPending } = useWriteContract()

  const { data: count } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "proposalCount",
  })

  async function handleCreate() {
    if (!title || !desc) return
    setSwitchStatus("idle")

    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
    }

    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "createProposal",
      args: [title, desc, 1440n],
    })
  }

  async function handleVote(support) {
    if (!voteId) return
    setSwitchStatus("idle")

    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
    }

    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "vote",
      args: [BigInt(voteId), support],
    })
  }

  const total = Number(count ?? 0)

  return (
    <div
      className="rounded-xl card card-accent-vote"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-7 flex flex-col gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-vote-soft)", color: "var(--accent-vote)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" style={{ color: "var(--text-primary)" }}>Governance</h3>
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>Create and vote on proposals</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm font-medium px-4 py-1.5 rounded-lg" style={{ backgroundColor: "var(--accent-vote-soft)", color: "var(--accent-vote)" }}>
            {total} {total === 1 ? "proposal" : "proposals"}
          </span>
        </div>

        <div className="space-y-3 pb-6" style={{ borderBottom: "1px solid var(--border-card)" }}>
          <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Create Proposal</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title"
            className="w-full rounded-lg px-4 py-3 text-base"
            style={{ borderColor: "var(--border-input)" }}
          />
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description"
            className="w-full rounded-lg px-4 py-3 text-base"
            style={{ borderColor: "var(--border-input)" }}
          />
          {(() => {
            if (!isConnected) {
              return (
                <button onClick={onConnectRequest} className="btn-ghost w-full py-3 rounded-lg text-base font-medium">
                  Connect Wallet to Create
                </button>
              )
            }
            if (isVerified === false) {
              return (
                <div className="w-full py-3 rounded-lg text-base text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)" }}>
                  Verify your wallet to create proposals
                </div>
              )
            }
            if (isVerified === undefined) {
              return (
                <div className="w-full py-3 rounded-lg text-base text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-muted)" }}>
                  Verifying wallet...
                </div>
              )
            }
            return (
              <button
                onClick={handleCreate}
                disabled={!title || !desc || isPending || switchStatus === "switching"}
                className="btn-ghost w-full py-3 rounded-lg text-base font-medium"
              >
                {switchStatus === "switching" ? "Switching..." : isPending ? "Creating..." : "Create Proposal"}
              </button>
            )
          })()}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Cast Vote</p>
          <input
            type="number"
            value={voteId}
            onChange={(e) => setVoteId(e.target.value)}
            placeholder="Proposal ID"
            className="w-full rounded-lg px-4 py-3 text-base"
            style={{ borderColor: "var(--border-input)" }}
          />
          <div className="flex gap-3">
            {(() => {
              if (!isConnected) {
                return (
                  <button onClick={onConnectRequest} className="btn-accent-vote-for flex-1 py-3 rounded-lg text-base font-semibold">
                    Connect Wallet to Vote
                  </button>
                )
              }
              if (isVerified === false) {
                return (
                  <div className="flex-1 py-3 rounded-lg text-base text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)" }}>
                    Not verified
                  </div>
                )
              }
              if (isVerified === undefined) {
                return (
                  <div className="flex-1 py-3 rounded-lg text-base text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-muted)" }}>
                    Verifying...
                  </div>
                )
              }
              return (
                <>
                  <button
                    onClick={() => handleVote(true)}
                    disabled={!voteId || isPending || switchStatus === "switching"}
                    className="btn-accent-vote-for flex-1 py-3 rounded-lg text-base font-semibold"
                  >
                    {switchStatus === "switching" ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    disabled={!voteId || isPending || switchStatus === "switching"}
                    className="btn-accent-vote-against flex-1 py-3 rounded-lg text-base font-semibold"
                  >
                    {switchStatus === "switching" ? "..." : "Reject"}
                  </button>
                </>
              )
            })()}
          </div>
        </div>
        {switchStatus === "switching" && (
          <p className="text-xs" style={{ color: "var(--accent-vote)" }}>Switching to GIWA network...</p>
        )}
        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}
      </div>
    </div>
  )
}
