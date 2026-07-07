type ImageFunctionEnv = {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  IMAGE_GENERATION_API_KEY?: string;
  IMAGE_GENERATION_ENDPOINT?: string;
  IMAGE_GENERATION_MODEL?: string;
  IMAGE_GENERATION_PAYLOAD_MODE?: "generic" | "openai" | "replicate";
  IPFS_GATEWAY_URL?: string;
  IPFS_JWT?: string;
  PINATA_JWT?: string;
};

type PagesContext = {
  env: ImageFunctionEnv;
  request: Request;
};

type ProviderResult = {
  imageUrl: string;
  rawPayload: Record<string, unknown>;
};

type StoredImageAsset = {
  contentHash: string;
  imageUrl: string;
  ipfsCid?: string;
  storageProvider: "cloudinary" | "ipfs" | "provider-url";
};

export const onRequestPost = async ({ env, request }: PagesContext) => {
  const { prompt, seed } = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    seed?: number;
  };

  if (!prompt) {
    return json({ error: "Prompt missing" }, 400);
  }

  if (!env.IMAGE_GENERATION_ENDPOINT || !env.IMAGE_GENERATION_API_KEY) {
    return json(
      {
        error:
          "Image provider is not configured. Add IMAGE_GENERATION_ENDPOINT and IMAGE_GENERATION_API_KEY in Cloudflare.",
      },
      501,
    );
  }

  const finalSeed = seed ?? Math.floor(Math.random() * 1_000_000);
  const providerResult = await callImageProvider({
    env,
    prompt: addProviderVariation(prompt, finalSeed),
    seed: finalSeed,
  }).catch((error) => {
    if (error instanceof ProviderError) {
      return error;
    }

    return new ProviderError("Image provider failed", 502);
  });

  if (providerResult instanceof ProviderError) {
    return json(
      {
        error: providerResult.message,
        status: providerResult.status,
      },
      providerResult.status,
    );
  }

  const storedAsset = await persistImageIfConfigured({
    env,
    imageUrl: providerResult.imageUrl,
    prompt,
    seed: finalSeed,
  });

  return json({
    contentHash: storedAsset.contentHash,
    imageUrl: storedAsset.imageUrl,
    ipfsCid: storedAsset.ipfsCid,
    providerPayloadShape: Object.keys(providerResult.rawPayload).slice(0, 8),
    seed: finalSeed,
    storageProvider: storedAsset.storageProvider,
  });
};

