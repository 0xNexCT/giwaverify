import { useState } from "react"
import { useAccount } from "wagmi"
import { useReadContract } from "wagmi"
import { CONTRACTS } from "../config"
import DemoVerifierAbi from "../abis/DemoVerifier.json"
import AirdropSection from "./AirdropSection"
import P2PSection from "./P2PSection"
import VoteSection from "./VoteSection"
import WalletModal from "./WalletModal"

function HeroSection({ onConnect }) {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl" style={{ backgroundColor: "var(--bg-accent-soft)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "var(--bg-blue-soft)" }} />
      </div>

      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-8 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-accent-soft)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5" style={{ color: "var(--text-primary)" }}>
          KYC-Gated dApps on <br />
          <span style={{ color: "var(--text-accent)" }}>GIWA Chain</span>
        </h1>

        <p className="max-w-3xl mx-auto text-base leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
          GiwaVerify is a verification layer for the GIWA ecosystem.
          Every participant is a verified real person — no bots, no sybils.
          Built on Dojang attestations, it powers<strong className="font-medium" style={{ color: "var(--text-secondary)" }}> token distributions,
          peer-to-peer trading, and onchain governance</strong> with trust by default.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onConnect}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
            style={{ boxShadow: "0 0 24px -4px var(--btn-primary-bg)" }}
          >
            Connect Wallet
          </button>
          <a
            href="https://sepolia-explorer.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            View Explorer
          </a>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
          What is GiwaVerify?
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-left" style={{ color: "var(--text-muted)" }}>
          <p>
            GiwaVerify is a <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>KYC-gated dApp ecosystem</strong> built on GIWA Chain —
            a high-performance OP Stack L2 with 1-second block times and Flashblocks preconfirmation.
          </p>
          <p>
            The core idea is simple: before anyone can participate in any dApp on the platform,
            they must first pass identity verification through <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>Dojang</strong>,
            GIWA's onchain attestation system powered by Upbit KYC.
          </p>
          <p>
            This creates a <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>sybil-resistant environment</strong> where every wallet is linked to a verified real person.
            No bots, no fake accounts, no wash trading.
          </p>
          <p>
            GiwaVerify exposes three core modules once a wallet is verified:
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Connect Your Wallet",
      desc: "Link your wallet to GiwaVerify using MetaMask, OKX, or any supported wallet on GIWA Chain.",
      accent: "var(--text-accent)",
      bg: "var(--bg-accent-soft)",
    },
    {
      num: "02",
      title: "Verify Identity",
      desc: "The contract checks if your wallet has a valid Dojang attestation from the GIWA ecosystem.",
      accent: "var(--text-blue)",
      bg: "var(--bg-blue-soft)",
    },
    {
      num: "03",
      title: "Access dApps",
      desc: "Once verified, you can claim airdrops, trade P2P, and vote on governance proposals.",
      accent: "var(--text-purple)",
      bg: "var(--bg-purple-soft)",
    },
  ]

  return (
    <section className="py-16 md:py-20">
      <h2 className="text-2xl font-bold text-center mb-12" style={{ color: "var(--text-primary)" }}>
        How It Works
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-xl p-6 flex items-start gap-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: step.bg, color: step.accent }}
            >
              {step.num}
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: "Airdrop",
      desc: "Distribute tokens only to verified wallets. No sybil claims, no bot farming — every recipient is a real person.",
      accent: "var(--text-accent)",
      bg: "var(--bg-accent-soft)",
      icon: (
        <path d="M21 12a9 9 0 1 1-9-9"/>
      ),
      icon2: (
        <path d="M21 3v6h-6"/>
      ),
      icon3: (
        <path d="M12 7v5l3 3"/>
      ),
    },
    {
      title: "P2P Trading",
      desc: "Trade assets directly between verified peers. Listings are only visible and tradeable by verified wallets.",
      accent: "var(--text-blue)",
      bg: "var(--bg-blue-soft)",
      icon: (
        <path d="M7 17l9.2-9.2M17 17V7H7"/>
      ),
    },
    {
      title: "Governance",
      desc: "Create and vote on ecosystem proposals. One person, one vote — verified identity prevents vote manipulation.",
      accent: "var(--text-purple)",
      bg: "var(--bg-purple-soft)",
      icon: (
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      ),
    },
  ]

  return (
    <section className="py-16 md:py-20">
      <h2 className="text-2xl font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
        Core Modules
      </h2>
      <p className="text-sm text-center max-w-md mx-auto mb-10" style={{ color: "var(--text-muted)" }}>
        Three powerful dApps that unlock when your wallet is verified
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl p-7"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: f.bg }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={f.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
                {f.icon2}
                {f.icon3}
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function BenefitsSection() {
  const items = [
    {
      title: "Sybil Resistance",
      desc: "Every wallet is backed by real-world identity verification via Dojang attestations.",
      icon: "🛡️",
    },
    {
      title: "GIWA Chain Speed",
      desc: "1-second block times with 200ms Flashblocks preconfirmation for near-instant transactions.",
      icon: "⚡",
    },
    {
      title: "Composable dApps",
      desc: "Airdrop, P2P, and Governance all use the same verification contract — consistent access control.",
      icon: "🔗",
    },
    {
      title: "Transparent Onchain",
      desc: "All verification status is stored onchain and publicly verifiable via the GIWA explorer.",
      icon: "✅",
    },
  ]

  return (
    <section className="py-16 md:py-20">
      <h2 className="text-2xl font-bold text-center mb-12" style={{ color: "var(--text-primary)" }}>
        Why GiwaVerify?
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl p-6 flex items-start gap-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaSection({ onConnect }) {
  return (
    <section className="py-16 md:py-20 text-center">
      <div className="max-w-xl mx-auto rounded-2xl py-12 px-8" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}>
        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "var(--bg-accent-soft)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Ready to get started?
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Connect your wallet to verify your identity and unlock the GiwaVerify ecosystem.
        </p>
        <button
          onClick={onConnect}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
          style={{ boxShadow: "0 0 24px -4px var(--btn-primary-bg)" }}
        >
          Connect Wallet
        </button>
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="py-8 text-center border-t" style={{ borderColor: "var(--border-header)" }}>
      <p className="text-xs" style={{ color: "var(--text-dim)" }}>
        Built on <a href="https://giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">GIWA Chain</a>
        &nbsp;·&nbsp;
        <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">Explorer</a>
        &nbsp;·&nbsp;
        <a href="https://docs.giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">Docs</a>
      </p>
    </footer>
  )
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const [showModal, setShowModal] = useState(false)

  const { data: isVerified } = useReadContract({
    address: CONTRACTS.demoVerifier,
    abi: DemoVerifierAbi,
    functionName: "verified",
    args: [address],
    query: { enabled: isConnected },
  })

  if (!isConnected) {
    return (
      <div>
        <HeroSection onConnect={() => setShowModal(true)} />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BenefitsSection />
        <CtaSection onConnect={() => setShowModal(true)} />
        <FooterSection />
        {showModal && <WalletModal onClose={() => setShowModal(false)} />}
      </div>
    )
  }

  if (isConnected && isVerified === false) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "var(--bg-amber-soft)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="text-base font-medium mb-1" style={{ color: "var(--text-amber)" }}>Unverified Wallet</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>This wallet is not on the verified list.</p>
        <div className="inline-block px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}>
          Contact the contract owner for access
        </div>
      </div>
    )
  }

  if (isConnected && isVerified) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        <AirdropSection />
        <P2PSection />
        <VoteSection />
      </div>
    )
  }

  return null
}
