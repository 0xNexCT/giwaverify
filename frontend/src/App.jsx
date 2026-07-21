import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http, createConfig } from "wagmi"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { GIWA_CHAIN, WALLETCONNECT_PROJECT_ID } from "./config"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"

function detectProvider(window, flag) {
  if (typeof window === "undefined") return undefined
  const ethereum = window.ethereum
  if (ethereum?.providers) return ethereum.providers.find((p) => p[flag])
  if (ethereum?.[flag]) return ethereum
  return undefined
}

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [GIWA_CHAIN],
  connectors: [
    injected({ target: "metaMask" }),
    injected({
      target() {
        return {
          id: "okxWallet",
          name: "OKX Wallet",
          provider(window) {
            if (window?.okxwallet) return window.okxwallet
            return detectProvider(window, "isOkxWallet")
          },
        }
      },
    }),
    injected({ target: "rabby" }),
    injected({ target: "phantom" }),
    coinbaseWallet({ appName: "GiwaVerify" }),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  transports: { [GIWA_CHAIN.id]: http(GIWA_CHAIN.rpc) },
})

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("giwaverify-theme") || "dark" } catch { return "dark" }
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try { localStorage.setItem("giwaverify-theme", theme) } catch {}
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="max-w-5xl mx-auto px-6 py-12 animate-in">
          <Dashboard />
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
