# GiwaVerify

KYC-gated dApp on GIWA Chain. Right now the website is live for anyone to test. When we actually launch, only KYC-verified users will get access — same as it says on the site.

**Website:** https://giwaverify.vercel.app
**Chain:** GIWA Sepolia (ID: 91342)
**RPC:** https://sepolia-rpc.giwa.io
**Explorer:** https://sepolia-explorer.giwa.io

---

## What's inside

### 1. Faucet

5 test tokens — GVA, GVB, GVC, GVD, GVE (18 decimals each). You can claim 100 of each once every 24 hours, max 500 per wallet lifetime. Owner can tweak claim amount, cooldown, max per wallet, and even reset counters or refill tokens.

- GiwaFaucet: `0xD478F71086146539Aad272f74aa7E73ee1ba9A4B`
- GVA: `0xaEb7B16e9Fd7DbB7C815f102E3Ec9d44d4358887`
- GVB: `0x7c9D5163EABb67417107A0a0e3DF0397A1ad3D03`
- GVC: `0xE9D91031B2c330fAF5D6f1cd11981B06DC208A6e`
- GVD: `0x52d57B37F0E5C9fEce966BC47ed0Ca2E7Cf78673`
- GVE: `0x58C5c8641450609275F38376F614cf328dB49df0`

### 2. Swap

Basic AMM with 0.3% fee. If there's liquidity in a pair, verified users can swap tokens. Owner handles liquidity. Right now these pairs have liquidity:

- GVA ↔ GVB (200K each)
- GVA ↔ GVC (100K each)
- GVB ↔ GVC (100K each)

`0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B`

### 3. Governance

Anyone verified can create or vote on proposals. Each vote mints 10 GVF and a soulbound badge NFT. Voting stays open for 30 days. If yes votes outnumber no votes, the owner can mark it as implemented.

`0x21b79389c3820b975961212b7da16b732982edf1`

**Current proposals:**

| ID | Title | Status |
|---|---|---|
| 1 | GVF governance participation token | ✅ Done |
| 2 | Add 'Claim All' batch function | ❌ Removed — didn't make sense for the UX |
| 3 | Increase faucet claim to 200 GVA | 🟡 Open |
| 4 | Reduce faucet cooldown to 12h | 🟡 Open |
| 5 | Create Developer Grant Fund (100K GVA) | 🟡 Open |

### 4. Governance Badge

Soulbound ERC721. You get one when you vote for the first time. Can't transfer it.

`0xAe6612cAc8957fc069B24055Ae9b288bB350105d`

### 5. GVF Token

Non-tradeable ERC20. 10 GVF minted per vote. Not on the faucet or swap.

`0x3b3780B42716B40150859bfAEAab103a8ED0Ad76`

---

## How it all fits together

```
Wallet → GIWA Chain
          ↓
   DemoVerifier (checks KYC)
          ↓
   Faucet | Swap | Governance
                  |
            Badge + GVF
```

You connect your wallet, pass KYC verification, and you can claim tokens, swap them, or vote on proposals. Your first vote mints a badge and some GVF.

---

## Tech

- Frontend: React + Vite + wagmi + viem
- Contracts: Solidity 0.8.28 + Foundry
- KYC: Dojang attestations
- Deployed on: Vercel (site) + Forge (contracts)

---

## Running locally

```bash
cd frontend && npm install && npm run dev
```

---

## Contracts

| Contract | Deployed |
|---|---|
| GiwaFaucet | ✅ |
| GiwaSwap | ✅ |
| GiwaVote | ✅ |
| GiwaGovernanceBadge | ✅ |
| GVF | ✅ |
| GiwaToken (x5) | ✅ |
| DemoVerifier | ✅ |
| GiwaVerifyPass | ✅ |

---

## Stuff we did along the way

- Went from FaucetV1 to V3 to a final version with no version number and proper config
- Replaced the old V2 tokens with new GiwaToken contracts (minter role based)
- Set up 5 proposals on a new GiwaVote contract
- Added swap liquidity for 3 pairs
- Fixed a bunch of frontend bugs — the "You voted: Reject" false positive, gas limit issues, claim/swapping spinners
- Got a full security audit done (findings listed up top)

---

## Heads up

- The site is public for testing right now. At launch only KYC wallets will get in.
- GiwaSwap uses uint112 for reserves — if reserves somehow hit 5.19e33+ tokens, things break
- GiwaVote doesn't have a reentrancy guard
- Broadcast JSONs with deployment data are in the repo (we left them for reference)