async function callImageProvider({
  env,
  prompt,
  seed,
}: {
  env: ImageFunctionEnv;
  prompt: string;
  seed: number;
}): Promise<ProviderResult> {
  const providerResponse = await fetch(env.IMAGE_GENERATION_ENDPOINT!, {
    body: JSON.stringify(buildProviderPayload(env, prompt, seed)),
    headers: {
      Authorization: `Bearer ${env.IMAGE_GENERATION_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!providerResponse.ok) {
    throw new ProviderError("Image provider failed", 502);
  }

  const rawPayload = (await providerResponse.json()) as Record<string, unknown>;
  const imageUrl = extractImageUrl(rawPayload);

  if (!imageUrl) {
    throw new ProviderError("Image provider returned no image URL", 502);
  }

  return { imageUrl, rawPayload };
}

function buildProviderPayload(
  env: ImageFunctionEnv,
  prompt: string,
  seed: number,
) {
  const mode = env.IMAGE_GENERATION_PAYLOAD_MODE ?? "openai";
  const model = env.IMAGE_GENERATION_MODEL;

  if (mode === "replicate") {
    return {
      input: {
        height: 1080,
        prompt,
        seed,
        width: 1080,
      },
      model,
    };
  }

  if (mode === "generic") {
    return {
      model,
      prompt,
      seed,
      size: "1080x1080",
      width: 1080,
      height: 1080,
    };
  }

  // OpenAI-compatible image APIs, including xAI/Grok-compatible gateways.
  return {
    model,
    n: 1,
    prompt,
    response_format: "url",
    seed,
    size: "1024x1024",
  };
}

function addProviderVariation(prompt: string, seed: number) {
  return [
    prompt,
    "Keep the image clean with no embedded caption text, no watermark, no UI labels.",
    `Unique visual seed ${seed}; change composition, character, lighting, palette, and camera angle.`,
  ].join(" ");
}

async function persistImageIfConfigured({
  env,
  imageUrl,
  prompt,
  seed,
}: {
  env: ImageFunctionEnv;
  imageUrl: string;
  prompt: string;
  seed: number;
}): Promise<StoredImageAsset> {
  const contentHash = await sha256Hex(`${prompt}:${seed}:${imageUrl}`);

  if (env.PINATA_JWT || env.IPFS_JWT) {
    const uploaded = await uploadImageToPinata({
      gatewayUrl: env.IPFS_GATEWAY_URL,
      imageUrl,
      jwt: env.PINATA_JWT ?? env.IPFS_JWT!,
      seed,
    }).catch(() => undefined);

    if (uploaded) {
      return { ...uploaded, contentHash, storageProvider: "ipfs" as const };
    }
  }

  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_UPLOAD_PRESET) {
    const uploaded = await uploadImageToCloudinary({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      imageUrl,
      preset: env.CLOUDINARY_UPLOAD_PRESET,
    }).catch(() => undefined);

    if (uploaded) {
      return {
        contentHash,
        imageUrl: uploaded.imageUrl,
        storageProvider: "cloudinary" as const,
      };
    }
  }

  return {
    contentHash,
    imageUrl,
    storageProvider: "provider-url" as const,
  };
}

async function uploadImageToPinata({
  gatewayUrl,
  imageUrl,
  jwt,
  seed,
}: {
  gatewayUrl?: string;
  imageUrl: string;
  jwt: string;
  seed: number;
}) {
  const blob = await imageUrlToBlob(imageUrl);
  const form = new FormData();

  form.append(
    "file",
    new File([blob], `memeroast-${seed}.png`, {
      type: blob.type || "image/png",
    }),
  );
  form.append(
    "pinataMetadata",
    JSON.stringify({
      name: `memeroast-${seed}.png`,
    }),
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    body: form,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("IPFS upload failed");
  }

  const payload = (await response.json()) as { IpfsHash?: string };
  const ipfsCid = payload.IpfsHash;

  if (!ipfsCid) {
    throw new Error("IPFS upload returned no CID");
  }

  return {
    imageUrl: `${normalizeGateway(gatewayUrl)}/ipfs/${ipfsCid}`,
    ipfsCid,
  };
}

async function uploadImageToCloudinary({
  cloudName,
  imageUrl,
  preset,
}: {
  cloudName: string;
  imageUrl: string;
  preset: string;
}) {
  const form = new FormData();

  form.append("file", imageUrl);
  form.append("upload_preset", preset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      body: form,
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const payload = (await response.json()) as { secure_url?: string };

  if (!payload.secure_url) {
    throw new Error("Cloudinary upload returned no URL");
  }

  return { imageUrl: payload.secure_url };
}

async function imageUrlToBlob(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const [meta, data] = imageUrl.split(",");
    const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
    const binary = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));

    return new Blob([binary], { type: mime });
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Could not fetch image for upload");
  }

  return response.blob();
}

function extractImageUrl(payload: Record<string, unknown>) {
  const direct =
    readString(payload, "imageUrl") ??
    readString(payload, "image_url") ??
    readString(payload, "output") ??
    readString(payload, "url");

  if (direct) {
    return direct;
  }

  const data = payload.data;

  if (Array.isArray(data)) {
    const first = data[0];

    if (isRecord(first)) {
      const b64 = readString(first, "b64_json");
      const url = readString(first, "url");

      return b64 ? `data:image/png;base64,${b64}` : url;
    }
  }

  const images = payload.images;

  if (Array.isArray(images)) {
    const first = images[0];

    if (typeof first === "string") {
      return first;
    }

    if (isRecord(first)) {
      return readString(first, "url") ?? readString(first, "imageUrl");
    }
  }

  const output = payload.output;

  if (Array.isArray(output)) {
    const first = output[0];

    return typeof first === "string" ? first : undefined;
  }

  return undefined;
}

function normalizeGateway(gatewayUrl?: string) {
  return (gatewayUrl || "https://gateway.pinata.cloud").replace(/\/$/, "");
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

class ProviderError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
