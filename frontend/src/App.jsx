import { useState, useEffect, Component } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http, createConfig } from "wagmi"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { GIWA_CHAIN, WALLETCONNECT_PROJECT_ID } from "./config"
import Header from "./components/Header"
import WalletModal from "./components/WalletModal"
import Home from "./pages/Home"
import FaucetPage from "./pages/FaucetPage"
import SwapPage from "./pages/SwapPage"
import GovernancePage from "./pages/GovernancePage"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
          <div className="max-w-lg text-center">
            <h1 className="text-xl font-bold mb-4">Something went wrong</h1>
            <pre className="text-sm text-red-400 bg-zinc-900 p-4 rounded-lg overflow-auto max-h-48 mb-4">{this.state.error?.message}</pre>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }} className="px-6 py-2 bg-white text-black rounded-lg text-sm font-semibold">Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

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
  transports: { [GIWA_CHAIN.id]: http(GIWA_CHAIN.rpcUrls.default.http[0]) },
})

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("giwaverify-theme") || "dark" } catch { return "dark" }
  })
  const [showModal, setShowModal] = useState(false)
  const onConnectRequest = () => setShowModal(true)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try { localStorage.setItem("giwaverify-theme", theme) } catch {}
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }

  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header theme={theme} onToggleTheme={toggleTheme} onConnectRequest={onConnectRequest} />
            <main className="px-6 md:px-12 lg:px-20 py-12 animate-in">
              <Routes>
                <Route path="/" element={<Home onConnectRequest={onConnectRequest} />} />
                <Route path="/faucet" element={<FaucetPage onConnectRequest={onConnectRequest} />} />
                <Route path="/swap" element={<SwapPage onConnectRequest={onConnectRequest} />} />
                <Route path="/governance" element={<GovernancePage onConnectRequest={onConnectRequest} />} />
              </Routes>
            </main>
            {showModal && <WalletModal onClose={() => setShowModal(false)} />}
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}
