type MetadataFunctionEnv = {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  IPFS_GATEWAY_URL?: string;
  IPFS_JWT?: string;
  PINATA_JWT?: string;
};

type PagesContext = {
  env: MetadataFunctionEnv;
  request: Request;
};

type StoredMetadata = {
  contentHash: string;
  metadataUrl?: string;
  ipfsCid?: string;
  storageProvider: "cloudinary" | "ipfs" | "none";
};

export const onRequestPost = async ({ env, request }: PagesContext) => {
  const metadata = (await request.json().catch(() => undefined)) as
    | Record<string, unknown>
    | undefined;

  if (!metadata) {
    return json({ error: "Metadata missing" }, 400);
  }

  const cleanMetadata = {
    ...metadata,
    app: "MemeRoast",
    schemaVersion: 1,
    storedAt: new Date().toISOString(),
  };
  const contentHash = await sha256Hex(JSON.stringify(cleanMetadata));
  const stored = await persistMetadata(env, cleanMetadata, contentHash);

  return json(stored);
};

async function persistMetadata(
  env: MetadataFunctionEnv,
  metadata: Record<string, unknown>,
  contentHash: string,
): Promise<StoredMetadata> {
  if (env.PINATA_JWT || env.IPFS_JWT) {
    const ipfs = await uploadJsonToPinata({
      gatewayUrl: env.IPFS_GATEWAY_URL,
      jwt: env.PINATA_JWT ?? env.IPFS_JWT!,
      metadata,
    }).catch(() => undefined);

    if (ipfs) {
      return {
        contentHash,
        ipfsCid: ipfs.ipfsCid,
        metadataUrl: ipfs.metadataUrl,
        storageProvider: "ipfs",
      };
    }
  }

  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_UPLOAD_PRESET) {
    const cloudinary = await uploadJsonToCloudinary({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      metadata,
      preset: env.CLOUDINARY_UPLOAD_PRESET,
    }).catch(() => undefined);

    if (cloudinary) {
      return {
        contentHash,
        metadataUrl: cloudinary.metadataUrl,
        storageProvider: "cloudinary",
      };
    }
  }

  return {
    contentHash,
    storageProvider: "none",
  };
}

async function uploadJsonToPinata({
  gatewayUrl,
  jwt,
  metadata,
}: {
  gatewayUrl?: string;
  jwt: string;
  metadata: Record<string, unknown>;
}) {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `memeroast-${Date.now()}.json`,
      },
    }),
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("IPFS metadata upload failed");
  }

  const payload = (await response.json()) as { IpfsHash?: string };
  const ipfsCid = payload.IpfsHash;

  if (!ipfsCid) {
    throw new Error("IPFS metadata upload returned no CID");
  }

  return {
    ipfsCid,
    metadataUrl: `${normalizeGateway(gatewayUrl)}/ipfs/${ipfsCid}`,
  };
}

async function uploadJsonToCloudinary({
  cloudName,
  metadata,
  preset,
}: {
  cloudName: string;
  metadata: Record<string, unknown>;
  preset: string;
}) {
  const dataUrl = `data:application/json;base64,${btoa(
    JSON.stringify(metadata),
  )}`;
  const form = new FormData();

  form.append("file", dataUrl);
  form.append("upload_preset", preset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    {
      body: form,
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Cloudinary metadata upload failed");
  }

  const payload = (await response.json()) as { secure_url?: string };

  if (!payload.secure_url) {
    throw new Error("Cloudinary metadata upload returned no URL");
  }

  return { metadataUrl: payload.secure_url };
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeGateway(gatewayUrl?: string) {
  return (gatewayUrl || "https://gateway.pinata.cloud").replace(/\/$/, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
