"use client";

import { useEffect, useState } from "react";
import { Crown, Flame, RefreshCw, Send, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { personalities } from "@/config/personalities";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/wallet";
import { useMemeRoastStore, type LeaderboardItem } from "@/store/memeroast-store";

type MarketMood =
  | "airdrop"
  | "auto"
  | "bear"
  | "bull"
  | "degen"
  | "gas"
  | "leverage"
  | "nft"
  | "rug";

type TrendTag = Exclude<MarketMood, "auto">;

type MemeTrend = {
  id: string;
  caption: string;
  tag: TrendTag;
};

type TrendLeaderboardItem = LeaderboardItem & {
  tag: TrendTag;
};

const memeTrends: MemeTrend[] = [
  {
    id: "bull-1",
    caption:
      "Portfolio turned green once and immediately started shopping for a yacht.",
    tag: "bull",
  },
  {
    id: "bull-2",
    caption:
      "Two green candles showed up and this wallet began speaking fluent Lamborghini.",
    tag: "bull",
  },
  {
    id: "bull-3",
    caption:
      "Bought the pump, posted the screenshot, and called it generational wealth.",
    tag: "bull",
  },
  {
    id: "bull-4",
    caption:
      "The market sneezed upward and every bagholder became a macro analyst.",
    tag: "bull",
  },
  {
    id: "bull-5",
    caption:
      "This wallet saw profit and started acting like it invented finance.",
    tag: "bull",
  },
  {
    id: "bear-1",
    caption:
      "The dip kept dipping until the portfolio needed emotional subtitles.",
    tag: "bear",
  },
  {
    id: "bear-2",
    caption:
      "Woke up, checked the chart, and chose financial pain before breakfast.",
    tag: "bear",
  },
  {
    id: "bear-3",
    caption:
      "This bag is not underwater, it is applying for deep-sea citizenship.",
    tag: "bear",
  },
  {
    id: "bear-4",
    caption:
      "Bear market so cold even the hardware wallet asked for a hoodie.",
    tag: "bear",
  },
  {
    id: "bear-5",
    caption:
      "The portfolio tracker opened, saw the damage, and requested PTO.",
    tag: "bear",
  },
  {
    id: "leverage-1",
    caption:
      "Leverage so high the chart needed oxygen and a responsible adult.",
    tag: "leverage",
  },
  {
    id: "leverage-2",
    caption:
      "100x on a memecoin because apparently sleep and risk management are optional.",
    tag: "leverage",
  },
  {
    id: "leverage-3",
    caption:
      "The stop loss saw this position and resigned on the spot.",
    tag: "leverage",
  },
  {
    id: "leverage-4",
    caption:
      "This trade had more margin calls than a toxic group chat.",
    tag: "leverage",
  },
  {
    id: "leverage-5",
    caption:
      "Entered with confidence, exited as a liquidation notification.",
    tag: "leverage",
  },
  {
    id: "degen-1",
    caption:
      "Gas fees cost more than the thesis and somehow made more sense.",
    tag: "degen",
  },
  {
    id: "degen-2",
    caption:
      "Certified dip buyer, professional bag holder, amateur risk manager.",
    tag: "degen",
  },
  {
    id: "degen-3",
    caption:
      "Mainlining hopium straight into the portfolio tracker like it is cardio.",
    tag: "degen",
  },
  {
    id: "degen-4",
    caption:
      "FUD hit the timeline and this wallet folded like cheap origami.",
    tag: "degen",
  },
  {
    id: "degen-5",
    caption:
      "Bought a JPEG, called it culture, and watched liquidity leave the room.",
    tag: "degen",
  },
  {
    id: "degen-6",
    caption:
      "This wallet has more failed mints than successful life choices.",
    tag: "degen",
  },
  {
    id: "bear-6",
    caption:
      "Gently holding losses so heavy the balance sheet started doing squats.",
    tag: "bear",
  },
  {
    id: "bull-6",
    caption:
      "The candle went green and the timeline started measuring mansions.",
    tag: "bull",
  },
  {
    id: "leverage-6",
    caption:
      "Opened a position so risky even the exchange blinked twice.",
    tag: "leverage",
  },
  {
    id: "degen-7",
    caption:
      "This degen has not touched grass since the last unlock schedule.",
    tag: "degen",
  },
  {
    id: "bull-7",
    caption:
      "One green candle appeared and this wallet started pricing rooftop parties.",
    tag: "bull",
  },
  {
    id: "bull-8",
    caption:
      "Up 3% and already calling the family office to discuss legacy planning.",
    tag: "bull",
  },
  {
    id: "bear-7",
    caption:
      "The chart dumped so hard the portfolio app switched to dark comedy mode.",
    tag: "bear",
  },
  {
    id: "bear-8",
    caption:
      "This bag is not bleeding, it is auditioning for a horror franchise.",
    tag: "bear",
  },
  {
    id: "leverage-7",
    caption:
      "The liquidation price was so close it could hear the trader breathing.",
    tag: "leverage",
  },
  {
    id: "leverage-8",
    caption:
      "Cross margin turned one bad idea into a full-wallet group project.",
    tag: "leverage",
  },
  {
    id: "degen-8",
    caption:
      "Bought the rumor, sold the apology thread, held the emotional damage.",
    tag: "degen",
  },
  {
    id: "degen-9",
    caption:
      "The roadmap said community-owned and the liquidity said goodbye.",
    tag: "degen",
  },
  {
    id: "bear-9",
    caption:
      "Support broke faster than a founder promise during vesting week.",
    tag: "bear",
  },
  {
    id: "bull-9",
    caption:
      "The pump was tiny, but the ego candle closed at all-time high.",
    tag: "bull",
  },
  {
    id: "gas-1",
    caption:
      "Gas did the only profitable trade here and still left the wallet on read.",
    tag: "gas",
  },
  {
    id: "gas-2",
    caption:
      "The fee ate first, the swap got crumbs, and the portfolio called it strategy.",
    tag: "gas",
  },
  {
    id: "gas-3",
    caption:
      "Paid premium gas to execute a discount mistake with institutional confidence.",
    tag: "gas",
  },
  {
    id: "gas-4",
    caption:
      "This transaction was 90% network fee, 10% emotional support animal.",
    tag: "gas",
  },
  {
    id: "gas-5",
    caption:
      "The validator sent a thank-you note while the PnL filed a complaint.",
    tag: "gas",
  },
  {
    id: "nft-1",
    caption:
      "The floor price went underground and started charging rent to the holders.",
    tag: "nft",
  },
  {
    id: "nft-2",
    caption:
      "This JPEG has diamond hands because the bid wall left the chat.",
    tag: "nft",
  },
  {
    id: "nft-3",
    caption:
      "The collection said culture, the chart said abandoned group project.",
    tag: "nft",
  },
  {
    id: "nft-4",
    caption:
      "Rarity score doing overtime while liquidity clocks out permanently.",
    tag: "nft",
  },
  {
    id: "nft-5",
    caption:
      "Your PFP has more lore than bids, which is impressive and tragic.",
    tag: "nft",
  },
  {
    id: "airdrop-1",
    caption:
      "Farmed like a whale, got rewarded like plankton with a wallet address.",
    tag: "airdrop",
  },
  {
    id: "airdrop-2",
    caption:
      "The eligibility checker saw your grind and chose financial comedy.",
    tag: "airdrop",
  },
  {
    id: "airdrop-3",
    caption:
      "Bridged, minted, swapped, begged, and still got a microscopic thank-you.",
    tag: "airdrop",
  },
  {
    id: "airdrop-4",
    caption:
      "Your sybil score did cardio while the allocation arrived wearing a microscope.",
    tag: "airdrop",
  },
  {
    id: "airdrop-5",
    caption:
      "The farm produced vibes, dust, and tax complexity. Truly decentralized pain.",
    tag: "airdrop",
  },
  {
    id: "rug-1",
    caption:
      "Liquidity left faster than alpha in a public Discord announcement.",
    tag: "rug",
  },
  {
    id: "rug-2",
    caption:
      "The roadmap had three phases: hype, unlock, disappearance.",
    tag: "rug",
  },
  {
    id: "rug-3",
    caption:
      "Founder wallet moved once and the chart discovered terminal velocity.",
    tag: "rug",
  },
  {
    id: "rug-4",
    caption:
      "The audit was vibes, the exploit was punctual, the holders were decorative.",
    tag: "rug",
  },
  {
    id: "rug-5",
    caption:
      "This token did not dump, it deleted the group chat with candles.",
    tag: "rug",
  },
];

const personalityIds = personalities.map((personality) => personality.id);

const moodOptions: Array<{ id: MarketMood; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "bull", label: "Bull" },
  { id: "bear", label: "Bear" },
  { id: "leverage", label: "Leverage" },
  { id: "degen", label: "Degen" },
  { id: "gas", label: "Gas" },
  { id: "nft", label: "NFT" },
  { id: "airdrop", label: "Airdrop" },
  { id: "rug", label: "Rug" },
];

