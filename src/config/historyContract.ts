export const MEMEROAST_HISTORY_CONTRACT = normalizeContractAddress(
  process.env.NEXT_PUBLIC_MEMEROAST_HISTORY_CONTRACT,
);

export const MEMEROAST_HISTORY_START_BLOCK = parseStartBlock(
  process.env.NEXT_PUBLIC_MEMEROAST_HISTORY_START_BLOCK,
);

export const memeRoastHistoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataUri",
        type: "string",
      },
    ],
    name: "RoastRecorded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_metadataUri",
        type: "string",
      },
    ],
    name: "recordRoast",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

function normalizeContractAddress(address?: string) {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return undefined;
  }

  return address as `0x${string}`;
}

function parseStartBlock(value?: string) {
  if (!value) {
    return BigInt(0);
  }

  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
}
