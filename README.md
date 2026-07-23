# GiwaVerify

Unofficial community prototype, submitted for GASOK 2026. Not affiliated with GIWA or Upbit.

## What is GiwaVerify?

GiwaVerify is a KYC-gated dApp ecosystem built on GIWA Chain.

Before using any dApp on the platform, users must pass identity verification
through Dojang, GIWA's onchain attestation system powered by Upbit KYC.

Once verified, GiwaVerify unlocks three core modules...

> **Public Test Notice:** This website is currently open for everyone to test. Once live, only wallets with valid Dojang attestations (KYC) will be able to use the dApps. So check it out while you can!

**Website:** https://giwaverify.vercel.app <br>
**Chain:** GIWA Sepolia (ID: 91342) <br>
**RPC:** https://sepolia-rpc.giwa.io <br>
**Explorer:** https://sepolia-explorer.giwa.io

---

## Tech Stack

- **Frontend:** React 19, Vite 8, wagmi v3 + viem, react-router-dom v7, TanStack React Query
- **Styling:** Tailwind CSS v4 with custom CSS custom properties in `index.css`
- **Contracts:** Solidity 0.8.28 + Foundry (forge)
- **KYC:** Dojang attestations via DemoVerifier contract
- **Deployment:** Vercel (frontend), Forge (contracts)

**Supported wallets:** MetaMask, OKX Wallet, Rabby, Phantom, Coinbase Wallet, WalletConnect

---

## What's Working Right Now

### Wallet Connection
A centered modal shows wallet options when you click "Connect Wallet" in the header. The slide-out panel on the right shows your ETH balance, token balances, GVF balance, and governance badge status. You can copy your address, disconnect, or refresh balances from the panel.

Every transaction flow (faucet claim, swap, vote) checks the chain first. If you're not on GIWA, it tries to switch automatically. If the chain isn't in your wallet, it adds it.

### Faucet
5 test tokens (GVA, GVB, GVC, GVD, GVE) at 18 decimals each. You can claim 100 of each token once every 24 hours, with a lifetime max of 500 per wallet. The claim button shows a countdown when you're on cooldown. After claiming, cooldown activates immediately, and balances update 1 second later. The contract has a `claimAll()` batch function but it's not exposed in the UI.

Contracts:
- GiwaFaucet: `0x4E33AEcEC539b6C412145a5178693B0c867caA19`
- GVA: `0x9F03e390725216E38dBcb9106B4A6ec2611da7b2`
- GVB: `0x1EE1c3516eB72B79f2d6BE419Bf4fFAd6088225e`
- GVC: `0xdBFe78649585CF656D99f73A036093ca4DCF9ada`
- GVD: `0x40405F98E2a646ebBFb5ab55806a0a118E04a286`
- GVE: `0x48CaFE7eB73330E07B9dF0C61D4012aD0aD2c813`

### Swap
AMM with a 0.3% fee. Pick a from/to token pair, enter an amount, and the estimated output shows up. If the swap contract needs approval, you get an Approve step first. You can tweak transaction speed (Slow/Medium/Fast) in the settings menu. Reserves for the selected pair are shown.

Swap contract: `0x176a8A769A7c03e2140B7Fb47C6d664Af977B64C`

Liquidity exists for GVA-GVB (200K each), GVA-GVC (100K each), and GVB-GVC (100K each).

### Governance / Voting
Wallets can vote on proposals. Each vote mints 10 GVF tokens and, on your first vote ever, a soulbound Governance Participant badge. Voting lasts 30 days from creation. If yes votes beat no votes at the deadline, the owner can mark it as implemented.

Governance contract: `0xb981D048Db34dFDC3064377C9a95F5a3995f7616`
Badge contract: `0xa070EF81Af0EA0B595E112aDe9bD3aFb92204674`
GVF token: `0x48A227d0fcc84602c2af7a55918Fe473b51ab1FB`

**Proposals:**
| ID | Title | Status |
|---|---|---|
| 1 | GVF governance participation token | Implemented |
| 2 | Add 'Claim All' batch function to the faucet | Active (30-day vote) |
| 3 | Increase faucet claim amount to 200 GVA | Active |
| 4 | Reduce faucet cooldown from 24h to 12h | Active |
| 5 | Create Developer Grant Fund (100K GVA) | Active |

### P2P / Airdrop
The smart contracts exist (GiwaP2P.sol, GiwaAirdrop.sol) and the frontend components are written, but neither is wired to a route yet. They'll show up once the routing is in place.

---

## Local Development

```bash
cd frontend
cp .env.example .env   # set WALLETCONNECT_PROJECT_ID or use the default one in config.js
npm install
npm run dev
```

The frontend connects to deployed contracts on GIWA Sepolia by default. No local chain needed unless you're modifying contracts.

### Contract dev

```bash
forge build
forge test
forge script script/DeployVoteV2.s.sol --rpc-url <RPC> --broadcast --private-key <PK>
```

---

## All Contracts

| Contract | File | Deployed |
|---|---|---|---|
| GiwaFaucet | `src/GiwaFaucet.sol` | `0x4E33AEcE...` |
| GiwaSwap | `src/GiwaSwap.sol` | `0x176a8A76...` |
| GiwaVote | `src/GiwaVote.sol` | `0xb981D048...` |
| GiwaGovernanceBadge | `src/GiwaGovernanceBadge.sol` | `0xa070EF81...` |
| GVF | `src/GVF.sol` | `0x48A227d0...` |
| GiwaToken (x5) | `src/GiwaToken.sol` | Per token above |
| DemoVerifier | `src/DemoVerifier.sol` | `0x7893e1Ac...` |
| GiwaVerifyPass | `src/GiwaVerifyPass.sol` | `0x3e43CdF6...` |
| GiwaP2P | `src/GiwaP2P.sol` | `0x071F8A30...` |
| GiwaAirdrop | `src/GiwaAirdrop.sol` | `0x14dfd4B6...` |

---

## Dev History

- Start with FaucetV1, then V2, then V3, then the final faucet with configurable params and no version number
- Replaced old V2 tokens with new GiwaToken contracts using minter role
- Deployed a new GiwaVote with 5 seeded proposals after the old one had 2
- Added swap liquidity for 3 pairs at 100K-200K each
- Switched deployer wallet balances down to 100 tokens each
- Frontend bug fixes: the "You voted: Reject" false positive, faucet gas limit, claim/swap spinner UX
- Full contract audit completed (findings documented in the repo)
- Public testing mode: PublicVerifier always returns true, no KYC required
- Balance update moved to 1 second after cooldown starts for smoother UX
