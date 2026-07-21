# GiwaVerify — Pitch Deck

---

## Slide 1: Title
**GiwaVerify** — KYC-Gated dApp Ecosystem on GIWA Chain
*Building trust, one verified wallet at a time.*
GASOK Program Application

---

## Slide 2: Problem
- **Sybil Attacks**: Airdrops hijacked by bots, not real users
- **No Trust Layer**: P2P trading full of scammers & rug pulls
- **Wash Voting**: DAOs manipulated by fake accounts
- **Compliance Gap**: Korean Web3 projects need KYC-ready infrastructure

---

## Slide 3: Solution
**GiwaVerify** — A modular dApp ecosystem where only KYC-verified wallets can participate.

| Module | Purpose |
|--------|---------|
| **Verified Airdrop** | Token/NFT distribution to only real users |
| **Verified P2P** | Trusted marketplace — both sides KYC'd |
| **Verified Governance** | Sybil-resistant voting (1 verified wallet = 1 vote) |

---

## Slide 4: Why GIWA Chain?
- **Dojang / OnchainVerifiable**: KYC attestations from Upbit — unique to GIWA
- **Flashblocks**: 200ms preconfirmation for instant UX
- **Upbit Backing**: $10B valuation exchange — built-in user base
- **0 gas cost for verification checks** (read-only calls)

> This project is ONLY possible on GIWA — no other L2 has Dojang.

---

## Slide 5: Architecture
```
┌─────────────────────────────────────────────┐
│              GiwaVerify dApp                │
│           (React + Viem + Tailwind)         │
├──────────────────┬──────────────────────────┤
│   Smart Contracts │   GIWA Testnet (91342)   │
│  ┌────────────┐   │   ┌──────────────────┐   │
│  │ DemoVerifier│   │   │ OnchainVerifiable│   │
│  │  (test)    │   │   │  (prod - Dojang) │   │
│  └─────┬──────┘   │   └────────┬─────────┘   │
│  ┌─────┴──────┐   │            │             │
│  │ GiwaAirdrop│   │   ┌───────┴────────┐    │
│  │ GiwaP2P    │   │   │ IVerifier      │    │
│  │ GiwaVote   │   │   │ Interface      │    │
│  └────────────┘   │   └────────────────┘    │
├──────────────────┴──────────────────────────┤
│  Deployed Contracts (Testnet):               │
│  DemoVerifier: 0x7893...F19e                │
│  GiwaAirdrop:  0x14df...40F8                │
│  GiwaP2P:      0x071F...5f0a                │
│  GiwaVote:     0xD094...6AC5                │
└─────────────────────────────────────────────┘
```

---

## Slide 6: How Users Get Verified
1. **Upbit user** already has KYC done
2. **GIWA Wallet** (launching soon) links wallet to KYC via Dojang
3. **OnchainVerifiable.isVerified("0x...")** returns TRUE
4. **GiwaVerify** grants access — no extra steps for user

> *Demo mode: DemoVerifier contract marks test wallets as verified*

---

## Slide 7: Market Opportunity
- **Korean Web3 Market**: $10B+ in trading volume, strict compliance needs
- **Upbit Users**: 8M+ registered users — built-in target audience
- **GIWA Ecosystem Growth**: New L2 needs dApps to attract users
- **Regulatory Trend**: Travel Rule, KYC becoming mandatory for DeFi

---

## Slide 8: Roadmap

| Phase | Timeline | Goal |
|-------|----------|------|
| **Phase 1+2** | Jun-Jul 2026 | MVP + Testnet (✅ Done) |
| **Phase 3** | Aug-Sep 2026 | Mainnet + Real Dojang integration + User growth |
| **Demo Day @KBW** | Oct 2026 | Pitch to VCs |
| **Phase 4** | Ongoing | GIWA Wallet in-app integration + Scale |

---

## Slide 9: 10-Day Build Progress
| Day | Milestone |
|-----|-----------|
| 1-2 | Smart contracts written & tested (4 contracts) |
| 3 | Deployed on GIWA Testnet |
| 4-5 | React frontend built (Tailwind + viem) |
| 6-7 | Dashboard + Airdrop + P2P + Voting pages |
| 8 | GitHub pushed + Vercel deployed |
| 9 | Pitch deck ready |
| 10 | GASOK Application submitted |

---

## Slide 10: Why Us?
- **Execution Speed**: Full working MVP in 10 days
- **GIWA-native**: Built specifically for Dojang/OnchainVerifiable
- **Korean Market Focus**: Understands compliance needs
- **Scalable Architecture**: Modular contracts for future expansion

---

## Slide 11: Links
- **GitHub**: github.com/0xNexCT/giwaverify
- **Live dApp**: frontend-hazel-one-95.vercel.app
- **GIWA Explorer**: sepolia-explorer.giwa.io

---

## Slide 12: Thank You
**GiwaVerify** — Building trust on GIWA, one block at a time.

*Apply now at: ds.fdback.me/r/bLHPv694o6Au3*
