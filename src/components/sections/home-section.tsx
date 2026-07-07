"use client";

import {
  ArrowRight,
  Bot,
  CreditCard,
  ImageIcon,
  PlugZap,
  Rocket,
  Send,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { PersonalitySelector } from "@/components/personality/personality-selector";
import { Button } from "@/components/ui/button";
import type { PersonalityId } from "@/config/personalities";
import { useMemeRoastStore } from "@/store/memeroast-store";

const previewCopyByPersonality: Record<
  PersonalityId,
  { status: string; quote: string }
> = {
  "roast-master": {
    quote: "This wallet looks like a free donation to market makers.",
    status: "Executing ultimate emotional damage...",
  },
  "meme-lord": {
    quote: "Your portfolio belongs in a museum of bad decisions.",
    status: "AI is cooking a savage meme for you...",
  },
  "crypto-degenerate": {
    quote:
      "100x leverage on a memecoin? You don't need AI, you need a doctor.",
    status: "Calculating high-leverage madness...",
  },
  chill: {
    quote:
      "It's okay, losing money is just performance art for red candles.",
    status: "Sending soft reality checks...",
  },
};

export function HomeSection() {
  const setActiveTab = useMemeRoastStore((state) => state.setActiveTab);
  const selectedPersonality = useMemeRoastStore(
    (state) => state.selectedPersonality,
  );
  const previewCopy = previewCopyByPersonality[selectedPersonality];

  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
      <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-12">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-pink-300/25 bg-pink-300/10 px-3 py-2 text-sm font-bold text-pink-100 shadow-[0_0_28px_rgba(244,114,182,0.12)]">
            <Sparkles className="size-4" />
            Savage AI roasts, viral captions, and crypto meme chaos
          </div>

          <h1 className="text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-8xl">
            <span className="block bg-[linear-gradient(90deg,#ffffff,#bef264_48%,#22d3ee)] bg-clip-text text-transparent">
              Roast your wallet.
            </span>
            <span className="block text-zinc-300">Go viral.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Connect your wallet on Arc Testnet, let our savage AI personalities
            analyze your on-chain history, and pay a tiny USDC fee to turn your
            liquidations into viral memes instantly.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="h-14 text-base shadow-[0_0_40px_rgba(190,242,100,0.34)]"
              onClick={() => setActiveTab("generate")}
              type="button"
            >
              <PlugZap className="size-5" />
              Try Now
              <ArrowRight className="size-5" />
            </Button>
          </div>

          <PersonalitySelector />
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-md bg-[linear-gradient(135deg,rgba(190,242,100,0.20),rgba(34,211,238,0.12),rgba(244,114,182,0.16))] blur-2xl" />
          <div className="relative overflow-hidden rounded-md border border-white/12 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(6,78,59,0.40),rgba(9,9,11,0.96))] p-6 shadow-2xl sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#bef264,#22d3ee,transparent)]" />
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="absolute left-8 top-10 h-48 w-28 rotate-[-12deg] rounded-md border border-pink-300/30 bg-pink-300/10 shadow-[0_0_36px_rgba(244,114,182,0.22)]" />
            <div className="absolute bottom-12 right-12 h-56 w-32 rotate-[10deg] rounded-md border border-lime-300/30 bg-lime-300/10 shadow-[0_0_40px_rgba(190,242,100,0.24)]" />

            <div className="relative mx-auto my-14 max-w-md rounded-md border-2 border-lime-300 bg-zinc-950/78 p-7 shadow-[0_0_70px_rgba(190,242,100,0.20)]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-pink-300/25 bg-pink-300/10 px-3 py-2 text-xs font-black uppercase text-pink-100">
                <Zap className="size-4" />
                Wallet roast incoming
              </div>
              <p className="text-5xl font-black leading-none text-white">
                MemeRoast
              </p>
              <p className="mt-1 text-2xl font-black leading-none text-lime-300">
                {previewCopy.status}
              </p>
              <p className="mt-3 text-sm font-bold text-zinc-300">
                USDC nano-payments on Arc Testnet
              </p>
              <div className="mt-6 rounded-md bg-black/70 px-4 py-4 font-mono text-sm font-black text-pink-300">
                &quot;{previewCopy.quote}&quot;
              </div>
              <p className="mt-6 text-base font-black text-cyan-300">
                Roast Master + Meme Lord + Crypto Degen
              </p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
              <Bot className="mb-3 size-5 text-cyan-300" />
              <p className="text-sm font-bold">Arc-ready agent flow</p>
              <p className="mt-1 text-xs text-zinc-400">
                Wallet-based sessions, signed final runs, and USDC pricing.
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
              <Trophy className="mb-3 size-5 text-lime-300" />
              <p className="text-sm font-bold">Trending meme board</p>
              <p className="mt-1 text-xs text-zinc-400">
                Fresh captions, ranked wallets, and share-ready roasts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-8">
        <div className="rounded-md border border-white/10 bg-white/7 p-5">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-sm font-black text-lime-100">
            <Rocket className="size-4" />
            How it works
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                icon: Bot,
                label: "1. Pick a personality",
                status: "Style",
                text: "Choose Roast Master, Meme Lord, Crypto Degenerate, or Chill Girl for a different social voice.",
              },
              {
                icon: ImageIcon,
                label: "2. Preview the roast",
                status: "Free",
                text: "Drop a prompt or image and get an English caption plus clean meme direction before paying.",
              },
              {
                icon: CreditCard,
                label: "3. Pay and share",
                status: "0.05 USDC",
                text: "Send a tiny Arc Testnet USDC payment, generate the meme visual, save it to history, then share it on X.",
              },
            ].map((item) => (
              <div
                className="rounded-md border border-white/10 bg-zinc-950/70 p-4"
                key={item.label}
              >
                <item.icon className="mb-3 size-5 text-cyan-300" />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <span className="rounded-md bg-lime-300/12 px-2 py-1 text-xs font-black uppercase text-lime-100">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <button
            className="mt-4 inline-flex items-center gap-2 text-sm font-black text-lime-200 transition hover:text-lime-100"
            onClick={() => setActiveTab("generate")}
            type="button"
          >
            Start generating
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

