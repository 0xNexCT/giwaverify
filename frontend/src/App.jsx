import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http, createConfig } from "wagmi"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { GIWA_CHAIN, WALLETCONNECT_PROJECT_ID } from "./config"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [GIWA_CHAIN],
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: "okxWallet" }),
    injected({ target: "rabby" }),
    injected({ target: "phantom" }),
    coinbaseWallet({ appName: "GiwaVerify" }),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  transports: { [GIWA_CHAIN.id]: http(GIWA_CHAIN.rpc) },
})

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-[#0a0a0b] text-white">
          <Header />
          <main className="max-w-5xl mx-auto px-6 py-12">
            <Dashboard />
          </main>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
