import { AppShell } from "@/components/sections/app-shell";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.18),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_28rem),#09090b] text-zinc-50">
      <AppShell />
    </main>
  );
}

