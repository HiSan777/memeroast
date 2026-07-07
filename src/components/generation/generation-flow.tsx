"use client";

import Image from "next/image";
import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  ImagePlus,
  LoaderCircle,
  PartyPopper,
  Repeat2,
  Send,
  Sparkles,
  WandSparkles,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Confetti from "react-confetti";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { arcTestnet } from "@/config/arc";
import {
  MEMEROAST_HISTORY_CONTRACT,
  memeRoastHistoryAbi,
} from "@/config/historyContract";
import {
  PAYMENT_AMOUNT_USDC,
  PAYMENT_RECEIVER_ADDRESS,
} from "@/config/payment";
import { personalities } from "@/config/personalities";
import {
  copyImageToClipboard,
  copyText,
  downloadImageAsPng,
  prepareXShare,
} from "@/lib/share";
import { getMetadataUri } from "@/lib/metadataStorage";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/wallet";
import { useMemeRoastStore } from "@/store/memeroast-store";

const promptExamples = [
  "Roast my wallet",
  "Turn my empty portfolio into a viral meme",
  "Make a meme about a Bitcoin crash",
  "Caption this trade screenshot like a crypto villain",
  "Make my NFT bag sound less tragic",
  "Roast my gas fees like they stole my lunch",
  "Make a liquidation meme about 100x leverage",
  "Turn my failed airdrop farm into content",
  "Make a meme about getting rugged by a founder",
  "Roast my paper hands during a bull run",
];
const loadingLines = [
  "Roasting at max leverage...",
  "Agent is lighting your wallet on fire, responsibly...",
  "Checking if the portfolio still has a pulse...",
  "Converting liquidations into social engagement...",
  "Agent is stress-testing the punchline engine...",
  "Farming meme alpha from the timeline trenches...",
  "Compressing chaos into one dangerously postable caption...",
  "Burning fake USDC in the demo furnace...",
];
const paymentLines = [
  "Broadcasting real Arc Testnet USDC payment...",
  "Waiting for ArcScan-worthy confirmation...",
  "Agent is roasting your wallet...",
  "Generating Flux-style meme image...",
  "Saving the final roast to your wallet history...",
];
const PAYMENT_AMOUNT_WEI = parseUnits(
  PAYMENT_AMOUNT_USDC,
  arcTestnet.nativeCurrency.decimals,
);

