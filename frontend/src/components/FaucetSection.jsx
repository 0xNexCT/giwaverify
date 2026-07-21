import { useState, useEffect, useCallback } from "react"
import { useWriteContract, useReadContract, useSwitchChain, useChainId, useAccount } from "wagmi"
import { CONTRACTS, GIWA_CHAIN, FAUCET_TOKENS } from "../config"
import GiwaFaucetAbi from "../abis/GiwaFaucet.json"

const ERC20_MIN_ABI = [
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
]

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function FaucetSection() {
  const { address } = useAccount()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [switchStatus, setSwitchStatus] = useState("idle")
  const [cd, setCd] = useState(0)
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const token = FAUCET_TOKENS[selectedIdx]

  const { data: claimAmount } = useReadContract({
    address: CONTRACTS.faucet,
    abi: GiwaFaucetAbi,
    functionName: "CLAIM_AMOUNT",
    query: { enabled: !!CONTRACTS.faucet },
  })

  const { data: rawCooldown } = useReadContract({
    address: CONTRACTS.faucet,
    abi: GiwaFaucetAbi,
    functionName: "getCooldownRemaining",
    args: [address, token?.address],
    query: { enabled: !!address && !!token?.address && !!CONTRACTS.faucet },
  })

  const { data: faucetBalance } = useReadContract({
    address: CONTRACTS.faucet,
    abi: GiwaFaucetAbi,
    functionName: "getFaucetBalance",
    args: [token?.address],
    query: { enabled: !!token?.address && !!CONTRACTS.faucet },
  })

  const { data: symbol } = useReadContract({
    address: token?.address,
    abi: ERC20_MIN_ABI,
    functionName: "symbol",
    query: { enabled: !!token?.address },
  })

  const { data: userBalance } = useReadContract({
    address: token?.address,
    abi: ERC20_MIN_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address && !!token?.address },
  })

  useEffect(() => {
    setCd(Number(rawCooldown ?? 0))
  }, [rawCooldown])

  useEffect(() => {
    if (cd <= 0) return
    const interval = setInterval(() => {
      setCd((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [cd])

  const formatted = formatTime(cd)
  const isOnCooldown = cd > 0

  const rawClaimable = claimAmount ? Number(claimAmount) : 0
  const rawFaucet = faucetBalance ? Number(faucetBalance) : 0
  const rawUser = userBalance ? Number(userBalance) : 0
  const decimals = 18
  const divisor = 10 ** decimals

  function fmt(n) {
    return (n / divisor).toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  async function handleClaim() {
    if (!token?.address) return
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
      address: CONTRACTS.faucet,
      abi: GiwaFaucetAbi,
      functionName: "claim",
      args: [token.address],
    })
  }

  return (
    <div
      className="rounded-xl card-accent-faucet"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-faucet-soft)", color: "var(--accent-faucet)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>Faucet</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-dim)" }}>Claim test tokens</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--accent-faucet-soft)", color: "var(--accent-faucet)" }}>
            {FAUCET_TOKENS.length} tokens
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FAUCET_TOKENS.map((t, i) => (
            <button
              key={t.address || i}
              onClick={() => setSelectedIdx(i)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: selectedIdx === i ? "var(--accent-faucet-soft)" : "var(--btn-ghost-bg)",
                color: selectedIdx === i ? "var(--accent-faucet)" : "var(--text-dim)",
                border: selectedIdx === i ? "1px solid var(--accent-faucet)" : "1px solid transparent",
              }}
            >
              {t.symbol}
            </button>
          ))}
        </div>

        <div className="space-y-2 text-xs" style={{ color: "var(--text-dim)" }}>
          <div className="flex justify-between">
            <span>Claim Amount</span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{fmt(rawClaimable)} {symbol || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Faucet Balance</span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{fmt(rawFaucet)} {symbol || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Your Balance</span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{fmt(rawUser)} {symbol || "..."}</span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={!token?.address || isPending || switchStatus === "switching" || isOnCooldown || rawFaucet < rawClaimable}
          className="btn-accent-faucet w-full py-2.5 rounded-lg text-sm font-semibold"
        >
          {switchStatus === "switching"
            ? "Switching..."
            : isPending
              ? "Claiming..."
              : isOnCooldown
                ? `Next claim in ${formatted}`
                : rawFaucet < rawClaimable
                  ? "Faucet depleted"
                  : `Claim ${fmt(rawClaimable)} ${symbol || ""}`}
        </button>

        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}
      </div>
    </div>
  )
}
