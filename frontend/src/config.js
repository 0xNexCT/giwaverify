export const CONTRACTS = {
  demoVerifier: "0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e",
  verifyPass: "0x3e43CdF61bE443133Cd02f7F4785bC92c8a505a7",
  swap: "0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B",
  vote: "0x9378D1c5F4cCe1DD13A19187BFb5ff24ACb84253",
  governanceBadge: "0xAe6612cAc8957fc069B24055Ae9b288bB350105d",
  gvf: "0x3b3780B42716B40150859bfAEAab103a8ED0Ad76",
  faucet: "0x99586357d87B36351b52AEFc1667e4199E39E24b",
}

export const FAUCET_TOKENS = [
  { address: "0x05E894cE2C176Dbc30176626efa24850aF2af0e2", symbol: "GVA", name: "GiwaVerified Alpha" },
  { address: "0x00E8F81208A33BF516cD7Dd46e7597dFB40F5a25", symbol: "GVB", name: "GiwaVerified Beta" },
  { address: "0x263a171641882Db6b48210E1ea477DB3D1d34509", symbol: "GVC", name: "GiwaVerified Gamma" },
  { address: "0x82868dA66735FCD28185b9BEFa9fF2AeE4BA3FB8", symbol: "GVD", name: "GiwaVerified Delta" },
  { address: "0xEEd497B085113e8C3FC563935582a72F90BdE528", symbol: "GVE", name: "GiwaVerified Epsilon" },
]

export const GIWA_CHAIN = {
  id: 91342,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia-rpc.giwa.io"] },
    flashblocks: { http: ["https://sepolia-rpc-flashblocks.giwa.io"] },
  },
  blockExplorers: {
    default: { name: "GIWA Explorer", url: "https://sepolia-explorer.giwa.io" },
  },
}

export const WALLETCONNECT_PROJECT_ID = "a7a3a5a5a5a5a5a5a5a5a5a5a5a5a5a5"
