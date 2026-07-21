import { useState } from "react"
import { useWriteContract, useReadContracts } from "wagmi"
import { CONTRACTS } from "../config"
import GiwaAirdropAbi from "../abis/GiwaAirdrop.json"

export default function AirdropSection() {
  const [amount, setAmount] = useState("")
  const { writeContract } = useWriteContract()

  const { data: airdropCount } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.airdrop,
        abi: GiwaAirdropAbi,
        functionName: "airdropCount",
      },
    ],
  })

  const count = airdropCount?.[0]?.result ?? 0

  async function handleCreate() {
    if (!amount) return
    writeContract({
      address: CONTRACTS.airdrop,
      abi: GiwaAirdropAbi,
      functionName: "claim",
      args: [BigInt(amount)],
    })
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🪂</span>
        <h2 className="text-lg font-bold">Verified Airdrop</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Active Airdrops</p>
          <p className="text-2xl font-bold">{Number(count)}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Demo: Claim test tokens</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Airdrop ID"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
