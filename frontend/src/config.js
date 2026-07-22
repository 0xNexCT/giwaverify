export const CONTRACTS = {
  demoVerifier: "0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e",
  verifyPass: "0x3e43CdF61bE443133Cd02f7F4785bC92c8a505a7",
  swap: "0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B",
  vote: "0x21b79389c3820b975961212b7da16b732982edf1",
  governanceBadge: "0xAe6612cAc8957fc069B24055Ae9b288bB350105d",
  gvf: "0x3b3780B42716B40150859bfAEAab103a8ED0Ad76",
  faucet: "0xd478f71086146539aad272f74aa7e73ee1ba9a4b",
}

export const FAUCET_TOKENS = [
  { address: "0xaeb7b16e9fd7dbb7c815f102e3ec9d44d4358887", symbol: "GVA", name: "GiwaVerified Alpha" },
  { address: "0x7c9d5163eabb67417107a0a0e3df0397a1ad3d03", symbol: "GVB", name: "GiwaVerified Beta" },
  { address: "0xe9d91031b2c330faf5d6f1cd11981b06dc208a6e", symbol: "GVC", name: "GiwaVerified Gamma" },
  { address: "0x52d57b37f0e5c9fece966bc47ed0ca2e7cf78673", symbol: "GVD", name: "GiwaVerified Delta" },
  { address: "0x58c5c8641450609275f38376f614cf328db49df0", symbol: "GVE", name: "GiwaVerified Epsilon" },
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
