# GiwaVerify

Unofficial community prototype, submitted for GASOK 2026. Not affiliated with GIWA or Upbit.

KYC-gated dApps on GIWA Chain. The site is public right now for testing. At launch, only wallets with a valid Dojang attestation will get access.

**Website:** https://giwaverify.vercel.app'
**Chain:** GIWA Sepolia (ID: 91342)
**RPC:** https://sepolia-rpc.giwa.io
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
5 test tokens (GVA, GVB, GVC, GVD, GVE) at 18 decimals each. You can claim 100 of each token once every 24 hours, with a lifetime max of 500 per wallet. The claim button shows a countdown when you're on cooldown. The contract has a `claimAll()` batch function but it's not exposed in the UI.

Contracts:
- GiwaFaucet: `0xD478F71086146539Aad272f74aa7E73ee1ba9A4B`
- GVA: `0xaEb7B16e9Fd7DbB7C815f102E3Ec9d44d4358887`
- GVB: `0x7c9D5163EABb67417107A0a0e3DF0397A1ad3D03`
- GVC: `0xE9D91031B2c330fAF5D6f1cd11981B06DC208A6e`
- GVD: `0x52d57B37F0E5C9fEce966BC47ed0Ca2E7Cf78673`
- GVE: `0x58C5c8641450609275F38376F614cf328dB49df0`

### Swap
AMM with a 0.3% fee. Pick a from/to token pair, enter an amount, and the estimated output shows up. If the swap contract needs approval, you get an Approve step first. You can tweak transaction speed (Slow/Medium/Fast) in the settings menu. Reserves for the selected pair are shown. Only verified wallets can swap.

Swap contract: `0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B`

Liquidity exists for GVA-GVB (200K each), GVA-GVC (100K each), and GVB-GVC (100K each).

### Governance / Voting
Verified wallets can vote on proposals. Each vote mints 10 GVF tokens and, on your first vote ever, a soulbound Governance Participant badge. Voting lasts 30 days from creation. If yes votes beat no votes at the deadline, the owner can mark it as implemented.

Governance contract: `0x21b79389c3820b975961212b7da16b732982edf1`
Badge contract: `0xAe6612cAc8957fc069B24055Ae9b288bB350105d`
GVF token: `0x3b3780B42716B40150859bfAEAab103a8ED0Ad76`

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
|---|---|---|
| GiwaFaucet | `src/GiwaFaucet.sol` | `0xD478F710...` |
| GiwaSwap | `src/GiwaSwap.sol` | `0x5095Bff0...` |
| GiwaVote | `src/GiwaVote.sol` | `0x21b79389...` |
| GiwaGovernanceBadge | `src/GiwaGovernanceBadge.sol` | `0xAe6612cA...` |
| GVF | `src/GVF.sol` | `0x3b3780B4...` |
| GiwaToken (x5) | `src/GiwaToken.sol` | Per token above |
| DemoVerifier | `src/DemoVerifier.sol` | `0x7893e1Ac...` |
| GiwaVerifyPass | `src/GiwaVerifyPass.sol` | `0x3e43CdF6...` |
| GiwaP2P | `src/GiwaP2P.sol` | Not wired |
| GiwaAirdrop | `src/GiwaAirdrop.sol` | Not wired |

---

## Dev History

- Start with FaucetV1, then V2, then V3, then the final faucet with configurable params and no version number
- Replaced old V2 tokens with new GiwaToken contracts using minter role
- Deployed a new GiwaVote with 5 seeded proposals after the old one had 2
- Added swap liquidity for 3 pairs at 100K-200K each
- Switched deployer wallet balances down to 100 tokens each
- Frontend bug fixes: the "You voted: Reject" false positive, faucet gas limit, claim/swap spinner UX
- Full contract audit completed (findings documented in the repo)
