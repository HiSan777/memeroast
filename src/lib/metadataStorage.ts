import type { PersonalityId } from "@/config/personalities";
import type { GeneratedMemeImage } from "@/lib/memeImage";
import type { UploadedImage } from "@/store/memeroast-store";

export type RoastMetadataInput = {
  walletAddress: `0x${string}`;
  personalityId: PersonalityId;
  prompt: string;
  caption: string;
  memeDescription: string;
  generatedImage?: GeneratedMemeImage;
  uploadedImage?: UploadedImage;
  paymentTxHash?: `0x${string}`;
  agentRunId?: string;
  createdAt: number;
};

export type StoredRoastMetadata = {
  contentHash: string;
  metadataUrl?: string;
  ipfsCid?: string;
  storageProvider: "cloudinary" | "ipfs" | "none";
};

export async function storeRoastMetadata(
  input: RoastMetadataInput,
): Promise<StoredRoastMetadata> {
  const metadata = buildRoastMetadata(input);

  try {
    const response = await fetch("/api/store-metadata", {
      body: JSON.stringify(metadata),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Metadata storage route failed");
    }

    return (await response.json()) as StoredRoastMetadata;
  } catch {
    return {
      contentHash: await browserSha256Hex(JSON.stringify(metadata)),
      storageProvider: "none",
    };
  }
}

export function getMetadataUri(metadata: {
  metadataUrl?: string;
  metadataIpfsCid?: string;
}) {
  if (metadata.metadataUrl) {
    return metadata.metadataUrl;
  }

  if (metadata.metadataIpfsCid) {
    return `ipfs://${metadata.metadataIpfsCid}`;
  }

  return undefined;
}

function buildRoastMetadata({
  agentRunId,
  caption,
  createdAt,
  generatedImage,
  memeDescription,
  paymentTxHash,
  personalityId,
  prompt,
  uploadedImage,
  walletAddress,
}: RoastMetadataInput) {
  return {
    agentRunId,
    app: "MemeRoast",
    caption,
    createdAt,
    image: generatedImage
      ? {
          contentHash: generatedImage.contentHash,
          ipfsCid: generatedImage.ipfsCid,
          prompt: generatedImage.prompt,
          provider: generatedImage.provider,
          seed: generatedImage.seed,
          storageProvider: generatedImage.storageProvider,
          template: generatedImage.template,
          url: generatedImage.assetUrl ?? generatedImage.dataUrl,
        }
      : undefined,
    memeDescription,
    paymentTxHash,
    personalityId,
    prompt,
    sourceImage: uploadedImage
      ? {
          fileName: uploadedImage.name,
          included: true,
        }
      : undefined,
    walletAddress,
  };
}

async function browserSha256Hex(value: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return `local-${Date.now().toString(16)}`;
  }

  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}
