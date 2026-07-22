export const CONTRACTS = {
  demoVerifier: "0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e",
  verifyPass: "0x3e43CdF61bE443133Cd02f7F4785bC92c8a505a7",
  swap: "0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B",
  vote: "0xb0D93DB8a917c99ef9884Ea492B978Ab0099ed28",
  governanceBadge: "0xBb877Ce66a916e1d48cd5775F7971de0C51F5FBE",
  faucet: "0x2BA3f6838C5D12AF133341a527DdffBF618e3988",
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
