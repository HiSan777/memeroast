"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PersonalityId } from "@/config/personalities";
import { callMemeRoastAgent } from "@/lib/arcBlueprints";
import { createEnglishRoastPreview } from "@/lib/englishRoast";
import type { GeneratedMemeImage } from "@/lib/memeImage";
import { storeRoastMetadata } from "@/lib/metadataStorage";
import { copyImageToClipboard, copyText } from "@/lib/share";

export type AppTab = "home" | "generate" | "history" | "leaderboard";

export type UploadedImage = {
  name: string;
  dataUrl: string;
};

export type PreviewResult = {
  caption: string;
  memeDescription: string;
  personalityId: PersonalityId;
  createdAt: number;
};

export type RoastHistoryItem = {
  id: string;
  walletAddress: `0x${string}`;
  personalityId: PersonalityId;
  prompt: string;
  caption: string;
  memeDescription: string;
  generatedImage?: GeneratedMemeImage;
  image?: UploadedImage;
  imagePrompt?: string;
  createdAt: number;
  likes: number;
  transactionHash?: `0x${string}`;
  simulatedTxHash?: `0x${string}`;
  agentRunId?: string;
  metadataHash?: string;
  metadataIpfsCid?: string;
  metadataStorageProvider?: "cloudinary" | "ipfs" | "none";
  metadataUrl?: string;
  onChainHistoryTxHash?: `0x${string}`;
  onChainHistoryStatus?: "failed" | "recorded" | "skipped";
};

export type LeaderboardItem = {
  id: string;
  rank: number;
  walletAddress: `0x${string}`;
  personalityId: PersonalityId;
  caption: string;
  memeDescription: string;
  generatedImage?: GeneratedMemeImage;
  likes: number;
  createdAt: number;
};

export type ToastMessage = {
  id: number;
  tone: "error" | "info" | "success";
  title: string;
  message: string;
};

type MemeRoastState = {
  activeTab: AppTab;
  selectedPersonality: PersonalityId;
  userPrompt: string;
  uploadedImage?: UploadedImage;
  previewResult?: PreviewResult;
  finalResult?: RoastHistoryItem;
  history: RoastHistoryItem[];
  leaderboard: LeaderboardItem[];
  isLoading: boolean;
  isPaying: boolean;
  viralBurstKey: number;
  walletError?: string;
  flowError?: string;
  paymentMessage?: string;
  shareMessage?: string;
  toast?: ToastMessage;
  setActiveTab: (tab: AppTab) => void;
  setSelectedPersonality: (personalityId: PersonalityId) => void;
  setUserPrompt: (prompt: string) => void;
  setUploadedImage: (image?: UploadedImage) => void;
  setWalletError: (message?: string) => void;
  setFlowError: (message?: string) => void;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: () => void;
  generatePreview: () => Promise<void>;
  completePaidGeneration: (
    walletAddress?: `0x${string}`,
    transactionHash?: `0x${string}`,
  ) => Promise<RoastHistoryItem | undefined>;
  markRoastOnChain: (
    roastId: string,
    status: "failed" | "recorded" | "skipped",
    txHash?: `0x${string}`,
  ) => void;
  shareRoast: (item: RoastHistoryItem) => Promise<void>;
  resetPreview: () => void;
};

