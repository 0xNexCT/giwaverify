import { useMemo, useState, useRef, useEffect, useCallback } from "react"
import { useWriteContract, useReadContract, useReadContracts, useAccount, useConfig } from "wagmi"
import { waitForTransactionReceipt } from "wagmi/actions"
import { CONTRACTS, GIWA_CHAIN } from "../config"
import GiwaVoteAbi from "../abis/GiwaVote.json"
import GiwaGovernanceBadgeAbi from "../abis/GiwaGovernanceBadge.json"

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

function timeLeft(deadline) {
  const now = Math.floor(Date.now() / 1000)
  if (now >= Number(deadline)) return null
  const diff = Number(deadline) - now
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h left`
  const mins = Math.floor((diff % 3600) / 60)
  return `${hours}h ${mins}m left`
}

function fmtDate(ts) {
  const d = new Date(Number(ts) * 1000)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function VoteSection({ isConnected, isVerified, onConnectRequest }) {
  const { address } = useAccount()
  const wagmiConfig = useConfig()
  const [filter, setFilter] = useState("active")
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [switchStatus, setSwitchStatus] = useState("idle")
  const [voteStatus, setVoteStatus] = useState({})
  const { writeContractAsync, isPending } = useWriteContract()
  const modalRef = useRef(null)

  const { data: countData, refetch: refetchCount } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "proposalCount",
    query: { enabled: !!CONTRACTS.vote },
  })

  const { data: totalVotesData, refetch: refetchTotal } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "totalVotesCast",
    query: { enabled: !!CONTRACTS.vote },
  })

  const { data: proposalsRaw, refetch: refetchProposals } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "getProposals",
    args: [0n, 50n],
    query: { enabled: !!CONTRACTS.vote },
  })

  const { data: hasEverVotedData, refetch: refetchHasVoted } = useReadContract({
    address: CONTRACTS.vote,
    abi: GiwaVoteAbi,
    functionName: "hasEverVoted",
    args: [address],
    query: { enabled: !!address && !!CONTRACTS.vote },
  })

  const { data: badgeBalance, refetch: refetchBadge } = useReadContract({
    address: CONTRACTS.governanceBadge,
    abi: GiwaGovernanceBadgeAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address && !!CONTRACTS.governanceBadge },
  })

  const proposals = useMemo(() => {
    if (!proposalsRaw) return []
    if (!Array.isArray(proposalsRaw)) return []
    return proposalsRaw.map((p, i) => ({
      ...p,
      id: Number(p.id),
      creationTime: Number(p.creationTime),
      deadline: Number(p.deadline),
      yesVotes: Number(p.yesVotes),
      noVotes: Number(p.noVotes),
      implemented: p.implemented,
      implementedAt: Number(p.implementedAt ?? 0),
      status: new Date().getTime() / 1000 >= Number(p.deadline)
        ? (Number(p.yesVotes) > Number(p.noVotes) ? "passed" : "rejected")
        : "active",
    }))
  }, [proposalsRaw])

  const { data: votedData, refetch: refetchVoted } = useReadContracts({
    contracts: address && proposals.length > 0
      ? proposals.map((p) => ({
          address: CONTRACTS.vote,
          abi: GiwaVoteAbi,
          functionName: "hasVotedOnProposal",
          args: [BigInt(p.id), address],
        }))
      : undefined,
    query: { enabled: !!address && proposals.length > 0 && !!CONTRACTS.vote },
  })

  const votedMap = useMemo(() => {
    if (!votedData) return {}
    const map = {}
    votedData.forEach((item, i) => {
      if (item?.result != null && proposals[i]) {
        map[proposals[i].id] = item.result
      }
    })
    return map
  }, [votedData, proposals])

  const activeCount = useMemo(() => proposals.filter((p) => p.status === "active").length, [proposals])

  const filteredProposals = useMemo(() => {
    switch (filter) {
      case "active": return proposals.filter((p) => p.status === "active")
      case "ended": return proposals.filter((p) => p.status !== "active")
      default: return [...proposals]
    }
  }, [proposals, filter])

  const sortedProposals = useMemo(() => {
    const copy = [...filteredProposals]
    copy.sort((a, b) => {
      if (a.status === "active" && b.status === "active") return a.deadline - b.deadline
      if (a.status !== "active" && b.status !== "active") return b.deadline - a.deadline
      if (a.status === "active") return -1
      return 1
    })
    return copy
  }, [filteredProposals])

  function refetchAll() {
    refetchCount()
    refetchTotal()
    refetchProposals()
    refetchHasVoted()
    refetchBadge()
    refetchVoted()
  }

  async function handleVote(proposalId, support) {
    setSwitchStatus("idle")
    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
    }
    setVoteStatus((prev) => ({ ...prev, [proposalId]: "pending" }))
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.vote,
        abi: GiwaVoteAbi,
        functionName: "vote",
        args: [BigInt(proposalId), support],
      })
      await waitForTransactionReceipt(wagmiConfig, { hash })
      setVoteStatus((prev) => ({ ...prev, [proposalId]: "success" }))
      setTimeout(() => {
        setVoteStatus((prev) => ({ ...prev, [proposalId]: undefined }))
        refetchAll()
      }, 1500)
    } catch {
      setVoteStatus((prev) => ({ ...prev, [proposalId]: undefined }))
    }
  }

  function openDetail(p) { setSelectedProposal(p) }
  function closeDetail() { setSelectedProposal(null) }

  useEffect(() => {
    if (!selectedProposal) return
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) closeDetail()
    }
    function handleKey(e) {
      if (e.key === "Escape") closeDetail()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [selectedProposal])

  const total = Number(countData ?? 0)
  const totalVotes = Number(totalVotesData ?? 0)
  const hasBadge = hasEverVotedData === true
  const isPendingVote = (id) => voteStatus[id] === "pending" || voteStatus[id] === "success"

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* stats bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{activeCount}</strong> Active {activeCount === 1 ? "Proposal" : "Proposals"}
            </span>
          </div>
          <div className="w-px h-6" style={{ backgroundColor: "var(--border-card)" }} />
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            </svg>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{totalVotes}</strong> Total Votes Cast
            </span>
          </div>
          {hasBadge && (
            <>
              <div className="w-px h-6" style={{ backgroundColor: "var(--border-card)" }} />
              <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-accent-soft)", color: "var(--text-accent)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Governance Participant
              </div>
            </>
          )}
          <div className="ml-auto">
            <button
              onClick={refetchAll}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-dim)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
              title="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* filter tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
          {["active", "ended", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                backgroundColor: filter === f ? "var(--bg-card-hover)" : "transparent",
                color: filter === f ? "var(--text-primary)" : "var(--text-dim)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* proposal list */}
        {sortedProposals.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>No {filter !== "all" ? filter : ""} proposals yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {sortedProposals.map((p) => {
            const totalVoteCount = p.yesVotes + p.noVotes
            const yesPct = totalVoteCount > 0 ? Math.round((p.yesVotes / totalVoteCount) * 100) : 0
            const noPct = totalVoteCount > 0 ? Math.round((p.noVotes / totalVoteCount) * 100) : 0
            const remaining = timeLeft(p.deadline)
            const userVoted = votedMap[p.id]
            const waiting = isPendingVote(p.id)
            const votedSupport = userVoted
            const ended = p.status !== "active"

            return (
              <div
                key={p.id}
                onClick={() => openDetail(p)}
                className="rounded-xl transition-all duration-150 cursor-pointer"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-card-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-card)"}
              >
                <div className="p-5">
                  {/* header row */}
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold mb-0.5 truncate" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
                      <p className="text-sm leading-snug line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {p.description}
                      </p>
                    </div>
                    {ended ? (
                      <span
                        className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-md"
                        style={{
                          backgroundColor: p.status === "passed" ? "rgba(52,211,153,0.15)" : "var(--bg-card-hover)",
                          color: p.status === "passed" ? "#34d399" : "var(--text-dim)",
                        }}
                      >
                        {p.status === "passed" ? "Passed" : "Rejected"}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium" style={{ color: "var(--text-accent)" }}>
                        {remaining}
                      </span>
                    )}
                  </div>

                  {/* progress bar */}
                  {totalVoteCount > 0 && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex-1 h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: "var(--bg-card-hover)" }}>
                        {p.yesVotes > 0 && (
                          <div className="h-full transition-all" style={{ width: `${yesPct}%`, backgroundColor: "#34d399" }} />
                        )}
                        {p.noVotes > 0 && (
                          <div className="h-full transition-all" style={{ width: `${noPct}%`, backgroundColor: "#ef4444" }} />
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className="text-xs font-medium" style={{ color: "#34d399" }}>{yesPct}%</span>
                        <span className="text-xs font-medium" style={{ color: "#ef4444" }}>{noPct}%</span>
                      </div>
                    </div>
                  )}

                  {/* bottom row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                      {totalVoteCount} {totalVoteCount === 1 ? "vote" : "votes"}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!ended && !userVoted && !isConnected && (
                        <button onClick={onConnectRequest} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-dim)" }}>
                          Connect wallet to vote
                        </button>
                      )}
                      {!ended && !userVoted && isConnected && isVerified === false && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)" }}>
                          Verify to vote
                        </span>
                      )}
                      {!ended && !userVoted && isConnected && isVerified === true && (
                        <div className="flex gap-2">
                          <button
                            disabled={waiting}
                            onClick={() => handleVote(p.id, true)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ backgroundColor: "rgba(52,211,153,0.15)", color: "#34d399" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(52,211,153,0.25)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(52,211,153,0.15)"}
                          >
                            {waiting && voteStatus[p.id] === "pending" ? "..." : "Approve"}
                          </button>
                          <button
                            disabled={waiting}
                            onClick={() => handleVote(p.id, false)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.25)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)"}
                          >
                            {waiting && voteStatus[p.id] === "pending" ? "..." : "Reject"}
                          </button>
                        </div>
                      )}
                      {!ended && userVoted && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-accent)" }}>
                          You voted: {votedSupport ? "Approve" : "Reject"}
                        </span>
                      )}
                      {ended && (
                        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                          Ended {fmtDate(p.deadline)}
                        </span>
                      )}
                      {p.status === "passed" && (
                        <span className="text-xs" style={{ color: p.implemented ? "#34d399" : "var(--text-amber)" }}>
                          {p.implemented ? `Implemented ${fmtDate(p.implementedAt)}` : "Implementation: Pending"}
                        </span>
                      )}
                      {waiting && voteStatus[p.id] === "success" && (
                        <span className="text-xs" style={{ color: "#34d399" }}>Voted ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* detail modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div
            ref={modalRef}
            className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale"
            style={{ backgroundColor: "var(--bg-modal)", border: "1px solid var(--border-modal)" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedProposal.status === "active" ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(52,211,153,0.15)", color: "#34d399" }}>Active</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{
                      backgroundColor: selectedProposal.status === "passed" ? "rgba(52,211,153,0.15)" : "var(--bg-card-hover)",
                      color: selectedProposal.status === "passed" ? "#34d399" : "var(--text-dim)",
                    }}>
                      {selectedProposal.status === "passed" ? "Passed" : "Rejected"}
                    </span>
                  )}
                </div>
                <button
                  onClick={closeDetail}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-dim)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{selectedProposal.title}</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                {selectedProposal.description}
              </p>

              <div className="flex flex-wrap gap-3 mb-5 text-xs" style={{ color: "var(--text-dim)" }}>
                <span>Created {fmtDate(selectedProposal.creationTime)}</span>
                <span className="w-px h-4" style={{ backgroundColor: "var(--border-card)" }} />
                <span>Deadline {fmtDate(selectedProposal.deadline)}</span>
              </div>

              {selectedProposal.status === "passed" && (
                <div className="mb-4 text-xs" style={{ color: selectedProposal.implemented ? "#34d399" : "var(--text-amber)" }}>
                  {selectedProposal.implemented
                    ? `Implemented on ${fmtDate(selectedProposal.implementedAt)}`
                    : "Implementation: Pending"}
                </div>
              )}

              {/* vote breakdown */}
              <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-card-hover)" }}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Vote Breakdown</span>
                  <span className="text-sm" style={{ color: "var(--text-dim)" }}>
                    {selectedProposal.yesVotes + selectedProposal.noVotes} total
                  </span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "var(--bg-card)" }}>
                  {selectedProposal.yesVotes > 0 && (
                    <div className="h-full transition-all" style={{
                      width: `${((selectedProposal.yesVotes / Math.max(selectedProposal.yesVotes + selectedProposal.noVotes, 1)) * 100).toFixed(1)}%`,
                      backgroundColor: "#34d399",
                    }} />
                  )}
                  {selectedProposal.noVotes > 0 && (
                    <div className="h-full transition-all" style={{
                      width: `${((selectedProposal.noVotes / Math.max(selectedProposal.yesVotes + selectedProposal.noVotes, 1)) * 100).toFixed(1)}%`,
                      backgroundColor: "#ef4444",
                    }} />
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#34d399" }}>{selectedProposal.yesVotes} Approve ({selectedProposal.yesVotes + selectedProposal.noVotes > 0 ? Math.round((selectedProposal.yesVotes / (selectedProposal.yesVotes + selectedProposal.noVotes)) * 100) : 0}%)</span>
                  <span style={{ color: "#ef4444" }}>{selectedProposal.noVotes} Reject ({selectedProposal.yesVotes + selectedProposal.noVotes > 0 ? Math.round((selectedProposal.noVotes / (selectedProposal.yesVotes + selectedProposal.noVotes)) * 100) : 0}%)</span>
                </div>
              </div>

              {/* voting action in modal */}
              {selectedProposal.status === "active" && (
                <div className="flex gap-3">
                  {!isConnected && (
                    <button onClick={() => { onConnectRequest(); closeDetail() }} className="flex-1 py-3 rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-primary)" }}>
                      Connect Wallet to Vote
                    </button>
                  )}
                  {isConnected && isVerified === false && (
                    <div className="flex-1 py-3 rounded-lg text-sm text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)" }}>
                      Verify your wallet to vote
                    </div>
                  )}
                  {isConnected && isVerified === undefined && (
                    <div className="flex-1 py-3 rounded-lg text-sm text-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-dim)" }}>
                      Verifying wallet...
                    </div>
                  )}
                  {isConnected && isVerified === true && (
                    <>
                      {votedMap[selectedProposal.id] !== undefined ? (
                        <div className="flex-1 py-3 rounded-lg text-sm text-center font-medium" style={{ backgroundColor: "var(--bg-accent-soft)", color: "var(--text-accent)" }}>
                          You voted: {votedMap[selectedProposal.id] ? "Approve" : "Reject"}
                        </div>
                      ) : (
                        <>
                          <button
                            disabled={isPending || voteStatus[selectedProposal.id] !== undefined}
                            onClick={() => handleVote(selectedProposal.id, true)}
                            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
                            style={{ backgroundColor: "rgba(52,211,153,0.15)", color: "#34d399" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(52,211,153,0.25)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(52,211,153,0.15)"}
                          >
                            {voteStatus[selectedProposal.id] === "pending" ? "Voting..." : voteStatus[selectedProposal.id] === "success" ? "Voted ✓" : "Approve"}
                          </button>
                          <button
                            disabled={isPending || voteStatus[selectedProposal.id] !== undefined}
                            onClick={() => handleVote(selectedProposal.id, false)}
                            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
                            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.25)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)"}
                          >
                            {voteStatus[selectedProposal.id] === "success" ? "Voted ✓" : "Reject"}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {switchStatus === "error" && (
                <p className="text-xs mt-3" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
