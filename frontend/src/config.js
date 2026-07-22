export const CONTRACTS = {
  demoVerifier: "0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e",
  verifyPass: "0x3e43CdF61bE443133Cd02f7F4785bC92c8a505a7",
  swap: "0x21509BD39AA972FFCABd8A16C90790Ea4d0b8EC3",
  vote: "0xE29C388f46545F65EE7fbAcaCcF7B20Ed5C19233",
  governanceBadge: "0xa070EF81Af0EA0B595E112aDe9bD3aFb92204674",
  gvf: "0x48A227d0fcc84602c2af7a55918Fe473b51ab1FB",
  faucet: "0x9a112Aa851116425A745c0199A2b7D7706841190",
}

export const FAUCET_TOKENS = [
  { address: "0x9F03e390725216E38dBcb9106B4A6ec2611da7b2", symbol: "GVA", name: "GiwaVerified Alpha" },
  { address: "0x1EE1c3516eB72B79f2d6BE419Bf4fFAd6088225e", symbol: "GVB", name: "GiwaVerified Beta" },
  { address: "0xdBFe78649585CF656D99f73A036093ca4DCF9ada", symbol: "GVC", name: "GiwaVerified Gamma" },
  { address: "0x40405F98E2a646ebBFb5ab55806a0a118E04a286", symbol: "GVD", name: "GiwaVerified Delta" },
  { address: "0x48CaFE7eB73330E07B9dF0C61D4012aD0aD2c813", symbol: "GVE", name: "GiwaVerified Epsilon" },
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

const envProjectId = typeof import.meta !== "undefined" ? import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID : undefined
export const WALLETCONNECT_PROJECT_ID = envProjectId || "a7a3a5a5a5a5a5a5a5a5a5a5a5a5a5a5"