const fakeLeaderboard: LeaderboardItem[] = [
  {
    id: "fake-1",
    rank: 1,
    walletAddress: "0x9A12c8b6A733F5D5aA870398dA222a33710B81d4",
    personalityId: "meme-lord",
    caption:
      "Bought the dip so hard the dip hired security and kept dumping anyway.",
    memeDescription:
      "A laser-eyed trader celebrates too early while red candles crash through the floor.",
    likes: 6842,
    createdAt: Date.now() - 1000 * 60 * 16,
  },
  {
    id: "fake-2",
    rank: 2,
    walletAddress: "0xD4C3b2a1aA21C9F21A9900E02E7d829B64bD1177",
    personalityId: "roast-master",
    caption:
      "This wallet has whale delusion, minnow liquidity, and a block explorer that looks concerned.",
    memeDescription:
      "A wallet stands outside a VIP club called Profit while liquidation alerts laugh nearby.",
    likes: 5129,
    createdAt: Date.now() - 1000 * 60 * 54,
  },
  {
    id: "fake-3",
    rank: 3,
    walletAddress: "0x7E57A670c8b6142cE5cD2a2D90D3d016BAbE1C42",
    personalityId: "crypto-degenerate",
    caption:
      "Leverage so high the chart needed oxygen and the liquidation bot asked for dessert.",
    memeDescription:
      "A trading screen screams liquidation while a neon rocket points in every wrong direction.",
    likes: 3904,
    createdAt: Date.now() - 1000 * 60 * 130,
  },
  {
    id: "fake-4",
    rank: 4,
    walletAddress: "0x2F45E1b9B9eD3e66c45C2f019384A8d4e633E934",
    personalityId: "chill",
    caption:
      "So calm during the dump it looked less like conviction and more like the app froze.",
    memeDescription:
      "A calm character sips iced coffee in front of tiny green candles and suspicious alerts.",
    likes: 2260,
    createdAt: Date.now() - 1000 * 60 * 260,
  },
];

