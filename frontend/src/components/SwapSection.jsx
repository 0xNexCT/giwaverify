import { useState, useEffect } from "react"
import { useWriteContract, useReadContract, useAccount, useConfig } from "wagmi"
import { waitForTransactionReceipt } from "wagmi/actions"
import { parseUnits } from "viem"
import { CONTRACTS, GIWA_CHAIN, FAUCET_TOKENS } from "../config"
import GiwaSwapAbi from "../abis/GiwaSwap.json"

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

const ERC20_FULL_ABI = [
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
]

const DECIMALS = 18
const DIVISOR = 10n ** BigInt(DECIMALS)
const SLIPPAGE_BPS = 50n
const PENDING_MIN_MS = 3000

const SPEED_LABELS = { slow: "Slow", medium: "Medium", fast: "Fast" }
const SPEED_PARAMS = {
  slow: { maxPriorityFeePerGas: 1_000_000n, maxFeePerGas: 2_000_000n },
  medium: { maxPriorityFeePerGas: 10_000_000n, maxFeePerGas: 20_000_000n },
  fast: { maxPriorityFeePerGas: 100_000_000n, maxFeePerGas: 200_000_000n },
}

export default function SwapSection({ isConnected, onConnectRequest }) {
  const { address } = useAccount()
  const [fromToken, setFromToken] = useState(FAUCET_TOKENS[0])
  const [toToken, setToToken] = useState(FAUCET_TOKENS[1])
  const [amountIn, setAmountIn] = useState("")
  const [debouncedAmount, setDebouncedAmount] = useState("")
  const [switchStatus, setSwitchStatus] = useState("idle")
  const [approveStep, setApproveStep] = useState("idle")
  const [swapStep, setSwapStep] = useState("idle")
  const [speed, setSpeed] = useState("medium")
  const [showSettings, setShowSettings] = useState(false)
  const { writeContractAsync, isPending } = useWriteContract()
  const wagmiConfig = useConfig()

  useEffect(() => {
    if (approveStep !== "approved") return
    const t = setTimeout(() => setApproveStep("idle"), 2000)
    return () => clearTimeout(t)
  }, [approveStep])

  useEffect(() => {
    if (swapStep !== "success") return
    const t = setTimeout(() => {
      setSwapStep("idle")
      setAmountIn("")
      setDebouncedAmount("")
      Promise.all([refetchAllowance(), refetchFromBalance(), refetchReserves()])
    }, 2000)
    return () => clearTimeout(t)
  }, [swapStep])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(amountIn), 300)
    return () => clearTimeout(t)
  }, [amountIn])

  useEffect(() => {
    if (!showSettings) return
    const close = () => setShowSettings(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [showSettings])

  const parsedIn = debouncedAmount ? parseUnits(debouncedAmount, DECIMALS) : 0n

  const { data: quoteResult, isError: quoteFailed } = useReadContract({
    address: CONTRACTS.swap,
    abi: GiwaSwapAbi,
    functionName: "quote",
    args: [fromToken.address, toToken.address, parsedIn],
    query: { enabled: !!CONTRACTS.swap && parsedIn > 0n },
  })

  const quoteOk = quoteResult && quoteResult[1] === true
  const amountOutRaw = quoteOk ? quoteResult[0] : undefined
  const amountOut = amountOutRaw != null ? Number(amountOutRaw) / Number(DIVISOR) : null

  const minAmountOut = amountOutRaw != null
    ? (amountOutRaw * (10000n - SLIPPAGE_BPS)) / 10000n
    : 0n

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address,
    abi: ERC20_FULL_ABI,
    functionName: "allowance",
    args: [address, CONTRACTS.swap],
    query: { enabled: !!address && !!CONTRACTS.swap },
  })

  const { data: fromBalance, refetch: refetchFromBalance } = useReadContract({
    address: fromToken.address,
    abi: ERC20_FULL_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  })

  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: CONTRACTS.swap,
    abi: GiwaSwapAbi,
    functionName: "getReserves",
    args: [fromToken.address, toToken.address],
    query: { enabled: !!CONTRACTS.swap },
  })

  const needsApproval = allowance != null && parsedIn > 0n && allowance < parsedIn
  const insufficientBalance = fromBalance != null && parsedIn > 0n && fromBalance < parsedIn
  const hasLiquidity = reserves != null && reserves[0] > 0n && reserves[1] > 0n

  function fmt(n) {
    if (n == null) return "-"
    return n.toString()
  }

  function fmtCompact(big) {
    if (big == null) return "-"
    const n = Number(big) / Number(DIVISOR)
    if (n >= 1000) return Math.round(n).toString()
    if (n >= 1) return n.toFixed(2)
    return n.toFixed(4)
  }

  function formatRate() {
    if (amountIn == null || amountIn === "" || amountOut == null || amountOut === 0) return null
    const input = parseFloat(amountIn)
    if (input === 0) return null
    const rate = amountOut / input
    return `1 ${fromToken.symbol} ≈ ${rate.toFixed(4)} ${toToken.symbol}`
  }

  const rateText = formatRate()
  const gasParams = SPEED_PARAMS[speed]

  function toggleDirection() {
    const tmp = fromToken
    setFromToken(toToken)
    setToToken(tmp)
    setAmountIn("")
    setDebouncedAmount("")
    setSwitchStatus("idle")
  }

  async function handleTx(fn) {
    setSwitchStatus("idle")
    if (window.ethereum && Number(window.ethereum.chainId) !== GIWA_CHAIN.id) {
      setSwitchStatus("switching")
      const ok = await ensureChain()
      if (!ok) { setSwitchStatus("error"); return }
      setSwitchStatus("idle")
    }
    fn()
  }

  async function doApprove() {
    setApproveStep("approving")
    try {
      const hash = await writeContractAsync({
        address: fromToken.address,
        abi: ERC20_FULL_ABI,
        functionName: "approve",
        args: [CONTRACTS.swap, parsedIn],
        ...gasParams,
      })
      setApproveStep("pending")
      const t0 = Date.now()
      await waitForTransactionReceipt(wagmiConfig, { hash })
      const remaining = PENDING_MIN_MS - (Date.now() - t0)
      if (remaining > 0) await new Promise(r => setTimeout(r, remaining))
      await refetchAllowance()
      setApproveStep("approved")
    } catch {
      setApproveStep("idle")
    }
  }

  async function doSwap() {
    setSwapStep("swapping")
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      const hash = await writeContractAsync({
        address: CONTRACTS.swap,
        abi: GiwaSwapAbi,
        functionName: "swap",
        args: [fromToken.address, toToken.address, parsedIn, minAmountOut, deadline],
        ...gasParams,
      })
      await waitForTransactionReceipt(wagmiConfig, { hash })
      await Promise.all([refetchAllowance(), refetchFromBalance(), refetchReserves()])
      await new Promise((r) => setTimeout(r, 3000))
      setSwapStep("success")
    } catch {
      setSwapStep("idle")
    }
  }

  function handleApprove() { handleTx(doApprove) }
  function handleSwap() { handleTx(doSwap) }

  const waiting = isPending || approveStep !== "idle" || swapStep !== "idle"

  function renderButton() {
    if (!isConnected) {
      return (
        <button onClick={onConnectRequest} className="btn-accent-p2p w-full py-3.5 rounded-lg text-base font-semibold">
          Connect Wallet to Swap
        </button>
      )
    }
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return (
        <button disabled className="w-full py-3.5 rounded-lg text-base font-semibold" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-dim)", cursor: "not-allowed" }}>
          Enter an amount
        </button>
      )
    }
    if (!hasLiquidity || quoteFailed) {
      return (
        <button disabled className="w-full py-3.5 rounded-lg text-base font-semibold" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-dim)", cursor: "not-allowed" }}>
          No liquidity
        </button>
      )
    }
    if (insufficientBalance) {
      return (
        <button disabled className="w-full py-3.5 rounded-lg text-base font-semibold" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-amber)", cursor: "not-allowed" }}>
          Insufficient {fromToken.symbol} balance
        </button>
      )
    }
    if (needsApproval) {
      return (
        <button
          onClick={handleApprove}
          disabled={waiting}
          className="btn-accent-p2p w-full py-3.5 rounded-lg text-base font-semibold"
        >
          {switchStatus === "switching" ? "Switching..."
            : approveStep === "approving" ? `Approving ${fromToken.symbol}...`
            : approveStep === "pending" ? "Pending..."
            : approveStep === "approved" ? "Approved ✓"
            : `Approve ${fromToken.symbol}`}
        </button>
      )
    }
    return (
      <button
        onClick={handleSwap}
        disabled={waiting}
        className="btn-accent-p2p w-full py-3.5 rounded-lg text-base font-semibold"
      >
        {switchStatus === "switching" ? "Switching..."
          : swapStep === "swapping" ? "Swapping..."
          : swapStep === "success" ? "Swap successful ✓"
          : "Swap"}
      </button>
    )
  }

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
            <h3 className="text-lg font-semibold truncate" style={{ color: "var(--text-primary)" }}>Swap</h3>
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>Swap tokens via AMM liquidity pools</p>
          </div>
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                backgroundColor: showSettings ? "var(--bg-card-hover)" : "transparent",
                color: showSettings ? "var(--text-primary)" : "var(--text-dim)",
                border: "1px solid",
                borderColor: showSettings ? "var(--border-card)" : "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-card-hover)"
                e.currentTarget.style.borderColor = "var(--border-card)"
              }}
              onMouseLeave={(e) => {
                if (!showSettings) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.borderColor = "transparent"
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
            {showSettings && (
              <div
                className="absolute right-0 top-10 z-50 rounded-xl p-4 min-w-[180px] animate-scale"
                style={{ backgroundColor: "var(--bg-modal)", border: "1px solid var(--border-modal)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-dim)" }}>TRANSACTION SPEED</p>
                {["slow", "medium", "fast"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: speed === s ? "var(--accent-p2p-soft)" : "transparent",
                      color: speed === s ? "var(--accent-p2p)" : "var(--text-secondary)",
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: speed === s ? "var(--accent-p2p)" : "var(--text-dim)" }}
                    >
                      {speed === s && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-p2p)" }} />}
                    </div>
                    <span className="font-medium">{SPEED_LABELS[s]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>From</label>
            {address && (
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                Balance: {fmtCompact(fromBalance)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={amountIn}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "")
                if ((v.match(/\./g) || []).length <= 1) setAmountIn(v)
              }}
              placeholder="0.0"
              className="flex-1 rounded-lg px-4 py-3 text-base"
              style={{ border: "1px solid var(--border-input)", backgroundColor: "var(--bg-card)" }}
            />
            <select
              value={fromToken.address}
              onChange={(e) => setFromToken(FAUCET_TOKENS.find(t => t.address === e.target.value) || fromToken)}
              className="rounded-lg px-3 py-3 text-sm font-medium"
              style={{ border: "1px solid var(--border-input)", backgroundColor: "var(--bg-card-hover)", color: "var(--text-primary)", minWidth: "80px" }}
            >
              {FAUCET_TOKENS.map(t => (
                <option key={t.address} value={t.address}>{t.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={toggleDirection}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-card)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>To</label>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg px-4 py-3 text-base" style={{ border: "1px solid var(--border-input)", backgroundColor: "var(--bg-card-hover)", color: amountOut != null ? "var(--text-primary)" : "var(--text-dim)" }}>
              {amountOut != null ? fmt(amountOut) : (debouncedAmount ? "-" : "0.0")}
            </div>
            <select
              value={toToken.address}
              onChange={(e) => setToToken(FAUCET_TOKENS.find(t => t.address === e.target.value) || toToken)}
              className="rounded-lg px-3 py-3 text-sm font-medium"
              style={{ border: "1px solid var(--border-input)", backgroundColor: "var(--bg-card-hover)", color: "var(--text-primary)", minWidth: "80px" }}
            >
              {FAUCET_TOKENS.map(t => (
                <option key={t.address} value={t.address}>{t.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {rateText && !quoteFailed && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>{rateText}</span>
            {reserves && reserves[0] > 0n && reserves[1] > 0n && (
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                Pool: {fmtCompact(reserves[0])} / {fmtCompact(reserves[1])}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-1">
            {needsApproval && approveStep === "idle" && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-amber)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <span>First-time approval required</span>
              </div>
            )}
            <div className="flex-1" />
            <span className="text-[0.65rem]" style={{ color: "var(--text-dim)" }}>
              Speed: {SPEED_LABELS[speed]}
            </span>
          </div>
          {renderButton()}
        </div>

        {switchStatus === "switching" && (
          <p className="text-xs" style={{ color: "var(--accent-p2p)" }}>Switching to GIWA network...</p>
        )}
        {switchStatus === "error" && (
          <p className="text-xs" style={{ color: "var(--text-amber)" }}>Switch rejected. Please switch to GIWA manually.</p>
        )}
      </div>
    </div>
  )
}
