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
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)", borderWidth: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: "var(--text-secondary)" }} className="text-sm font-medium">Governance</h3>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>{Number(count ?? 0)} proposals</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>Create and vote on ecosystem proposals.</p>
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleCreate}
          disabled={!title || !desc || isPending}
          className="btn-ghost w-full py-2 rounded-lg text-sm font-medium"
        >
          {isPending ? "..." : "Create Proposal"}
        </button>
      </div>
      <div className="pt-4" style={{ borderTop: "1px solid var(--border-card)" }}>
        <input
          type="number"
          value={voteId}
          onChange={(e) => setVoteId(e.target.value)}
          placeholder="Proposal ID to vote on"
          className="w-full rounded-lg px-3 py-2 text-sm mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!voteId || isPending}
            className="btn-ghost flex-1 py-2 rounded-lg text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={!voteId || isPending}
            className="btn-ghost flex-1 py-2 rounded-lg text-sm font-medium"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
