# GiwaVerify

**KYC-gated dApp ecosystem on GIWA Chain.**

GiwaVerify is a multi-page public web application that provides a verification layer for the GIWA L2 ecosystem. Built for the GASOK 2026 hackathon.

## Public by Default, Verified by Design

- **Anyone can browse** the landing page, Faucet, P2P Marketplace, and Governance pages.
- **Only write actions** (claim tokens, buy listings, create proposals, vote) require a connected wallet with a valid Dojang attestation.
- If your wallet is not connected, actionable buttons prompt you to connect.
- If your wallet is connected but not KYC-verified, a clear message explains the requirement.
- If your wallet is connected and verified, full functionality is unlocked.

## Routes

| Route | Page |
|---|---|
| `/` | Home — landing with Hero, About, Features, Benefits, CTA |
| `/faucet` | Faucet — claim test tokens |
| `/p2p` | P2P Marketplace — trade with verified peers |
| `/governance` | Governance — create proposals and vote |

## Stack

- **React 19** + **Vite 8**
- **react-router-dom** (BrowserRouter with catch-all rewrite for SPA)
- **wagmi** + **viem** — wallet connection and contract interaction
- **Tailwind CSS** — styling
- **Vercel** — hosting

## Smart Contracts (GIWA Sepolia)

| Contract | Address |
|---|---|
| DemoVerifier | `0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e` |
| Faucet | `0xE7CC5F382B78F2b70f924C10a4bd2aDA6C45dBEf` |
| P2P | `0x071F8A30A75dC3d586Fe6092Ac028AD283475f0a` |
| Governance | `0xD0942a76ABA00f7A1988F4EEE48d7ab59Ddc6AC5` |

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
