"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, CheckCircle2, PlugZap, Wallet } from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { arcTestnet } from "@/config/arc";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/wallet";
import { useMemeRoastStore } from "@/store/memeroast-store";

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const setWalletError = useMemeRoastStore((state) => state.setWalletError);
  const { switchChainAsync, isPending } = useSwitchChain();

  async function switchToArcTestnet(openChainModal: () => void) {
    setWalletError(undefined);

    try {
      if (!switchChainAsync) {
        openChainModal();
        return;
      }

      await switchChainAsync({ chainId: arcTestnet.id });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not switch to Arc Testnet.";

      setWalletError(message);
    }
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const wrongNetwork =
          connected && (chain.unsupported || chain.id !== arcTestnet.id);

        if (!ready) {
          return (
            <Button size="lg" disabled>
              <Wallet className="size-5" />
              {compact ? "Loading" : "Loading wallet"}
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button
              size="lg"
              onClick={() => {
                setWalletError(undefined);
                openConnectModal();
              }}
              type="button"
            >
              <PlugZap className="size-5" />
              {compact ? "Connect" : "Connect Wallet"}
            </Button>
          );
        }

        if (wrongNetwork) {
          return (
            <Button
              size="lg"
              onClick={() => switchToArcTestnet(openChainModal)}
              type="button"
            >
              <AlertTriangle className="size-5" />
              {isPending
                ? "Switching..."
                : compact
                  ? "Arc Testnet"
                  : "Switch to Arc Testnet"}
            </Button>
          );
        }

        return (
          <Button
            size="lg"
            onClick={openAccountModal}
            type="button"
            className={compact ? "w-full sm:min-w-[170px]" : "min-w-[210px]"}
          >
            <CheckCircle2 className="size-5" />
            {shortAddress(account.address)}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function WalletStatusPanel() {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const walletError = useMemeRoastStore((state) => state.walletError);
  const isArcTestnet = chainId === arcTestnet.id;

  if (!isConnected) {
    return (
      <div className="rounded-md border border-white/10 bg-white/6 px-4 py-3 text-sm text-zinc-300">
        Wallet: <span className="font-bold text-pink-200">Not connected</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/6 px-4 py-3 text-sm text-zinc-300">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          Wallet:{" "}
          <span className="font-bold text-white">
            {shortAddress(walletAddress)}
          </span>
        </span>
        <span>
          Network:{" "}
          <span className={isArcTestnet ? "text-lime-200" : "text-pink-200"}>
            {isArcTestnet ? "Arc Testnet" : `Wrong chain ${chainId ?? ""}`}
          </span>
        </span>
        <span>
          Gas: <span className="font-bold text-lime-200">USDC</span>
        </span>
      </div>

      {!isArcTestnet && (
        <p className="mt-2 text-xs text-pink-200">
          Please switch to Arc Testnet before generating or paying.
        </p>
      )}

      {walletError && (
        <p className="mt-2 text-xs text-pink-200">Wallet error: {walletError}</p>
      )}
    </div>
  );
}

