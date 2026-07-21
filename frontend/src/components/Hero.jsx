export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        KYC-Gated dApp Ecosystem
        <span className="block text-emerald-400 mt-2">on GIWA Chain</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
        Trusted access powered by Dojang. Only verified wallets can claim airdrops,
        trade P2P, and participate in governance.
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
        <span className="bg-gray-800 px-3 py-1 rounded-full">🔗 Dojang Verified</span>
        <span className="bg-gray-800 px-3 py-1 rounded-full">⚡ Flashblocks Ready</span>
        <span className="bg-gray-800 px-3 py-1 rounded-full">🛡️ Sybil Resistant</span>
      </div>
    </section>
  )
}
