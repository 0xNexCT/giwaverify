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
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Governance</h3>
        <span className="text-xs text-gray-600">{Number(count ?? 0)} proposals</span>
      </div>
      <p className="text-xs text-gray-600 mb-4">Create and vote on ecosystem proposals.</p>
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600"
        />
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600"
        />
        <button
          onClick={handleCreate}
          disabled={!title || !desc || isPending}
          className="w-full bg-white/5 hover:bg-white/10 disabled:text-gray-600 text-gray-300 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
        >
          {isPending ? "..." : "Create Proposal"}
        </button>
      </div>
      <div className="border-t border-white/5 pt-4">
        <input
          type="number"
          value={voteId}
          onChange={(e) => setVoteId(e.target.value)}
          placeholder="Proposal ID to vote on"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!voteId || isPending}
            className="flex-1 bg-white/5 hover:bg-white/10 disabled:text-gray-600 text-gray-300 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
          >
            Approve
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={!voteId || isPending}
            className="flex-1 bg-white/5 hover:bg-white/10 disabled:text-gray-600 text-gray-300 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
