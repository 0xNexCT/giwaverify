import { useState, useEffect } from "react"
import { flushSync } from "react-dom"
import { useWriteContract, useReadContract, useAccount } from "wagmi"
import { CONTRACTS, GIWA_CHAIN, FAUCET_TOKENS } from "../config"
import GiwaFaucetAbi from "../abis/GiwaFaucet.json"

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

export default function FaucetSection({ isConnected, onConnectRequest }) {
  const { address } = useAccount()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [switchStatus, setSwitchStatus] = useState("idle")
  const [cd, setCd] = useState(0)
  const [claiming, setClaiming] = useState(false)

  const [addingTokens, setAddingTokens] = useState(false)
  const { writeContractAsync, isPending } = useWriteContract()

  const token = FAUCET_TOKENS[selectedIdx]

  const { data: claimAmount } = useReadContract({
    address: CONTRACTS.faucet,
    abi: GiwaFaucetAbi,
    functionName: "claimAmount",
    query: { enabled: !!CONTRACTS.faucet },
  })

  const { data: rawCooldown, refetch: refetchCooldown } = useReadContract({
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
    return Math.round(n / divisor).toString()
  }

  async function addAllTokens() {
    if (!window.ethereum) return
    setAddingTokens(true)
    for (const t of FAUCET_TOKENS) {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: { address: t.address, symbol: t.symbol, decimals: 18 },
          },
        })
      } catch {}
    }
    setAddingTokens(false)
  }

  async function handleClaim() {
    if (!token?.address) return
    setSwitchStatus("idle")

    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
    }

    try {
      flushSync(() => setClaiming(true))
      try {
        await writeContractAsync({
          address: CONTRACTS.faucet,
          abi: GiwaFaucetAbi,
          functionName: "claim",
          args: [token.address],
          gas: 200000n,
        })
      } catch {
        setCd(0)
        refetchCooldown()
        setClaiming(false)
        return
      }
      await new Promise((r) => setTimeout(r, 3000))
      setCd(86400)
    } catch {
      setCd(0)
      refetchCooldown()
    }
    setClaiming(false)
  }

  return (
    <div
      className="rounded-xl card card-accent-faucet"
      style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-card)", borderRight: "1px solid var(--border-card)", borderBottom: "1px solid var(--border-card)" }}
    >
      <div className="p-7 flex flex-col gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-faucet-soft)", color: "var(--accent-faucet)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" style={{ color: "var(--text-primary)" }}>Faucet</h3>
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>Claim test tokens</p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm font-medium px-4 py-1.5 rounded-lg" style={{ backgroundColor: "var(--accent-faucet-soft)", color: "var(--accent-faucet)" }}>
            {FAUCET_TOKENS.length} tokens
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FAUCET_TOKENS.map((t, i) => (
            <button
              key={t.address || i}
              onClick={() => setSelectedIdx(i)}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: selectedIdx === i ? "var(--accent-faucet-soft)" : "var(--bg-card-hover)",
                color: selectedIdx === i ? "var(--accent-faucet)" : "var(--text-secondary)",
                border: selectedIdx === i ? "1px solid var(--accent-faucet)" : "1px solid transparent",
              }}
            >
              {t.symbol}
            </button>
          ))}
          {isConnected && (
            <button
              onClick={addAllTokens}
              disabled={addingTokens}
              className="text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: "var(--bg-card-hover)",
                color: "var(--accent-faucet)",
                border: "1px solid transparent",
              }}
            >
              {addingTokens ? "Adding..." : "+ Add all to wallet"}
            </button>
          )}
        </div>

        <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <div className="flex justify-between">
            <span>Claim Amount</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{fmt(rawClaimable)} {symbol || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Faucet Balance</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{fmt(rawFaucet)} {symbol || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Your Balance</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{fmt(rawUser)} {symbol || "..."}</span>
          </div>
        </div>

        {(() => {
          if (!isConnected) {
            return (
              <button onClick={onConnectRequest} className="btn-accent-faucet w-full py-3.5 rounded-lg text-base font-semibold">
                Connect Wallet to Claim
              </button>
            )
          }
          return (
            <button
              onClick={handleClaim}
              disabled={!token?.address || claiming || isPending || switchStatus === "switching" || isOnCooldown || rawFaucet < rawClaimable}
              className="btn-accent-faucet w-full py-3.5 rounded-lg text-base font-semibold"
            >
              {switchStatus === "switching"
                ? "Switching..."
                : claiming || isPending
                  ? "Claiming..."
                  : isOnCooldown
                    ? `Next claim in ${formatted}`
                    : rawFaucet < rawClaimable
                      ? "Faucet depleted"
                      : `Claim ${fmt(rawClaimable)} ${symbol || ""}`}
            </button>
          )
        })()}

        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}
      </div>
    </div>
  )
}
