import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { NarrativeStage } from "@/components/narrative/NarrativeStage";
import { ChatSheet } from "@/components/ChatSheet";
import { scrollState } from "@/lib/scroll-state";
import { playRelease } from "@/lib/audio-engine";

const NarrativeCanvas = lazy(() => import("@/components/three/NarrativeCanvas"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat | Say It Anonymously and Be Heard Honestly" },
      {
        name: "description",
        content:
          "An eight-chapter scroll journey through loneliness, and an anonymous place to put down what you carry. Write it, be read by a real person, chat and let it disappear.",
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

  // A released confession warms the whole scene and opens the sanctuary.
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
    <div id="app-root" className="grain relative w-full">
      <SmoothScroll />

      {/* the vector canvas lives behind the pinned viewport for the whole story */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <NarrativeCanvas />
          </Suspense>
        </ClientOnly>
      </div>

      <SiteHeader />

      <NarrativeStage room={room} onStartChat={setRoom} onReopenChat={() => setChatOpen(true)} />

      {/* the 800vh track that scrubs the eight acts */}
      <div aria-hidden="true" className="h-[800vh] w-full" />

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
