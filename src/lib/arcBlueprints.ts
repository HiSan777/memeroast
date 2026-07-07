import type { PersonalityId } from "@/config/personalities";
import { createFreshEnglishRoast, ensureEnglishOnly } from "@/lib/englishRoast";
import { generateMemeImage, type GeneratedMemeImage } from "@/lib/memeImage";
import type { UploadedImage } from "@/store/memeroast-store";

export type ArcBlueprintAgentRequest = {
  walletAddress: `0x${string}`;
  personalityId: PersonalityId;
  prompt: string;
  image?: UploadedImage;
  previewCaption: string;
  previewMemeDescription: string;
};

export type ArcBlueprintAgentResponse = {
  caption: string;
  memeDescription: string;
  generatedImage: GeneratedMemeImage;
  agentRunId: string;
};

export function buildArcBlueprintAgentPayload(
  request: ArcBlueprintAgentRequest,
) {
  return {
    agent: {
      name: "MemeRoast Meme & Roast Agent",
      network: "Arc Testnet",
    },
    input: {
      walletAddress: request.walletAddress,
      personalityId: request.personalityId,
      prompt: request.prompt,
      image: request.image
        ? {
            fileName: request.image.name,
            // Production path: upload the image to IPFS first and pass cid/url here.
            inlineDataUrl: request.image.dataUrl,
          }
        : undefined,
      preview: {
        caption: request.previewCaption,
        memeDescription: request.previewMemeDescription,
      },
    },
  };
}

export async function runMemeRoastAgentSimulation(
  request: ArcBlueprintAgentRequest,
): Promise<ArcBlueprintAgentResponse> {
  const freshFinal = createFreshEnglishRoast({
    hasImage: Boolean(request.image),
    mode: "final",
    personalityId: request.personalityId,
    prompt: request.prompt,
  });
  const safeCaption = ensureEnglishOnly(freshFinal.caption);
  const safeDescription = ensureEnglishOnly(freshFinal.memeDescription);

  await new Promise((resolve) => setTimeout(resolve, 700));

  const finalCaption = safeCaption;
  const finalDescription = safeDescription;
  const generatedImage = await generateMemeImage({
    caption: finalCaption,
    memeDescription: finalDescription,
    personalityId: request.personalityId,
    sourceImageDataUrl: request.image?.dataUrl,
  });

  return {
    agentRunId: `arc-agent-sim-${Date.now()}`,
    caption: finalCaption,
    generatedImage,
    memeDescription: finalDescription,
  };
}

export async function callMemeRoastAgent(
  request: ArcBlueprintAgentRequest,
): Promise<ArcBlueprintAgentResponse> {
  // Production Arc Blueprints integration boundary.
  //
  // Replace this simulation with the official Arc Blueprints Agent SDK flow:
  // 1. Register or resolve the MemeRoast agent identity on Arc Testnet.
  // 2. Upload any user image to IPFS; pass CID/URL instead of inlineDataUrl.
  // 3. Build an agent job payload with walletAddress, personalityId, prompt,
  //    image CID, preview caption, and any moderation metadata.
  // 4. Use Wagmi/viem to submit the real 0.05 USDC nanopayment transaction.
  //    Arc Testnet uses USDC as gas; Circle/App Kit can power wallet/payment UX.
  // 5. Send the transaction receipt/hash into the Arc Blueprints settlement/job
  //    execution call so the agent run is tied to on-chain payment.
  // 6. Read the agent output, then persist the final caption/image metadata to
  //    local DB/IPFS/on-chain storage depending on the production architecture.
  //
  // The UI should keep calling this function so live Arc execution can replace
  // the mock without rewriting the Generate flow.
  return runMemeRoastAgentSimulation(request);
}

