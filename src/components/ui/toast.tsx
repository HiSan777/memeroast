"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMemeRoastStore } from "@/store/memeroast-store";

export function ToastViewport() {
  const toast = useMemeRoastStore((state) => state.toast);
  const dismissToast = useMemeRoastStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(dismissToast, 4200);

    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast]);

  if (!toast) {
    return null;
  }

  const Icon =
    toast.tone === "success"
      ? CheckCircle2
      : toast.tone === "error"
        ? AlertTriangle
        : Info;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:w-[380px]">
      <div
        className={cn(
          "tab-panel-enter rounded-md border p-4 shadow-2xl backdrop-blur-xl",
          toast.tone === "success" &&
            "border-lime-300/30 bg-lime-300/12 text-lime-50",
          toast.tone === "error" &&
            "border-pink-300/30 bg-pink-300/12 text-pink-50",
          toast.tone === "info" &&
            "border-cyan-300/30 bg-cyan-300/12 text-cyan-50",
        )}
        role="status"
      >
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-black">{toast.title}</p>
            <p className="mt-1 text-sm leading-5 opacity-85">{toast.message}</p>
          </div>
          <button
            aria-label="Dismiss notification"
            className="rounded-md p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
            onClick={dismissToast}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

