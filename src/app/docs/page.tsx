import Link from "next/link";
import { ArrowLeft, Droplets, Sparkles } from "lucide-react";

import { appLinks } from "@/config/links";

const roadmap = [
  {
    title: "Phase 1 - Complete",
    items: [
      "MVP core features",
      "Wallet connect on Arc Testnet",
      "Free preview generation",
      "Real Arc Testnet 0.05 USDC final payment",
      "Deploy memeroast.xyz",
    ],
  },
  {
    title: "Phase 2 - Next 2-4 Weeks",
    items: [
      "Real meme image API",
      "Real Arc/Circle USDC nanopayment",
      "IPFS storage",
      "On-chain history",
      "Share on X automation",
    ],
  },
  {
    title: "Phase 3 - Later",
    items: [
      "Personality marketplace",
      "Creator reward system",
      "Token experiment if useful",
    ],
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.16),transparent_28rem),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_28rem),#09090b] px-5 py-8 text-zinc-50 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 transition hover:text-white"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>
          <a
            className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15"
            href={appLinks.circleFaucet}
            rel="noreferrer"
            target="_blank"
          >
            <Droplets className="size-4" />
            USDC Faucet
          </a>
        </div>

        <section className="mt-12">
          <div className="inline-flex items-center gap-2 rounded-md border border-pink-300/25 bg-pink-300/10 px-3 py-2 text-sm font-black text-pink-100">
            <Sparkles className="size-4" />
            MemeRoast Docs
          </div>
          <h1 className="mt-5 text-5xl font-black leading-[0.95] text-white sm:text-6xl">
            MemeRoast - Roast your wallet. Go viral.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">
            MemeRoast turns crypto wallets into viral roast content. Choose a
            personality, enter a prompt, preview the joke, then pay tiny USDC to
            generate clean meme visuals and savage captions.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/7 p-5">
            <h2 className="text-xl font-black text-white">Quick Start</h2>
            <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
              <li>1. Open memeroast.xyz.</li>
              <li>2. Connect MetaMask, Rabby, or another RainbowKit wallet.</li>
              <li>3. Switch to Arc Testnet, chain ID 5042002.</li>
              <li>4. Use the Faucet button for Circle test USDC when needed.</li>
              <li>5. Choose a personality and enter a prompt.</li>
              <li>6. Generate a free preview, then create the final meme.</li>
            </ol>
          </div>
          <div className="rounded-md border border-white/10 bg-white/7 p-5">
            <h2 className="text-xl font-black text-white">Main Features</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
              <li>Connect wallet on Arc Testnet.</li>
              <li>Roast Master, Meme Lord, Crypto Degenerate, and Chill Girl.</li>
              <li>Free preview generation.</li>
              <li>Real Arc Testnet USDC nanopayment transfer.</li>
              <li>Wallet-scoped local history and demo leaderboard.</li>
              <li>Share on X, copy captions, copy PNG images, or download memes.</li>
              <li>Circle Faucet shortcut for test USDC.</li>
            </ul>
          </div>
        </section>

        <section className="mt-10 rounded-md border border-pink-300/20 bg-pink-300/10 p-5">
          <h2 className="text-2xl font-black text-white">Image Generation</h2>
          <p className="mt-3 text-sm leading-6 text-pink-50/85">
            Current images use a mock Flux-style renderer: dark neon crypto
            meme visuals, expressive cartoon traders, wallet UI, chart chaos,
            pixel art, cyberpunk desks, rocket crashes, and glitch terminals.
            Captions stay outside the image so the meme stays clean and readable.
          </p>
        </section>

        <section className="mt-10 rounded-md border border-lime-300/20 bg-lime-300/10 p-5">
          <h2 className="text-2xl font-black text-white">Test USDC</h2>
          <p className="mt-3 text-sm leading-6 text-lime-50/85">
            Arc Testnet uses USDC as the gas token. Use the Faucet button in
            the app header to open Circle Faucet and request test USDC for demo
            activity.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black text-white">Roadmap</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {roadmap.map((phase) => (
              <article
                className="rounded-md border border-white/10 bg-zinc-950/72 p-5"
                key={phase.title}
              >
                <h3 className="font-black text-lime-100">{phase.title}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-5">
          <h2 className="text-2xl font-black text-white">Important Notes</h2>
          <p className="mt-3 text-sm leading-6 text-cyan-50/85">
            Final generation now sends a real Arc Testnet USDC transfer.
            Agent execution, image provider calls, IPFS, and on-chain history
            are planned production integration steps.
          </p>
        </section>
      </div>
    </main>
  );
}
