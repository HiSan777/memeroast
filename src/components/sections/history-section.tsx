"use client";

import Image from "next/image";
import {
  Copy,
  Download,
  ExternalLink,
  History,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { Button } from "@/components/ui/button";
import { arcTestnet } from "@/config/arc";
import {
  MEMEROAST_HISTORY_CONTRACT,
  MEMEROAST_HISTORY_START_BLOCK,
} from "@/config/historyContract";
import { personalities } from "@/config/personalities";
import {
  copyImageToClipboard,
  copyText,
  downloadImageAsPng,
  prepareXShare,
} from "@/lib/share";
import { shortAddress } from "@/lib/wallet";
import { useMemeRoastStore } from "@/store/memeroast-store";

type OnChainRoastRecord = {
  blockNumber: bigint;
  caption?: string;
  createdAt?: number;
  imageUrl?: string;
  metadataUri: string;
  personalityId?: string;
  prompt?: string;
  transactionHash: `0x${string}`;
};

const roastRecordedEvent = parseAbiItem(
  "event RoastRecorded(address indexed user, string metadataUri)",
);

export function HistorySection() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const [onChainRecords, setOnChainRecords] = useState<OnChainRoastRecord[]>(
    [],
  );
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(false);
  const [onChainError, setOnChainError] = useState<string>();
  const history = useMemeRoastStore((state) => state.history);
  const shareMessage = useMemeRoastStore((state) => state.shareMessage);
  const showToast = useMemeRoastStore((state) => state.showToast);
  const userHistory = address
    ? history.filter(
        (item) => item.walletAddress.toLowerCase() === address.toLowerCase(),
      )
    : [];

  useEffect(() => {
    setOnChainRecords([]);
    setOnChainError(undefined);
  }, [address]);

  async function loadOnChainHistory() {
    if (!address) {
      showToast({
        message: "Connect wallet before reading Arc Testnet history.",
        title: "Wallet missing",
        tone: "error",
      });
      return;
    }

    if (!MEMEROAST_HISTORY_CONTRACT || !publicClient) {
      setOnChainError("History contract is not configured.");
      return;
    }

    try {
      setIsLoadingOnChain(true);
      setOnChainError(undefined);

      const logs = await publicClient.getLogs({
        address: MEMEROAST_HISTORY_CONTRACT,
        args: {
          user: address,
        },
        event: roastRecordedEvent,
        fromBlock: MEMEROAST_HISTORY_START_BLOCK,
        toBlock: "latest",
      });
      const records = await Promise.all(
        [...logs].reverse().map(async (log) => {
          const metadataUri = log.args.metadataUri ?? "";
          const metadata = await fetchRoastMetadata(metadataUri);

          return {
            blockNumber: log.blockNumber,
            caption: metadata?.caption,
            createdAt: metadata?.createdAt,
            imageUrl: metadata?.image?.url,
            metadataUri,
            personalityId: metadata?.personalityId,
            prompt: metadata?.prompt,
            transactionHash: log.transactionHash,
          } satisfies OnChainRoastRecord;
        }),
      );

      setOnChainRecords(records);
      showToast({
        message:
          records.length > 0
            ? `${records.length} on-chain roast record${records.length === 1 ? "" : "s"} loaded from Arc.`
            : "No on-chain roast records found for this wallet yet.",
        title: "Arc history synced",
        tone: "success",
      });
    } catch {
      setOnChainError(
        "Could not read Arc history logs. Try again after switching to Arc Testnet.",
      );
    } finally {
      setIsLoadingOnChain(false);
    }
  }

  async function shareOnX(item: (typeof history)[number]) {
    const result = await prepareXShare({
      caption: item.caption,
      fileName: item.id,
      imageUrl: item.generatedImage?.dataUrl,
    });

    showToast({
      message: result.copiedImage
        ? "X opened with the caption. Meme PNG copied, paste it into the post composer."
        : "X opened with the caption. Browser blocked image copy, so the PNG was downloaded.",
      title: "X content ready",
      tone: "success",
    });
  }

  function downloadImage(item: (typeof history)[number]) {
    if (!item.generatedImage) {
      return;
    }

    downloadImageAsPng(item.generatedImage.dataUrl, item.id);
  }

  async function copyCaption(item: (typeof history)[number]) {
    await copyText(item.caption);
    showToast({
      message: "Caption copied without app footer or tracking text.",
      title: "Caption copied",
      tone: "success",
    });
  }

  async function copyImage(item: (typeof history)[number]) {
    if (!item.generatedImage) {
      return;
    }

    try {
      await copyImageToClipboard(item.generatedImage.dataUrl);
      showToast({
        message: "Meme PNG copied. Paste it into X or any social app.",
        title: "Image copied",
        tone: "success",
      });
    } catch {
      await downloadImageAsPng(item.generatedImage.dataUrl, item.id);
      showToast({
        message: "Browser blocked image clipboard access, so the PNG was downloaded.",
        title: "Image downloaded",
        tone: "info",
      });
    }
  }

  return (
    <section className="px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
              <History className="size-4" />
              My Roasts
            </div>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              Your roast archive.
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {address
                ? `Saved memes for ${shortAddress(address)}. Ready to copy, download, or post.`
                : "Connect wallet to unlock your personal meme vault."}
            </p>
          </div>
          {shareMessage && (
            <p className="rounded-md border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-sm text-lime-100">
              {shareMessage}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-md border border-lime-300/20 bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.12),transparent_20rem),rgba(255,255,255,0.06)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-lime-100">
                Arc on-chain history
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Read `RoastRecorded` events from MemeRoastHistory for the
                connected wallet.
              </p>
            </div>
            <Button
              disabled={!address || isLoadingOnChain}
              onClick={loadOnChainHistory}
              type="button"
              variant="secondary"
            >
              {isLoadingOnChain ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {isLoadingOnChain ? "Syncing..." : "Sync Arc History"}
            </Button>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
            <p>
              Contract:{" "}
              <span className="break-all font-bold text-zinc-200">
                {MEMEROAST_HISTORY_CONTRACT ?? "Not configured"}
              </span>
            </p>
            <p>
              Start block:{" "}
              <span className="font-bold text-zinc-200">
                {MEMEROAST_HISTORY_START_BLOCK.toString()}
              </span>
            </p>
          </div>

          {onChainError && (
            <p className="mt-3 rounded-md border border-pink-300/20 bg-pink-300/10 p-3 text-sm text-pink-100">
              {onChainError}
            </p>
          )}

          {onChainRecords.length > 0 && (
            <div className="mt-4 grid gap-3">
              {onChainRecords.map((record) => (
                <article
                  className="rounded-md border border-white/10 bg-zinc-950/70 p-3"
                  key={`${record.transactionHash}-${record.blockNumber.toString()}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase">
                        <span className="rounded-md bg-lime-300/12 px-2 py-1 text-lime-100">
                          On-chain
                        </span>
                        <span className="rounded-md bg-white/8 px-2 py-1 text-zinc-300">
                          Block {record.blockNumber.toString()}
                        </span>
                        {record.personalityId && (
                          <span className="rounded-md bg-cyan-300/12 px-2 py-1 text-cyan-100">
                            {formatTemplate(record.personalityId)}
                          </span>
                        )}
                      </div>
                      {record.caption && (
                        <p className="mt-3 text-sm font-bold leading-6 text-white">
                          {record.caption}
                        </p>
                      )}
                      {record.prompt && (
                        <p className="mt-2 text-xs text-zinc-400">
                          Prompt:{" "}
                          <span className="font-bold text-zinc-300">
                            {record.prompt}
                          </span>
                        </p>
                      )}
                      <p className="mt-2 break-all text-xs text-zinc-500">
                        Metadata:{" "}
                        <span className="font-bold text-zinc-300">
                          {record.metadataUri}
                        </span>
                      </p>
                    </div>
                    <a
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-black text-lime-100 transition hover:border-lime-300/40"
                      href={getArcScanTxUrl(record.transactionHash)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="size-3" />
                      ArcScan
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {userHistory.length === 0 ? (
          <div className="mt-8 rounded-md border border-dashed border-white/15 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.14),transparent_22rem),rgba(255,255,255,0.06)] p-8 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-md border border-pink-300/20 bg-pink-300/10">
              <Sparkles className="size-7 text-pink-200" />
            </div>
            <p className="text-xl font-black text-white">
              No roasts yet. Your meme vault is tragically unemployed.
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Generate a preview, sign the final run, and your clean meme image
              will land here.
            </p>
            <p className="mt-4 text-xs font-bold uppercase text-lime-200">
              Your future viral archive is waiting.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {userHistory.map((item) => {
              const personality =
                personalities.find((entry) => entry.id === item.personalityId)
                  ?.name ?? "Roast Master";

              return (
                <article
                  className="group rounded-md border border-white/10 bg-white/7 p-4 transition duration-300 hover:-translate-y-1 hover:border-lime-300/30 hover:bg-white/9 hover:shadow-[0_0_34px_rgba(190,242,100,0.12)]"
                  key={item.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="grid aspect-square w-full shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-zinc-950/70 sm:w-52">
                      {item.generatedImage ? (
                        <Image
                          alt="Generated MemeRoast meme"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          height={360}
                          src={item.generatedImage.dataUrl}
                          width={360}
                        />
                      ) : item.image ? (
                        <Image
                          alt="Generated roast source"
                          className="h-full w-full object-cover"
                          height={220}
                          src={item.image.dataUrl}
                          width={360}
                        />
                      ) : (
                        <ImageIcon className="size-8 text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase">
                        <span className="rounded-md bg-lime-300/12 px-2 py-1 text-lime-100">
                          {personality}
                        </span>
                        <span className="rounded-md bg-white/8 px-2 py-1 text-zinc-300">
                          {formatTime(item.createdAt)}
                        </span>
                        {item.generatedImage?.template && (
                          <span className="rounded-md bg-cyan-300/12 px-2 py-1 text-cyan-100">
                            {formatTemplate(item.generatedImage.template)}
                          </span>
                        )}
                        {item.generatedImage?.seed && (
                          <span className="rounded-md bg-pink-300/12 px-2 py-1 text-pink-100">
                            seed {item.generatedImage.seed}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-xs font-bold uppercase text-zinc-500">
                        Prompt
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {item.prompt}
                      </p>
                      <p className="mt-3 text-base font-bold leading-6 text-white">
                        {item.caption}
                      </p>
                      {getItemTxHash(item) && (
                        <a
                          className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-zinc-950/60 px-2 py-1 text-xs font-bold text-zinc-400 transition hover:border-cyan-300/30 hover:text-cyan-100"
                          href={
                            item.transactionHash
                              ? getArcScanTxUrl(item.transactionHash)
                              : undefined
                          }
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="size-3" />
                          {item.transactionHash ? "Tx" : "Sim tx"}{" "}
                          {shortHash(getItemTxHash(item)!)}
                        </a>
                      )}
                      {(item.metadataUrl ||
                        item.metadataIpfsCid ||
                        item.metadataHash) && (
                        <p className="mt-3 break-all text-xs text-zinc-500">
                          Metadata:{" "}
                          <span className="font-bold text-zinc-300">
                            {item.metadataUrl ??
                              (item.metadataIpfsCid
                                ? `ipfs://${item.metadataIpfsCid}`
                                : item.metadataHash)}
                          </span>
                        </p>
                      )}
                      {item.onChainHistoryTxHash ? (
                        <a
                          className="mt-2 inline-flex items-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-xs font-bold text-lime-100 transition hover:border-lime-300/40"
                          href={getArcScanTxUrl(item.onChainHistoryTxHash)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="size-3" />
                          History tx {shortHash(item.onChainHistoryTxHash)}
                        </a>
                      ) : item.onChainHistoryStatus ? (
                        <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                          On-chain history: {item.onChainHistoryStatus}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-400">
                      {item.likes.toLocaleString()} roasts
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      <Button
                        aria-label="Copy caption"
                        className="min-w-0 px-3"
                        onClick={() => copyCaption(item)}
                        title="Copy caption"
                        type="button"
                        variant="secondary"
                      >
                        <Copy className="size-4" />
                        Caption
                      </Button>
                      {item.generatedImage && (
                        <Button
                          aria-label="Copy meme image"
                          className="min-w-0 px-3"
                          onClick={() => copyImage(item)}
                          title="Copy meme image"
                          type="button"
                          variant="secondary"
                        >
                          <Copy className="size-4" />
                          Image
                        </Button>
                      )}
                      {item.generatedImage && (
                        <Button
                          aria-label="Download meme image"
                          className="min-w-0 px-3"
                          onClick={() => downloadImage(item)}
                          title="Download meme image"
                          type="button"
                          variant="secondary"
                        >
                          <Download className="size-4" />
                          Save
                        </Button>
                      )}
                      <Button
                        aria-label="Share on X"
                        className="min-w-0 px-3"
                        onClick={() => shareOnX(item)}
                        title="Share on X"
                        type="button"
                      >
                        <Send className="size-4" />
                        X
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function formatTemplate(template: string) {
  return template.replace(/-/g, " ");
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function getItemTxHash(item: {
  simulatedTxHash?: `0x${string}`;
  transactionHash?: `0x${string}`;
}) {
  return item.transactionHash ?? item.simulatedTxHash;
}

function getArcScanTxUrl(hash: `0x${string}`) {
  return `${arcTestnet.blockExplorers.default.url}/tx/${hash}`;
}

type RoastMetadata = {
  caption?: string;
  createdAt?: number;
  image?: {
    url?: string;
  };
  personalityId?: string;
  prompt?: string;
};

async function fetchRoastMetadata(metadataUri: string) {
  const url = resolveMetadataUrl(metadataUri);

  if (!url) {
    return undefined;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return undefined;
    }

    return (await response.json()) as RoastMetadata;
  } catch {
    return undefined;
  }
}

function resolveMetadataUrl(metadataUri: string) {
  if (metadataUri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${metadataUri.replace("ipfs://", "")}`;
  }

  if (metadataUri.startsWith("https://") || metadataUri.startsWith("http://")) {
    return metadataUri;
  }

  return undefined;
}


