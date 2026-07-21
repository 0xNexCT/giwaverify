import { useState } from "react"
import { useWriteContract, useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import GiwaVoteAbi from "../abis/GiwaVote.json"

export default function VoteSection() {
  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalDesc, setProposalDesc] = useState("")
  const [voteId, setVoteId] = useState("")
  const { writeContract } = useWriteContract()

  const { data: proposalCount } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "proposalCount",
  })

  async function handleCreate() {
    if (!proposalTitle || !proposalDesc) return
    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "createProposal",
      args: [proposalTitle, proposalDesc, 1440n],
    })
  }

  async function handleVote(support) {
    if (!voteId) return
    writeContract({
      address: CONTRACTS.vote,
      abi: GiwaVoteAbi,
      functionName: "vote",
      args: [BigInt(voteId), support],
    })
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🗳️</span>
        <h2 className="text-lg font-bold">Verified Governance</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Proposals</p>
          <p className="text-2xl font-bold">{Number(proposalCount ?? 0)}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Create Proposal</p>
          <input
            type="text"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            placeholder="Title"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full mb-2"
          />
          <input
            type="text"
            value={proposalDesc}
            onChange={(e) => setProposalDesc(e.target.value)}
            placeholder="Description"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full mb-2"
          />
          <button
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all w-full"
          >
            Create Proposal
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Vote on Proposal</p>
          <input
            type="number"
            value={voteId}
            onChange={(e) => setVoteId(e.target.value)}
            placeholder="Proposal ID"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1"
            >
              Vote Yes
            </button>
            <button
              onClick={() => handleVote(false)}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1"
            >
              Vote No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
