import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import GiwaVoteAbi from "../abis/GiwaVote.json"

export default function VoteSection() {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [voteId, setVoteId] = useState("")
  const { writeContract, isPending } = useWriteContract()

  const { data: count } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "proposalCount",
  })

  function handleCreate() {
    if (!title || !desc) return
    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "createProposal",
      args: [title, desc, 1440n],
    })
  }

  function handleVote(support) {
    if (!voteId) return
    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "vote",
      args: [BigInt(voteId), support],
    })
  }

  return (
    <div
      className="rounded-xl card-accent-vote"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-vote-soft)", color: "var(--accent-vote)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Governance</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>Create and vote on proposals</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--accent-vote-soft)", color: "var(--accent-vote)" }}>
            {Number(count ?? 0)} proposals
          </span>
        </div>

        <div className="space-y-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border-card)" }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Create Proposal</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border-input)" }}
          />
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border-input)" }}
          />
          <button
            onClick={handleCreate}
            disabled={!title || !desc || isPending}
            className="btn-ghost w-full py-2.5 rounded-lg text-sm font-medium"
          >
            {isPending ? "Creating..." : "Create Proposal"}
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Cast Vote</p>
          <input
            type="number"
            value={voteId}
            onChange={(e) => setVoteId(e.target.value)}
            placeholder="Proposal ID"
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--border-input)" }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={!voteId || isPending}
              className="btn-accent-vote-for flex-1 py-2.5 rounded-lg text-sm font-semibold"
            >
              Approve
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={!voteId || isPending}
              className="btn-accent-vote-against flex-1 py-2.5 rounded-lg text-sm font-semibold"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
