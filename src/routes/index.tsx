import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { StoryStage } from "@/components/StoryStage";
import { AudioToggle } from "@/components/AudioToggle";
import { ChatSheet } from "@/components/ChatSheet";
import { scrollState } from "@/lib/scroll-state";
import { playRelease } from "@/lib/audio-engine";

const StoryEngine = lazy(() => import("@/components/three/StoryEngine"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat | Say It Anonymously and Be Heard Honestly" },
      {
        name: "description",
        content:
          "A scroll-driven, anonymous space to say the thing you never say. Write what is heavy, choose a disappearing live chat, and be heard without judgment.",
      },
      { property: "og:title", content: "Dil Ki Baat | Say It Anonymously and Be Heard Honestly" },
      {
        property: "og:description",
        content: "No names. No judgment. Just your words, received with care.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Room = { roomId: string; alias: string; ttl: string };

function Index() {
  const [room, setRoom] = useState<Room | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // ACT 5 — a confession bursts the portal into embers and the drone resolves
  // into a warm triad while the sanctuary drawer opens.
  useEffect(() => {
    scrollState.connected = !!room;
    if (room) {
      scrollState.released = 1;
      playRelease();
      setChatOpen(true);
      const t = window.setTimeout(() => {
        scrollState.released = 0;
      }, 4000);
      return () => window.clearTimeout(t);
    }
    return () => {
      scrollState.connected = false;
    };
  }, [room]);

  return (
    <div className="grain relative">
      <SmoothScroll />

      {/* pinned WebGL viewport */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <StoryEngine />
          </Suspense>
        </ClientOnly>
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,transparent_0%,var(--core-veil)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(42%_30%_at_50%_45%,oklch(0.11_0.026_24/58%)_0%,transparent_72%)]" />
      </div>

      <SiteHeader />
      <AudioToggle />

      <StoryStage room={room} onStartChat={setRoom} onReopenChat={() => setChatOpen(true)} />

      {/* virtual scroll track that scrubs the five acts */}
      <div aria-hidden="true" className="h-[500vh] w-full" />

      {room && (
        <ChatSheet
          roomId={room.roomId}
          alias={room.alias}
          ttl={room.ttl}
          open={chatOpen}
          onOpenChange={setChatOpen}
        />
      )}
    </div>
  );
}
