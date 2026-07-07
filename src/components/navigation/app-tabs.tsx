"use client";

import Link from "next/link";
import {
  Droplets,
  ExternalLink,
  FileText,
  Flame,
  History,
  Home,
  Sparkles,
  Trophy,
} from "lucide-react";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { appLinks } from "@/config/links";
import { cn } from "@/lib/utils";
import { useMemeRoastStore, type AppTab } from "@/store/memeroast-store";

const tabs: Array<{ id: AppTab; label: string; icon: typeof Home }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "history", label: "My History", icon: History },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

export function AppTabs() {
  const activeTab = useMemeRoastStore((state) => state.activeTab);
  const setActiveTab = useMemeRoastStore((state) => state.setActiveTab);

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/78 px-5 py-3 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <span className="grid size-8 place-items-center rounded-md bg-lime-300 text-zinc-950">
              <Flame className="size-4" />
            </span>
            MemeRoast Console
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <FaucetButton compact />
            <ConnectWalletButton compact />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/6 p-1 sm:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold text-zinc-400 transition",
                  "hover:bg-white/10 hover:text-white",
                  isActive &&
                    "bg-lime-300 text-zinc-950 shadow-[0_0_22px_rgba(190,242,100,0.24)] hover:bg-lime-200 hover:text-zinc-950",
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold text-zinc-400 transition hover:bg-white/10 hover:text-white"
            href="/docs"
          >
            <FileText className="size-4" />
            Docs
          </Link>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <FaucetButton />
          <ConnectWalletButton compact />
        </div>
      </div>
    </div>
  );
}

function FaucetButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-black text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/16",
        compact && "px-2",
      )}
      href={appLinks.circleFaucet}
      rel="noreferrer"
      target="_blank"
      title="Get test USDC from Circle Faucet"
    >
      <Droplets className="size-4" />
      <span className={compact ? "sr-only" : undefined}>Faucet</span>
      {!compact && <ExternalLink className="size-3" />}
    </a>
  );
}

