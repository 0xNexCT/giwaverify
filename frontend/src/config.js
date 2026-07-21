export const CONTRACTS = {
  demoVerifier: "0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e",
  verifyPass: "0x3e43CdF61bE443133Cd02f7F4785bC92c8a505a7",
  p2p: "0x071F8A30A75dC3d586Fe6092Ac028AD283475f0a",
  vote: "0xD0942a76ABA00f7A1988F4EEE48d7ab59Ddc6AC5",
  faucet: "", // GiwaFaucet — to fill after deploy
}

export const FAUCET_TOKENS = [
  { address: "", symbol: "GVA", name: "GiwaVerified Alpha" },
  { address: "", symbol: "GVB", name: "GiwaVerified Beta" },
  { address: "", symbol: "GVC", name: "GiwaVerified Gamma" },
  { address: "", symbol: "GVD", name: "GiwaVerified Delta" },
  { address: "", symbol: "GVE", name: "GiwaVerified Epsilon" },
]

export const GIWA_CHAIN = {
  id: 91342,
  name: "GIWA Sepolia",
  rpc: "https://sepolia-rpc.giwa.io",
  flashblocksRpc: "https://sepolia-rpc-flashblocks.giwa.io",
  explorer: "https://sepolia-explorer.giwa.io",
  currency: { name: "ETH", symbol: "ETH", decimals: 18 },
}

export const WALLETCONNECT_PROJECT_ID = "a7a3a5a5a5a5a5a5a5a5a5a5a5a5a5a5"
