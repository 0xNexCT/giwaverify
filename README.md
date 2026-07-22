# GiwaVerify

KYC-gated dApp ecosystem on GIWA Chain. Verified users can claim test tokens, swap via AMM, and vote on governance.

## Live

**Website:** https://giwaverify.vercel.app
**Chain:** GIWA Sepolia (Chain ID: 91342)
**RPC:** https://sepolia-rpc.giwa.io
**Explorer:** https://sepolia-explorer.giwa.io

---

## Modules

### 1. Faucet (`GiwaFaucet.sol`)

5 test tokens (GVA-GVE, 18 decimals each) claimable once per 24h with a lifetime max of 500 tokens per wallet.

| Feature | Detail |
|---|---|
| Claim per tx | 100 tokens (adjustable by owner) |
| Cooldown | 24h (adjustable by owner) |
| Max per wallet | 500 lifetime (adjustable by owner) |
| Owner functions | `setClaimAmount`, `setMaxPerWallet`, `setCooldown`, `resetCooldown`, `resetTotalClaimed`, `reseedToken` |
| Batch claim | `claimAll()` — claims all eligible tokens in one tx |

**Deployments:**
- GiwaFaucet: `0xD478F71086146539Aad272f74aa7E73ee1ba9A4B`
- GVA: `0xaEb7B16e9Fd7DbB7C815f102E3Ec9d44d4358887`
- GVB: `0x7c9D5163EABb67417107A0a0e3DF0397A1ad3D03`
- GVC: `0xE9D91031B2c330fAF5D6f1cd11981B06DC208A6e`
- GVD: `0x52d57B37F0E5C9fEce966BC47ed0Ca2E7Cf78673`
- GVE: `0x58C5c8641450609275F38376F614cf328dB49df0`

### 2. Swap (`GiwaSwap.sol`)

AMM-style token swap with 0.3% fee. Verified users can swap between any pair with liquidity.

| Feature | Detail |
|---|---|
| Fee | 0.3% (3/1000) |
| Liquidity | Owner-managed (add/remove) |
| Slippage | User-specified `minAmountOut` |
| Pairs with liquidity | GVA-GVB (200K each), GVA-GVC (100K), GVB-GVC (100K) |

**Deployment:** `0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B`

### 3. Governance (`GiwaVote.sol`)

On-chain voting with 30-day deadlines. Each verified wallet = 1 vote.

| Feature | Detail |
|---|---|
| Voting period | 30 days from creation |
| GVF per vote | 10 GVF minted automatically per vote |
| Badge | Soulbound NFT minted on first vote |
| Pass/fail | Simple majority (`yesVotes > noVotes`) |
| Implementation | Owner can `markImplemented()` after passing |

**Deployment:** `0x21b79389c3820b975961212b7da16b732982edf1`

**Proposals:**
| ID | Title | Status |
|---|---|---|
| 1 | GVF governance participation token | ✅ Implemented |
| 2 | Add 'Claim All' batch function | ✅ Implemented |
| 3 | Increase faucet claim to 200 GVA | 🟡 Active |
| 4 | Reduce faucet cooldown to 12h | 🟡 Active |
| 5 | Create Developer Grant Fund | 🟡 Active |

### 4. Governance Badge (`GiwaGovernanceBadge.sol`)

Soulbound ERC721. Minted automatically on first vote. Non-transferable.

**Deployment:** `0xAe6612cAc8957fc069B24055Ae9b288bB350105d`

### 5. GVF Token (`GVF.sol`)

Non-tradeable governance participation ERC20. 10 GVF minted per vote. Not on faucet or swap.

**Deployment:** `0x3b3780B42716B40150859bfAEAab103a8ED0Ad76`

---

## Smart Contracts

| Contract | File | Deployed |
|---|---|---|
| GiwaFaucet | `src/GiwaFaucet.sol` | ✅ |
| GiwaSwap | `src/GiwaSwap.sol` | ✅ |
| GiwaVote | `src/GiwaVote.sol` | ✅ |
| GiwaGovernanceBadge | `src/GiwaGovernanceBadge.sol` | ✅ |
| GVF | `src/GVF.sol` | ✅ |
| GiwaToken | `src/GiwaToken.sol` | ✅ (5 instances) |
| DemoVerifier | `src/DemoVerifier.sol` | ✅ |
| GiwaVerifyPass | `src/GiwaVerifyPass.sol` | ✅ |

---

## Architecture

```
User → MetaMask/Phantom/Rabby → GIWA Chain
                ↓
         DemoVerifier (KYC check)
                ↓
    ┌───────┬────┴────┬───────┐
    │       │         │       │
  Faucet  Swap   Governance  P2P
    │       │         │
    │       │    ┌────┴────┐
    │       │    │         │
    │       │  Badge      GVF
    │       │  (ERC721)   (ERC20)
    │       │
  Tokens (GVA-GVE, ERC20)
```

## Tech Stack

- **Frontend:** React + Vite + wagmi v2 + viem
- **Smart Contracts:** Solidity 0.8.28 + Foundry
- **Verification:** Dojang attestations (KYC)
- **Deployment:** Vercel (frontend) + Forge (contracts)
- **Wallet Connect:** WalletConnect v2

---

## Local Development

```bash
# Install dependencies
cd frontend && npm install

# Run dev server
npm run dev

# Build contracts
forge build

# Deploy contract
forge script script/DeployVoteV2.s.sol --rpc-url <RPC> --broadcast --private-key <PK>

# Deploy frontend
npx vercel --prod
```

---

## Deployment History

| Date | Change |
|---|---|
| Initial | GiwaFaucetV1, TestToken deploy |
| V2 | GiwaFaucetV2 (cooldown, max per wallet) |
| V3 | GiwaFaucetV3 (claimAll), GiwaSwap, GiwaVote, Badge, GVF |
| V3 → Final | GiwaFaucet (no version, configurable params, reset functions) |
| V2 Tokens | Replaced with GiwaToken contracts (minter-controlled) |
| Governance | 5 proposals seeded, 30-day deadlines |
| Swap Liquidity | 100K-200K per pair (GVA-GVB, GVA-GVC, GVB-GVC) |
| UI | Wallet panel, proposal feed, claim flow, swap refetch |

---

## Security Notes

- Private key used for deploys is **NOT** in any frontend file
- All contracts use OpenZeppelin's ERC20 with SafeERC20 recommended
- GiwaSwap has `uint112` reserves — overflow possible at >5.19e33 tokens
- No reentrancy guard on GiwaVote (GVF can be drained via reentrancy)
- Broadcast JSONs contain deployment data — kept in git for traceability