export function GenerationFlow() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirmingTx, setIsConfirmingTx] = useState(false);
  const [viewport, setViewport] = useState({ height: 0, width: 0 });
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const {
    isPending: isSendingPayment,
    sendTransactionAsync,
  } = useSendTransaction();
  const {
    isPending: isRecordingHistory,
    writeContractAsync,
  } = useWriteContract();
  const { data: usdcBalance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: {
      enabled: Boolean(address),
    },
  });
  const selectedPersonality = useMemeRoastStore(
    (state) => state.selectedPersonality,
  );
  const userPrompt = useMemeRoastStore((state) => state.userPrompt);
  const uploadedImage = useMemeRoastStore((state) => state.uploadedImage);
  const previewResult = useMemeRoastStore((state) => state.previewResult);
  const isLoading = useMemeRoastStore((state) => state.isLoading);
  const isPaying = useMemeRoastStore((state) => state.isPaying);
  const flowError = useMemeRoastStore((state) => state.flowError);
  const finalResult = useMemeRoastStore((state) => state.finalResult);
  const paymentMessage = useMemeRoastStore((state) => state.paymentMessage);
  const viralBurstKey = useMemeRoastStore((state) => state.viralBurstKey);
  const setUserPrompt = useMemeRoastStore((state) => state.setUserPrompt);
  const setUploadedImage = useMemeRoastStore((state) => state.setUploadedImage);
  const setFlowError = useMemeRoastStore((state) => state.setFlowError);
  const showToast = useMemeRoastStore((state) => state.showToast);
  const generatePreview = useMemeRoastStore((state) => state.generatePreview);
  const resetPreview = useMemeRoastStore((state) => state.resetPreview);
  const markRoastOnChain = useMemeRoastStore((state) => state.markRoastOnChain);
  const completePaidGeneration = useMemeRoastStore(
    (state) => state.completePaidGeneration,
  );
  const selectedPersonalityName =
    personalities.find((item) => item.id === selectedPersonality)?.name ??
    "Roast Master";
  const loadingLine =
    loadingLines[Math.min(loadingLines.length - 1, viralBurstKey % loadingLines.length)];
  const paymentLine =
    paymentLines[
      Math.min(paymentLines.length - 1, viralBurstKey % paymentLines.length)
    ];
  const isArcTestnet = chainId === arcTestnet.id;
  const hasInsufficientUsdc =
    Boolean(usdcBalance) && usdcBalance!.value < PAYMENT_AMOUNT_WEI;
  const canTryPayment = Boolean(previewResult);
  const isPaymentBusy =
    isSendingPayment || isConfirmingTx || isPaying || isRecordingHistory;
  const balanceLabel = usdcBalance
    ? `${Number(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(4)} ${usdcBalance.symbol}`
    : "Not loaded";

  useEffect(() => {
    function syncViewport() {
      setViewport({ height: window.innerHeight, width: window.innerWidth });
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  async function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadedImage(undefined);
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setUploadedImage({ name: file.name, dataUrl });
  }

  function openPaymentModal() {
    if (!previewResult) {
      setFlowError("Generate a preview before paying the meme toll.");
      return;
    }

    if (!isConnected) {
      setFlowError("Connect wallet first. The roast cannot bill a ghost.");
      return;
    }

    if (!isArcTestnet) {
      setFlowError("Please switch to Arc Testnet before paying 0.05 USDC.");
      return;
    }

    setFlowError(undefined);
    setIsConfirmOpen(true);
  }

  async function confirmPayment() {
    if (!address || !previewResult) {
      return;
    }

    try {
      setIsConfirmingTx(true);
      // Real Arc Testnet payment:
      // Arc uses USDC as the native gas/payment token, so this is a native
      // transfer to the MemeRoast receiver wallet. A future contract can
      // replace this call when Arc Blueprints settlement is wired in.
      const txHash = await sendTransactionAsync({
        chainId: arcTestnet.id,
        to: PAYMENT_RECEIVER_ADDRESS,
        value: PAYMENT_AMOUNT_WEI,
      });

      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      setIsConfirmingTx(false);
      const historyItem = await completePaidGeneration(address, txHash);

      if (historyItem) {
        await recordHistoryOnChain(historyItem);
      }

      setIsConfirmOpen(false);
    } catch (error) {
      setIsConfirmingTx(false);
      showToast({
        message:
          error instanceof Error && error.message
            ? error.message.slice(0, 140)
            : "Wallet rejected or the Arc Testnet transaction failed.",
        title: "Payment failed",
        tone: "error",
      });
    }
  }

  async function recordHistoryOnChain(historyItem: {
    id: string;
    metadataHash?: string;
    metadataIpfsCid?: string;
    metadataUrl?: string;
  }) {
    const metadataUri =
      getMetadataUri(historyItem) ?? historyItem.metadataHash ?? "";

    if (!MEMEROAST_HISTORY_CONTRACT || !metadataUri) {
      markRoastOnChain(historyItem.id, "skipped");
      return;
    }

    try {
      const historyTxHash = await writeContractAsync({
        abi: memeRoastHistoryAbi,
        address: MEMEROAST_HISTORY_CONTRACT,
        args: [metadataUri],
        chainId: arcTestnet.id,
        functionName: "recordRoast",
      });

      await publicClient?.waitForTransactionReceipt({ hash: historyTxHash });
      markRoastOnChain(historyItem.id, "recorded", historyTxHash);
      showToast({
        message: "Metadata URI recorded on Arc Testnet history contract.",
        title: "On-chain history saved",
        tone: "success",
      });
    } catch {
      markRoastOnChain(historyItem.id, "failed");
      showToast({
        message:
          "Final meme is saved locally, but the history contract transaction was rejected or failed.",
        title: "On-chain history skipped",
        tone: "info",
      });
    }
  }

  async function shareFinalOnX() {
    if (!finalResult) {
      return;
    }

    const result = await prepareXShare({
      caption: finalResult.caption,
      fileName: finalResult.id,
      imageUrl: finalResult.generatedImage?.dataUrl,
    });

    showToast({
      message: result.copiedImage
        ? "X opened with the caption. Meme PNG copied, paste it into the post composer."
        : "X opened with the caption. Browser blocked image copy, so the PNG was downloaded.",
      title: "X content ready",
      tone: "success",
    });
  }

  async function copyFinalCaption() {
    if (!finalResult) {
      return;
    }

    await copyText(finalResult.caption);
    showToast({
      message: "Clean caption copied. No extra MemeRoast footer added.",
      title: "Caption copied",
      tone: "success",
    });
  }

  async function copyFinalImage() {
    if (!finalResult?.generatedImage) {
      return;
    }

    try {
      await copyImageToClipboard(finalResult.generatedImage.dataUrl);
      showToast({
        message: "Meme PNG copied. Paste it into X, Discord, Telegram, or anywhere.",
        title: "Image copied",
        tone: "success",
      });
    } catch {
      await downloadImageAsPng(finalResult.generatedImage.dataUrl, finalResult.id);
      showToast({
        message: "Browser blocked image clipboard access, so the PNG was downloaded.",
        title: "Image downloaded",
        tone: "info",
      });
    }
  }

  function downloadFinalImage() {
    if (!finalResult?.generatedImage) {
      return;
    }

    downloadImageAsPng(finalResult.generatedImage.dataUrl, finalResult.id);
  }

  function generateAgain() {
    resetPreview();
    setUploadedImage(undefined);
    setFlowError(undefined);
  }

  return (
    <section className="border-t border-white/10 bg-[radial-gradient(circle_at_70%_10%,rgba(34,211,238,0.12),transparent_24rem),rgba(9,9,11,0.86)] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-sm font-bold text-lime-100">
            <WandSparkles className="size-4" />
            Free preview first, 0.05 USDC final after
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
            <BadgeDollarSign className="size-4" />
            USDC Nano-payment
          </div>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
            Feed the agent a prompt.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
            Current personality:{" "}
            <span className="font-bold text-lime-200">
              {selectedPersonalityName}
            </span>
            . Preview is free; final generation sends a real Arc Testnet USDC
            transaction before the agent creates the meme.
          </p>

          <div className="mt-6 rounded-md border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-black uppercase text-zinc-500">
              Demo-ready flow
            </p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <p>1. Generate a free mock Grok preview.</p>
              <p>2. Send a real 0.05 USDC payment on Arc Testnet.</p>
              <p>3. Render a Flux-style meme image and save it to history.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {address && (
              <button
                className="rounded-md border border-lime-300/25 bg-lime-300/12 px-3 py-2 text-xs font-black text-lime-100 transition hover:border-lime-300/50 hover:bg-lime-300/18"
                onClick={() => setUserPrompt(`Roast wallet ${address}`)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <Wallet className="size-4" />
                  Use Connected Wallet
                </span>
              </button>
            )}
            {promptExamples.map((example) => (
              <button
                className="rounded-md border border-white/10 bg-white/7 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-pink-300/40 hover:bg-pink-300/10"
                key={example}
                onClick={() => setUserPrompt(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-white/7 p-4 shadow-2xl sm:p-5">
          {/* Input area: prompt and optional image upload. */}
          <label
            className="mb-2 block text-sm font-bold text-zinc-200"
            htmlFor="memeroast-prompt"
          >
            Prompt
          </label>
          <textarea
            className="min-h-[170px] w-full resize-y rounded-md border border-white/10 bg-zinc-950/80 p-4 text-base leading-7 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/20"
            id="memeroast-prompt"
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder="Roast my wallet, Make a meme about a Bitcoin crash, Write a funny caption for this image..."
            value={userPrompt}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              accept="image/*"
              className="hidden"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
              ref={fileInputRef}
              type="file"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              <ImagePlus className="size-4" />
              Upload Image
            </Button>
            <Button
              disabled={isLoading}
              onClick={generatePreview}
              type="button"
            >
              {isLoading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {isLoading ? "Cooking meme..." : "Generate Preview"}
            </Button>
          </div>

          {uploadedImage && (
            <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-zinc-950/70">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-xs text-zinc-400">
                <span className="truncate">{uploadedImage.name}</span>
                <button
                  aria-label="Remove uploaded image"
                  className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setUploadedImage(undefined)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Image
                alt="Uploaded meme source preview"
                className="max-h-[280px] w-full object-contain"
                height={560}
                src={uploadedImage.dataUrl}
                width={900}
              />
            </div>
          )}

          {isLoading && (
            <div className="mt-4 rounded-md border border-pink-300/20 bg-pink-300/10 p-4 text-sm font-semibold text-pink-100 shadow-[0_0_28px_rgba(244,114,182,0.12)]">
              <div className="flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                {loadingLine}
              </div>
            </div>
          )}

          {flowError && (
            <div className="mt-4 rounded-md border border-pink-300/25 bg-pink-300/10 p-4 text-sm text-pink-100">
              {flowError}
            </div>
          )}

          {/* Preview section: appears after the free preview is generated. */}
          {previewResult && (
            <div
              className="mt-5 rounded-md border border-lime-300/25 bg-lime-300/10 p-4"
              data-testid="preview-result"
            >
              <div className="flex items-center gap-2 text-sm font-black text-lime-100">
                <Sparkles className="size-4" />
                Preview Result
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                <div className="grid min-h-[180px] place-items-center rounded-md border border-white/10 bg-[linear-gradient(135deg,#18181b,#0f172a_45%,#3f1d3b)] p-4 text-center shadow-[inset_0_0_60px_rgba(190,242,100,0.08)]">
                  <div>
                    <p className="text-xs font-black uppercase text-lime-200">
                      Clean Meme Visual
                    </p>
                    <p className="mt-3 text-2xl font-black leading-tight text-white">
                      Wojak + candles + wallet chaos
                    </p>
                    <p className="mt-3 text-sm font-bold text-zinc-400">
                      Caption stays separate for readable sharing.
                    </p>
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
                  <p className="text-xs font-bold uppercase text-zinc-500">
                    Caption
                  </p>
                  <p className="mt-2 text-lg font-bold leading-7 text-white">
                    {previewResult.caption}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    Meme description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {previewResult.memeDescription}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    Image prompt seed
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    Square crypto meme image, neon chart chaos, cartoon trader,
                    clean symbol-only composition.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-md border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
                  Nanopayment:{" "}
                  <span className="font-black text-lime-200">
                    {PAYMENT_AMOUNT_USDC} USDC
                  </span>
                </div>
                <Button
                  className={cn(
                    "h-14 text-base shadow-[0_0_34px_rgba(190,242,100,0.42)]",
                    !canTryPayment && "opacity-70",
                  )}
                  disabled={!canTryPayment || isPaymentBusy}
                  onClick={openPaymentModal}
                  type="button"
                >
                  {isPaymentBusy ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  {isPaymentBusy
                    ? "Payment processing..."
                    : `Pay ${PAYMENT_AMOUNT_USDC} USDC & Generate Final`}
                </Button>
              </div>

              {!isConnected && previewResult && (
                <p className="mt-3 text-xs text-pink-200">
                  Connect wallet before final generation.
                </p>
              )}

              {isConnected && previewResult && !isArcTestnet && (
                <p className="mt-3 text-xs text-pink-200">
                  Switch to Arc Testnet before paying.
                </p>
              )}

              {paymentMessage && (
                <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                  {paymentMessage}
                </p>
              )}
            </div>
          )}

          {finalResult && (
            <div className="relative mt-5 overflow-hidden rounded-md border border-pink-300/30 bg-pink-300/10 p-4">
              {viewport.width > 0 && (
                <Confetti
                  height={viewport.height}
                  numberOfPieces={220}
                  recycle={false}
                  width={viewport.width}
                />
              )}
              <ViralBurst burstKey={viralBurstKey} />
              <div className="flex items-center gap-2 text-sm font-black text-pink-100">
                <PartyPopper className="size-4" />
                Final Meme Generated
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
                <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-950/80">
                  {finalResult.generatedImage ? (
                    <MemeVisual
                      imageUrl={finalResult.generatedImage.dataUrl}
                      title="Generated MemeRoast final meme"
                    />
                  ) : (
                    <div className="grid min-h-[260px] place-items-center p-4 text-center">
                      <p className="text-2xl font-black leading-tight text-white">
                        {finalResult.caption}
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
                  <p className="text-xs font-bold uppercase text-zinc-500">
                    Final Caption
                  </p>
                  <p className="mt-2 text-lg font-black leading-7 text-white">
                    {finalResult.caption}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    Image Prompt
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {finalResult.imagePrompt ?? finalResult.memeDescription}
                  </p>
                  {finalResult.generatedImage?.seed && (
                    <>
                      <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                        Image Seed
                      </p>
                      <p className="mt-2 text-sm font-black text-cyan-100">
                        {finalResult.generatedImage.seed}
                      </p>
                    </>
                  )}
                  <p className="text-xs font-bold uppercase text-zinc-500">
                    Agent Run
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-lime-100">
                    {finalResult.agentRunId}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    Arc Testnet Transaction
                  </p>
                  {getFinalTxHash(finalResult) ? (
                    <a
                      className="mt-2 block break-all text-sm font-bold text-cyan-100 transition hover:text-cyan-50"
                      href={getArcScanTxUrl(getFinalTxHash(finalResult)!)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {getFinalTxHash(finalResult)}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">Pending</p>
                  )}
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    Metadata Storage
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-zinc-300">
                    {finalResult.metadataUrl ??
                      (finalResult.metadataIpfsCid
                        ? `ipfs://${finalResult.metadataIpfsCid}`
                        : finalResult.metadataHash ?? "Local fallback")}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                    On-chain History
                  </p>
                  {finalResult.onChainHistoryTxHash ? (
                    <a
                      className="mt-2 block break-all text-sm font-bold text-lime-100 transition hover:text-lime-50"
                      href={getArcScanTxUrl(finalResult.onChainHistoryTxHash)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {finalResult.onChainHistoryTxHash}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm font-bold text-zinc-400">
                      {MEMEROAST_HISTORY_CONTRACT
                        ? finalResult.onChainHistoryStatus ?? "pending"
                        : "Skipped until NEXT_PUBLIC_MEMEROAST_HISTORY_CONTRACT is set"}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  onClick={copyFinalCaption}
                  type="button"
                  variant="secondary"
                >
                  <Copy className="size-4" />
                  Copy Caption
                </Button>
                <Button
                  onClick={copyFinalImage}
                  type="button"
                  variant="secondary"
                >
                  <Copy className="size-4" />
                  Copy Image
                </Button>
                <Button
                  onClick={downloadFinalImage}
                  type="button"
                  variant="secondary"
                >
                  <Download className="size-4" />
                  Download Image
                </Button>
                <Button onClick={shareFinalOnX} type="button" variant="secondary">
                  <Send className="size-4" />
                  Share on X
                </Button>
                <Button onClick={generateAgain} type="button">
                  <Repeat2 className="size-4" />
                  Generate Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-md border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-lime-300 text-zinc-950">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Confirm Nanopayment
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Pay {PAYMENT_AMOUNT_USDC} USDC to MemeRoast Agent? Your
                  wallet will send a real testnet transaction before final
                  generation.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-md border border-white/10 bg-white/6 p-3 text-sm text-zinc-300">
              <div>
                Wallet:{" "}
                <span className="font-bold text-white">
                  {address ? shortAddress(address) : "Not connected"}
                </span>
              </div>
              <div>
                Gas:{" "}
                <span className="font-bold text-lime-200">
                  USDC on Arc Testnet
                </span>
              </div>
              <div>
                Receiver:{" "}
                <span className="font-bold text-white">
                  {shortAddress(PAYMENT_RECEIVER_ADDRESS)}
                </span>
              </div>
              <StatusLine
                ok={isConnected}
                text={isConnected ? "Wallet connected" : "Wallet missing"}
              />
              <StatusLine
                ok={isArcTestnet}
                text={
                  isArcTestnet ? "Arc Testnet selected" : "Wrong network"
                }
              />
              <StatusLine
                ok={!hasInsufficientUsdc}
                text={
                  hasInsufficientUsdc
                    ? "Balance looks low in RPC check"
                    : `Balance: ${isBalanceLoading ? "Loading..." : balanceLabel}`
                }
              />
            </div>

            {hasInsufficientUsdc && (
              <p className="mt-3 rounded-md border border-pink-300/20 bg-pink-300/10 p-3 text-sm text-pink-100">
                RPC says the balance looks low. You can still try, but the
                wallet will reject the real testnet payment if funds are missing.
              </p>
            )}

            {(isConfirmingTx || isPaying) && (
              <div className="mt-3 rounded-md border border-lime-300/20 bg-lime-300/10 p-4 text-sm font-bold text-lime-100">
                <div className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  {paymentLine}
                </div>
                <p className="mt-2 text-xs font-medium text-lime-100/75">
                  Real testnet tx first, then the MemeRoast agent generates and
                  saves the final meme.
                </p>
              </div>
            )}

            {isSendingPayment && (
              <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold text-cyan-100">
                <div className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Waiting for wallet transaction...
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setIsConfirmOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                disabled={isPaymentBusy}
                onClick={confirmPayment}
                type="button"
              >
                {isPaymentBusy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {isSendingPayment
                  ? "Confirm in wallet..."
                  : isConfirmingTx
                    ? "Waiting for tx..."
                    : isPaying
                      ? "Roasting..."
                      : "Send 0.05 USDC"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="size-4 text-lime-200" />
      ) : (
        <AlertTriangle className="size-4 text-pink-200" />
      )}
      {text}
    </div>
  );
}

function ViralBurst({ burstKey }: { burstKey: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      key={burstKey}
    >
      {Array.from({ length: 14 }).map((_, index) => (
        <span
          className="viral-confetti"
          key={index}
          style={
            {
              "--x": `${8 + index * 7}%`,
              "--delay": `${index * 45}ms`,
              "--color": index % 2 === 0 ? "#bef264" : "#f472b6",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function MemeVisual({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <VisualFallback />;
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950">
          <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
            <div className="flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" />
              Generating Meme Visual...
            </div>
          </div>
        </div>
      )}
      <Image
        alt={title}
        className="h-full w-full object-cover"
        height={1080}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        src={imageUrl}
        width={1080}
      />
    </div>
  );
}

function VisualFallback() {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(135deg,#050505,#172554_48%,#09090b)]">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute left-[12%] top-[18%] h-[48%] w-[36%] rounded-md border border-pink-300/30 bg-pink-300/10" />
      <div className="absolute right-[12%] top-[20%] size-[28%] rounded-full border-8 border-lime-300/70 bg-lime-300/10" />
      <div className="absolute bottom-[18%] left-[14%] right-[14%] h-[20%] rounded-md border border-white/10 bg-white/8">
        <div className="absolute bottom-6 left-8 h-20 w-8 rounded-md bg-red-500" />
        <div className="absolute bottom-6 left-24 h-32 w-8 rounded-md bg-lime-400" />
        <div className="absolute bottom-6 left-40 h-16 w-8 rounded-md bg-red-500" />
        <div className="absolute bottom-6 left-56 h-28 w-8 rounded-md bg-cyan-300" />
      </div>
      <div className="absolute bottom-[13%] left-[18%] right-[18%] h-2 rounded-full bg-[linear-gradient(90deg,#ef4444,#bef264,#22d3ee)]" />
    </div>
  );
}

function getFinalTxHash(finalResult: {
  simulatedTxHash?: `0x${string}`;
  transactionHash?: `0x${string}`;
}) {
  return finalResult.transactionHash ?? finalResult.simulatedTxHash;
}

function getArcScanTxUrl(hash: `0x${string}`) {
  return `${arcTestnet.blockExplorers.default.url}/tx/${hash}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

