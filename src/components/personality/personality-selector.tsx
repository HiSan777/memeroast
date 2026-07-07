"use client";

import { CheckCircle2 } from "lucide-react";

import { personalities } from "@/config/personalities";
import { cn } from "@/lib/utils";
import { useMemeRoastStore } from "@/store/memeroast-store";

export function PersonalitySelector() {
  const selectedPersonality = useMemeRoastStore(
    (state) => state.selectedPersonality,
  );
  const setSelectedPersonality = useMemeRoastStore(
    (state) => state.setSelectedPersonality,
  );

  return (
    <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {personalities.map((personality) => {
        const isSelected = selectedPersonality === personality.id;

        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              "group min-h-[112px] rounded-md border p-4 text-left transition",
              "border-white/10 bg-white/7 hover:border-lime-300/60 hover:bg-white/10",
              isSelected &&
                `${personality.accentClass} shadow-[0_0_28px_rgba(190,242,100,0.16)]`,
            )}
            key={personality.id}
            onClick={() => setSelectedPersonality(personality.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-white">{personality.name}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">
                  {personality.description}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="size-5 shrink-0 text-lime-200" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

