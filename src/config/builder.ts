import { isAddress } from "viem";

const configuredBuilderWallet =
  process.env.NEXT_PUBLIC_BUILDER_WALLET_ADDRESS ?? "";

export const builderWalletAddress = isAddress(configuredBuilderWallet)
  ? configuredBuilderWallet
  : undefined;