export const useMemeRoastStore = create<MemeRoastState>()(
  persist(
    (set, get) => ({
      activeTab: "home",
      selectedPersonality: "roast-master",
      userPrompt: "",
      history: [],
      leaderboard: fakeLeaderboard,
      isLoading: false,
      isPaying: false,
      viralBurstKey: 0,
      showToast: (toast) =>
        set({
          toast: {
            ...toast,
            id: Date.now(),
          },
        }),
      dismissToast: () => set({ toast: undefined }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setSelectedPersonality: (selectedPersonality) =>
        set({
          selectedPersonality,
          previewResult: undefined,
          finalResult: undefined,
          paymentMessage: undefined,
        }),
      setUserPrompt: (userPrompt) =>
        set({
          userPrompt,
          previewResult: undefined,
          finalResult: undefined,
          flowError: undefined,
        }),
      setUploadedImage: (uploadedImage) =>
        set({
          uploadedImage,
          previewResult: undefined,
          finalResult: undefined,
          flowError: undefined,
        }),
      setWalletError: (walletError) => set({ walletError }),
      setFlowError: (flowError) =>
        set({
          flowError,
          toast: flowError
            ? {
                id: Date.now(),
                message: flowError,
                title: "Roast blocked",
                tone: "error",
              }
            : undefined,
        }),
      resetPreview: () =>
        set({
          finalResult: undefined,
          previewResult: undefined,
          paymentMessage: undefined,
        }),
      generatePreview: async () => {
        const { selectedPersonality, uploadedImage, userPrompt } = get();
        const prompt = userPrompt.trim();

        if (!prompt) {
          const message = "Drop a prompt first. The AI cannot roast silence.";

          set({
            flowError: message,
            toast: {
              id: Date.now(),
              message,
              title: "Prompt missing",
              tone: "error",
            },
          });
          return;
        }

        set({
          flowError: undefined,
          finalResult: undefined,
          isLoading: true,
          paymentMessage: undefined,
          previewResult: undefined,
        });

        await new Promise((resolve) => setTimeout(resolve, 850));

        set({
          isLoading: false,
          previewResult: {
            ...createEnglishRoastPreview(
              selectedPersonality,
              Boolean(uploadedImage),
              prompt,
            ),
            personalityId: selectedPersonality,
            createdAt: Date.now(),
          },
        });
      },
      completePaidGeneration: async (walletAddress, transactionHash) => {
        const { previewResult, uploadedImage, userPrompt } = get();

        if (!previewResult) {
          const message = "Generate a free preview before paying USDC.";

          set({
            flowError: message,
            toast: {
              id: Date.now(),
              message,
              title: "Preview first",
              tone: "error",
            },
          });
          return undefined;
        }

        if (!walletAddress) {
          const message = "Connect wallet before final generation.";

          set({
            flowError: message,
            toast: {
              id: Date.now(),
              message,
              title: "Wallet missing",
              tone: "error",
            },
          });
          return undefined;
        }

        if (!transactionHash) {
          const message = "Payment transaction is missing. Please try again.";

          set({
            flowError: message,
            toast: {
              id: Date.now(),
              message,
              title: "Payment missing",
              tone: "error",
            },
          });
          return undefined;
        }

        set({ flowError: undefined, isPaying: true, paymentMessage: undefined });

        await new Promise((resolve) => setTimeout(resolve, 900));

        const agentResult = await callMemeRoastAgent({
          walletAddress,
          personalityId: previewResult.personalityId,
          prompt: userPrompt.trim(),
          image: uploadedImage,
          previewCaption: previewResult.caption,
          previewMemeDescription: previewResult.memeDescription,
        });

        const baseHistoryItem: RoastHistoryItem = {
          id: `roast-${Date.now()}`,
          walletAddress,
          personalityId: previewResult.personalityId,
          prompt: userPrompt.trim(),
          caption: agentResult.caption,
          generatedImage: agentResult.generatedImage,
          memeDescription: agentResult.memeDescription,
          image: uploadedImage,
          imagePrompt: agentResult.generatedImage.prompt,
          createdAt: Date.now(),
          likes: Math.floor(32 + Math.random() * 800),
          transactionHash,
          agentRunId: agentResult.agentRunId,
        };
        const storedMetadata = await storeRoastMetadata({
          agentRunId: baseHistoryItem.agentRunId,
          caption: baseHistoryItem.caption,
          createdAt: baseHistoryItem.createdAt,
          generatedImage: baseHistoryItem.generatedImage,
          memeDescription: baseHistoryItem.memeDescription,
          paymentTxHash: transactionHash,
          personalityId: baseHistoryItem.personalityId,
          prompt: baseHistoryItem.prompt,
          uploadedImage,
          walletAddress,
        });
        const historyItem: RoastHistoryItem = {
          ...baseHistoryItem,
          metadataHash: storedMetadata.contentHash,
          metadataIpfsCid: storedMetadata.ipfsCid,
          metadataStorageProvider: storedMetadata.storageProvider,
          metadataUrl: storedMetadata.metadataUrl,
          onChainHistoryStatus: "skipped",
        };

        set((state) => ({
          finalResult: historyItem,
          history: [historyItem, ...state.history],
          isPaying: false,
          viralBurstKey: state.viralBurstKey + 1,
          paymentMessage:
            `Arc Testnet payment confirmed. Tx ${shortHash(transactionHash)} saved to My History.`,
          toast: {
            id: Date.now(),
            message:
              "Real testnet payment confirmed, final meme generated, timeline chaos prepared.",
            title: "Roast delivered",
            tone: "success",
          },
        }));

        return historyItem;
      },
      markRoastOnChain: (roastId, status, txHash) =>
        set((state) => ({
          finalResult:
            state.finalResult?.id === roastId
              ? {
                  ...state.finalResult,
                  onChainHistoryStatus: status,
                  onChainHistoryTxHash: txHash,
                }
              : state.finalResult,
          history: state.history.map((item) =>
            item.id === roastId
              ? {
                  ...item,
                  onChainHistoryStatus: status,
                  onChainHistoryTxHash: txHash,
                }
              : item,
          ),
        })),
      shareRoast: async (item) => {
        const shareText = item.caption;

        try {
          if (item.generatedImage && typeof window !== "undefined") {
            await copyImageToClipboard(item.generatedImage.dataUrl);
          } else {
            await copyText(shareText);
          }

          set({
            shareMessage:
              item.generatedImage
                ? "Image copied. Use Copy Caption separately when needed."
                : "Caption copied.",
            toast: {
              id: Date.now(),
              message: item.generatedImage
                ? "Meme PNG copied to clipboard."
                : "Clean caption copied.",
              title: "Share ready",
              tone: "success",
            },
          });
        } catch {
          await copyText(shareText);
          set({
            shareMessage:
              "Image copy was blocked, so only the clean caption was copied.",
            toast: {
              id: Date.now(),
              message: "Clipboard image write was blocked. Caption still copied.",
              title: "Caption copied",
              tone: "info",
            },
          });
        }
      },
    }),
    {
      name: "memeroast-state-v8",
      partialize: (state) => ({
        activeTab: state.activeTab,
        selectedPersonality: state.selectedPersonality,
        history: state.history,
        leaderboard: state.leaderboard,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

function shortHash(hash: `0x${string}`) {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

