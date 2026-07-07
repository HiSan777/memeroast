"use client";

import { GenerationFlow } from "@/components/generation/generation-flow";
import { AppTabs } from "@/components/navigation/app-tabs";
import { HistorySection } from "@/components/sections/history-section";
import { HomeSection } from "@/components/sections/home-section";
import { LeaderboardSection } from "@/components/sections/leaderboard-section";
import { ToastViewport } from "@/components/ui/toast";
import { appLinks } from "@/config/links";
import { useMemeRoastStore } from "@/store/memeroast-store";

export function AppShell() {
  const activeTab = useMemeRoastStore((state) => state.activeTab);

  return (
    <>
      <AppTabs />
      <div className="tab-panel-enter" key={activeTab}>
        {activeTab === "home" && <HomeSection />}
        {activeTab === "generate" && <GenerationFlow />}
        {activeTab === "history" && <HistorySection />}
        {activeTab === "leaderboard" && <LeaderboardSection />}
      </div>
      <footer className="border-t border-white/10 bg-zinc-950/72 px-5 py-8 text-sm text-zinc-400 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-white">
              MemeRoast - Powered by{" "}
              <span className="text-lime-200">Arc Testnet</span> +{" "}
              <span className="text-cyan-200">Circle USDC</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Roast your wallet. Go viral. Testnet only, memes very real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="rounded-md border border-white/10 bg-white/6 px-3 py-2 font-bold text-white transition hover:border-lime-300/30 hover:text-lime-100"
              href={appLinks.x}
              rel="noreferrer"
              target="_blank"
            >
              X
            </a>
            <span className="rounded-md border border-white/10 bg-white/6 px-3 py-2 font-bold text-cyan-200">
              Discord soon
            </span>
            <span className="rounded-md border border-white/10 bg-white/6 px-3 py-2 font-bold text-lime-200">
              Telegram soon
            </span>
          </div>
        </div>
      </footer>
      <ToastViewport />
    </>
  );
}

