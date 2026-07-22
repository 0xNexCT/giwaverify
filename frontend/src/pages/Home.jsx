import { NavLink } from "react-router-dom"
import { useAccount } from "wagmi"

function SiteNotice() {
  return (
    <div
      className="relative mx-auto max-w-6xl -mt-4 mb-2 rounded-xl px-6 py-4 flex items-start gap-4"
      style={{
        backgroundColor: "var(--bg-accent-soft)",
        border: "1px solid",
        borderColor: "var(--text-accent)",
      }}
    >
      <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <strong style={{ color: "var(--text-primary)" }}>Public Test Notice:</strong> This website is currently open for everyone to test. Once live, only wallets with valid Dojang attestations (KYC) will be able to use the dApps. So check it out while you can!
      </div>
    </div>
  )
}

function HeroSection({ onConnect, isConnected }) {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: "var(--text-primary)" }} />
        <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl" style={{ backgroundColor: "var(--text-primary)" }} />
      </div>

      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-8 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-accent-soft)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none mb-6" style={{ color: "var(--text-primary)" }}>
          KYC-Gated dApps
          <br />
          <span style={{ color: "var(--text-accent)" }}>on GIWA Chain</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
          GiwaVerify is a verification layer for the GIWA ecosystem.
          Every wallet must be linked to a real person through Dojang attestations.
           This makes token distributions, token swaps, and onchain governance
          sybil-resistant by default.
        </p>

        <div className="flex items-center justify-center gap-4">
          {isConnected ? (
            <button disabled className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold opacity-60 cursor-default">
              Connected ✓
            </button>
          ) : (
            <button onClick={onConnect} className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold">
              Connect Wallet
            </button>
          )}
          <a
            href="https://sepolia-explorer.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-8 py-3.5 rounded-xl text-base font-medium"
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
    <section className="py-20 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="eyebrow mb-7 justify-center" style={{ display: "flex" }}>About</div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-8" style={{ color: "var(--text-primary)" }}>
          What is GiwaVerify?
        </h2>

        <div className="space-y-6 text-base leading-relaxed text-center" style={{ color: "var(--text-muted)" }}>
          <p className="text-lg">
            GiwaVerify is a <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>KYC-gated dApp ecosystem</strong> built on GIWA Chain.
            GIWA is a high-performance OP Stack L2 with 1-second block times and Flashblocks preconfirmation.
          </p>
          <p className="text-lg">
            Anyone who wants to use a dApp on this platform must first pass identity verification through <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>Dojang</strong>,
            GIWA's onchain attestation system powered by Upbit KYC.
          </p>
          <p className="text-lg">
            This creates a <strong className="font-medium" style={{ color: "var(--text-secondary)" }}>sybil-resistant environment</strong> where every wallet is linked to a verified real person.
            No bots, no fake accounts, no wash trading.
          </p>
          <p className="text-lg">
            GiwaVerify unlocks three core modules after verification:
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
    },
    {
      num: "02",
      title: "Verify Identity",
      desc: "The contract checks if your wallet has a valid Dojang attestation from the GIWA ecosystem.",
    },
    {
      num: "03",
      title: "Access dApps",
      desc: "Once verified, you can claim test tokens from the faucet, swap tokens via the AMM, and vote on governance proposals.",
    },
  ]

  return (
    <section className="py-20 md:py-24">
      <div className="eyebrow mb-7 justify-center" style={{ display: "flex" }}>Process</div>

      <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-14" style={{ color: "var(--text-primary)" }}>
        How It Works
      </h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-xl p-8 card"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <span className="numbered-step mb-4" style={{ display: "block" }}>
              <span className="num">{step.num}</span> · {step.title}
            </span>
            <p className="text-base leading-relaxed mt-3" style={{ color: "var(--text-secondary)" }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: "Faucet",
      desc: "Claim test tokens with a 24-hour cooldown per wallet per token. Sybil-resistant distribution for verified users.",
      to: "/faucet",
      accent: "var(--accent-faucet)",
      bg: "var(--accent-faucet-soft)",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      title: "Token Swap",
      desc: "Swap between verified-only test tokens using an automated market maker. Only verified wallets can trade.",
      to: "/swap",
      accent: "var(--accent-p2p)",
      bg: "var(--accent-p2p-soft)",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17l9.2-9.2M17 17V7H7"/>
        </svg>
      ),
    },
    {
      title: "Governance",
      desc: "Create and vote on ecosystem proposals. One person, one vote stops manipulation at the source.",
      to: "/governance",
      accent: "var(--accent-vote)",
      bg: "var(--accent-vote-soft)",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4"/>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 md:py-24">
      <div className="eyebrow mb-7 justify-center" style={{ display: "flex" }}>Modules</div>

      <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
        Core Modules
      </h2>
      <p className="text-sm text-center max-w-md mx-auto mb-12" style={{ color: "var(--text-muted)" }}>
        Three powerful dApps that unlock when your wallet is verified
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl p-8 card flex flex-col"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center" style={{ backgroundColor: f.bg, color: f.accent }}>
              {f.svg}
            </div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              {f.title}
            </h3>
            <p className="text-base leading-relaxed mb-6 flex-1" style={{ color: "var(--text-secondary)" }}>
              {f.desc}
            </p>
            <NavLink
              to={f.to}
              className="inline-block text-center px-5 py-2.5 rounded-lg text-base font-medium transition-all"
              style={{
                backgroundColor: f.bg,
                color: f.accent,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Go to {f.title}
            </NavLink>
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
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      title: "GIWA Chain Speed",
      desc: "1-second block times with 200ms Flashblocks preconfirmation for near-instant transactions.",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
    },
    {
      title: "Composable dApps",
      desc: "Faucet, Swap, and Governance all use the same verification contract behind the scenes.",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
    {
      title: "Transparent Onchain",
      desc: "All verification status is stored onchain and publicly verifiable via the GIWA explorer.",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 md:py-24">
      <div className="eyebrow mb-7 justify-center" style={{ display: "flex" }}>Why</div>

      <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-14" style={{ color: "var(--text-primary)" }}>
        Why GiwaVerify?
      </h2>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl p-8 card flex items-start gap-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-card)" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--bg-accent-soft)", color: "var(--text-accent)" }}
            >
              {item.svg}
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {item.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaSection({ onConnect, isConnected }) {
  return (
    <section className="py-20 md:py-24 text-center">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "var(--bg-accent-soft)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
          Ready to get started?
        </h2>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
          Connect your wallet to get verified and start using GiwaVerify.
        </p>
        {isConnected ? (
          <button disabled className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold opacity-60 cursor-default">
            Connected ✓
          </button>
        ) : (
          <button onClick={onConnect} className="btn-primary px-8 py-3.5 rounded-xl text-base font-semibold">
            Connect Wallet
          </button>
        )}
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="py-10 text-center border-t" style={{ borderColor: "var(--border-header)" }}>
      <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        Built on <a href="https://giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">GIWA Chain</a>
        &nbsp;·&nbsp;
        <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">Explorer</a>
        &nbsp;·&nbsp;
        <a href="https://docs.giwa.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }} className="hover:underline">Docs</a>
      </p>
      <p className="text-[0.65rem]" style={{ color: "var(--text-dim)" }}>
        Unofficial community project built for GASOK 2026. Not affiliated with GIWA or Upbit.
      </p>
    </footer>
  )
}

export default function Home({ onConnectRequest }) {
  const { isConnected } = useAccount()
  return (
    <div>
      <SiteNotice />
      <HeroSection onConnect={onConnectRequest} isConnected={isConnected} />
      <AboutSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <CtaSection onConnect={onConnectRequest} isConnected={isConnected} />
      <FooterSection />
    </div>
  )
}