export function LeaderboardSection() {
  const showToast = useMemeRoastStore((state) => state.showToast);
  const [marketMood, setMarketMood] = useState<MarketMood>("auto");
  const [trendyData, setTrendyData] = useState<TrendLeaderboardItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());

  useEffect(() => {
    setTrendyData(generateTrendyData(marketMood));
    setLastUpdated(Date.now());

    const interval = window.setInterval(() => {
      setTrendyData(generateTrendyData(marketMood));
      setLastUpdated(Date.now());
    }, 45_000);

    return () => window.clearInterval(interval);
  }, [marketMood]);

  function refreshTrend() {
    setTrendyData(generateTrendyData(marketMood));
    setLastUpdated(Date.now());
    showToast({
      message: "New wallets, personalities, and captions rolled into the board.",
      title: "Trend refreshed",
      tone: "success",
    });
  }

  function shareOnX(item: LeaderboardItem) {
    const text = encodeURIComponent(item.caption);

    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <section className="px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-sm font-bold text-lime-100">
              <Trophy className="size-4" />
              Leaderboard
            </div>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              Top memes currently terrorizing the timeline.
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Random wallets, personalities, and 4-5 fresh trends refresh every
              45 seconds. Last refresh {relativeTime(lastUpdated)}.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {moodOptions.map((option) => (
                <button
                  className={cn(
                    "h-10 rounded-md border border-white/10 bg-white/7 px-3 text-xs font-black text-zinc-400 transition hover:border-lime-300/30 hover:text-white",
                    marketMood === option.id &&
                      "border-lime-300/40 bg-lime-300/14 text-lime-100 shadow-[0_0_18px_rgba(190,242,100,0.14)]",
                  )}
                  key={option.id}
                  onClick={() => setMarketMood(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button onClick={refreshTrend} type="button" variant="secondary">
              <RefreshCw className="size-4" />
              Refresh Trend
            </Button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-white/10 bg-white/7">
          <div className="hidden grid-cols-[76px_150px_160px_1fr_120px_120px_120px] border-b border-white/10 px-4 py-3 text-xs font-black uppercase text-zinc-500 lg:grid">
            <span>Rank</span>
            <span>Wallet</span>
            <span>Personality</span>
            <span>Meme Caption</span>
            <span>Likes</span>
            <span>Time</span>
            <span>Share</span>
          </div>

          <div className="divide-y divide-white/10">
            {trendyData.map((item, index) => {
              const personality =
                personalities.find((entry) => entry.id === item.personalityId)
                  ?.name ?? "Roast Master";
              const topThree = item.rank <= 3;
              const rankStyle = getRankStyle(index);

              return (
                <div
                  className={cn(
                    "grid gap-3 px-4 py-4 transition hover:scale-[1.004] hover:bg-white/8 lg:grid-cols-[76px_150px_160px_1fr_120px_120px_120px] lg:items-center",
                    rankStyle.row,
                  )}
                  key={item.id}
                >
                  <div className="flex items-center gap-2">
                    {topThree && (
                      <Crown className={cn("size-4 animate-pulse", rankStyle.icon)} />
                    )}
                    <span className={cn("text-lg font-black", rankStyle.rank)}>
                      #{item.rank}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-zinc-200">
                    {shortAddress(item.walletAddress)}
                  </div>
                  <div>
                    <span className="rounded-md border border-white/10 bg-zinc-950/70 px-2 py-1 text-xs font-bold text-zinc-300">
                      {personality}
                    </span>
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {topThree && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide",
                            rankStyle.badge,
                          )}
                        >
                          <Flame className="size-3" />
                          Trending
                        </span>
                      )}
                      <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] font-black uppercase text-zinc-400">
                        {item.tag} trend
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-6 text-white">
                      {item.caption}
                    </p>
                  </div>
                  <div className="text-sm font-black text-lime-200">
                    {item.likes.toLocaleString()}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {relativeTime(item.createdAt)}
                  </div>
                  <div>
                    <Button
                      className="w-full lg:w-auto"
                      onClick={() => shareOnX(item)}
                      type="button"
                      variant="secondary"
                    >
                      <Send className="size-4" />
                      Share
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function generateTrendyData(marketMood: MarketMood): TrendLeaderboardItem[] {
  const pool = getCaptionPool(marketMood);
  const count = 4 + Math.floor(Math.random() * 2);
  const pickedTrends = shuffle(pool).slice(0, count);

  return pickedTrends.map((trend, index) => {
    return {
      id: `${trend.id}-${Date.now()}-${index}`,
      caption: trend.caption,
      createdAt: Date.now() - Math.floor(20_000 + Math.random() * 9_000_000),
      likes: Math.floor(420 + Math.random() * 8_800),
      memeDescription:
        "A clean neon crypto meme visual with charts, wallet UI, and cartoon trader chaos.",
      personalityId: pickRandom(personalityIds),
      rank: index + 1,
      tag: trend.tag,
      walletAddress: createRandomWalletAddress(),
    };
  });
}

function getCaptionPool(marketMood: MarketMood) {
  if (marketMood !== "auto") {
    return memeTrends.filter((trend) => trend.tag === marketMood);
  }

  return memeTrends;
}

function createRandomWalletAddress() {
  const bytes = new Uint8Array(20);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}` as `0x${string}`;
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRankStyle(index: number) {
  if (index === 0) {
    return {
      badge: "bg-lime-300 text-zinc-950 shadow-[0_0_18px_rgba(190,242,100,0.30)]",
      icon: "text-lime-200",
      rank: "text-lime-200",
      row: "bg-lime-300/8 border-lime-300/10",
    };
  }

  if (index === 1) {
    return {
      badge: "bg-cyan-300 text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,0.24)]",
      icon: "text-cyan-200",
      rank: "text-cyan-200",
      row: "bg-cyan-300/7 border-cyan-300/10",
    };
  }

  if (index === 2) {
    return {
      badge: "bg-pink-300 text-zinc-950 shadow-[0_0_18px_rgba(244,114,182,0.24)]",
      icon: "text-pink-200",
      rank: "text-pink-200",
      row: "bg-pink-300/7 border-pink-300/10",
    };
  }

  return {
    badge: "bg-white/10 text-zinc-300",
    icon: "text-zinc-400",
    rank: "text-white",
    row: "",
  };
}

function relativeTime(timestamp: number) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  return `${Math.round(minutes / 60)}h ago`;
}

