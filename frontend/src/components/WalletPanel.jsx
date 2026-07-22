import { useEffect, useRef, useState, useCallback } from "react"
import { useBalance, useReadContract, useAccount, useDisconnect } from "wagmi"
import { FAUCET_TOKENS } from "../config"
import testTokenAbi from "../abis/TestToken.json"

function TokenRow({ token, address, onRefetch }) {
  const { data: raw, isPending, refetch } = useReadContract({
    address: token.address,
    abi: testTokenAbi,
    functionName: "balanceOf",
    args: [address],
    query: { enabled: !!address },
  })

  const bal = raw ? (Number(raw) / 10 ** 18).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"

  useEffect(() => {
    if (onRefetch) onRefetch(refetch)
  }, [refetch, onRefetch])

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "var(--bg-accent-soft)", color: "var(--text-accent)" }}
        >
          {token.symbol[0]}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{token.symbol}</div>
          <div className="text-xs" style={{ color: "var(--text-dim)" }}>{token.name}</div>
        </div>
      </div>
      <div className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
        {isPending ? (
          <span className="inline-block w-16 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--bg-card)" }} />
        ) : (
          bal
        )}
      </div>
    </div>
  )
}

export default function WalletPanel({ open, onClose }) {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const panelRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [refreshFns, setRefreshFns] = useState([])

  const { data: nativeBalance, isPending: nativePending } = useBalance({ address })

  const registerRefetch = useCallback((fn) => {
    setRefreshFns((prev) => (prev.includes(fn) ? prev : [...prev, fn]))
  }, [])

  function handleRefresh() {
    refreshFns.forEach((fn) => fn())
  }

  function handleCopy() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest(".wallet-trigger")) {
        onClose()
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, onClose])

  const nativeFormatted = nativeBalance
    ? Number(nativeBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : "0"

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        />
      )}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 transform transition-transform duration-200 ease-in-out overflow-y-auto"
        style={{
          width: 360,
          transform: open ? "translateX(0)" : "translateX(100%)",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border-card)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 h-16 border-b" style={{ borderColor: "var(--border-header)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Wallet</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* address row */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            {address ? (
              <>
                <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded transition-colors"
                  style={{ color: copied ? "var(--text-accent)" : "var(--text-dim)" }}
                  title={copied ? "Copied!" : "Copy address"}
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <span className="text-sm" style={{ color: "var(--text-dim)" }}>Not connected</span>
            )}
          </div>
          <button
            onClick={disconnect}
            aria-label="Disconnect wallet"
            title="Disconnect wallet"
            className="flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ width: 32, height: 32, color: "var(--text-secondary)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-accent-soft)"; e.currentTarget.style.color = "#ef4444" }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
          </button>
        </div>

        {/* balances section */}
        {address && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Balances</span>
            <button
              onClick={handleRefresh}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-dim)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
              title="Refresh balances"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>

          {/* native ETH */}
          <div className="flex items-center justify-between py-2.5 border-t" style={{ borderColor: "var(--border-card)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--bg-accent-soft)", color: "var(--text-accent)" }}
              >
                ETH
              </div>
              <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>ETH</div>
            </div>
            <div className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
              {nativePending ? (
                <span className="inline-block w-16 h-4 rounded animate-pulse" style={{ backgroundColor: "var(--bg-card)" }} />
              ) : (
                nativeFormatted
              )}
            </div>
          </div>

          {/* token balances */}
          <div className="border-t" style={{ borderColor: "var(--border-card)" }}>
            {FAUCET_TOKENS.map((token) => (
              <TokenRow key={token.address} token={token} address={address} onRefetch={registerRefetch} />
            ))}
          </div>

          {/* empty state */}
          {!nativePending && Number(nativeFormatted) === 0 && (
            <div className="text-center py-10">
              <svg
                className="mx-auto mb-3"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-dim)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>No tokens yet.</p>
            </div>
          )}
        </div>
        )}

        {/* bottom hint */}
        <div className="px-5 py-4 mt-auto border-t" style={{ borderColor: "var(--border-card)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>GIWA Sepolia, Testnet</span>
          </div>
        </div>
      </div>
    </>
  )
}
