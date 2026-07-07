import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { arcTestnet } from "@/config/arc";

export const wagmiConfig = getDefaultConfig({
  appName: "MemeRoast",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "memeroast-dev",
  chains: [arcTestnet],
  ssr: true,
});

