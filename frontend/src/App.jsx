import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http, createConfig } from "wagmi"
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { GIWA_CHAIN, WALLETCONNECT_PROJECT_ID } from "./config"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Dashboard from "./components/Dashboard"

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [GIWA_CHAIN],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "GiwaVerify" }),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  transports: { [GIWA_CHAIN.id]: http(GIWA_CHAIN.rpc) },
})

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <Header />
          <Hero />
          <Dashboard />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
