import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { HeartBackground } from "@/components/HeartBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { ConfessionForm } from "@/components/ConfessionForm";
import { ChatWidget } from "@/components/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat — Share Your Story Anonymously, Get Real Advice" },
      {
        name: "description",
        content:
          "A safe, anonymous space to share what's heavy on your heart. Vent, ask for advice, or chat privately with a mentor. Dil Ki Baat. Sabke Saath.",
      },
      { property: "og:title", content: "Dil Ki Baat — Share Your Story Anonymously" },
      {
        property: "og:description",
        content:
          "No names. No judgment. Just your thoughts. Share your dilemma anonymously and hear from a caring community.",
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

  return (
    <div className="relative min-h-screen">
      <section className="relative min-h-[86vh] overflow-hidden">
        <HeartBackground />
        <SiteHeader />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-24">
          <p className="mb-4 rounded-full border border-border bg-card/50 px-4 py-1 text-xs uppercase tracking-[0.25em] text-primary/80 backdrop-blur-sm">
            A brand by aapkamentor.ai
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-gradient-gold sm:text-7xl">
            Dil se sunenge,
            <br />
            samajh se bolenge.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            We all go through things — love, friendship, pain, confusion. But not everyone has
            someone to talk to. That's why this page exists.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-lg text-primary/90">
            <span>→ Anonymous</span>
            <span>→ Supportive</span>
            <span>→ Judgement-Free</span>
          </div>
          <a
            href="#share"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Share your Dil Ki Baat
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-16 sm:grid-cols-3">
        {[
          { t: "You speak", d: "Write whatever's troubling you. No name. No identity. Just truth." },
          { t: "We listen & post", d: "We share your submission without any identity on our page." },
          { t: "People respond", d: "Perspectives, honest advice and life-learned lessons." },
        ].map((s, i) => (
          <article key={s.t} className="rounded-2xl glass-panel p-6 text-left">
            <span className="font-display text-4xl text-primary/40">0{i + 1}</span>
            <h2 className="mt-2 font-display text-2xl text-primary">{s.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </article>
        ))}
      </section>

      <section id="share" className="mx-auto max-w-3xl scroll-mt-8 px-5 pb-24">
        <div className="mb-8 text-center">
          <h2 className="font-display text-4xl text-gradient-gold">
            Share Your Dil Ki Baat — Anonymously
          </h2>
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">No names. No judgment. Just your thoughts.</strong>{" "}
            Real people will share their views, experiences & honest takes.
          </p>
        </div>
        <ConfessionForm onStartChat={setRoom} />
      </section>

      <footer className="border-t border-border px-5 py-10 text-center text-sm text-muted-foreground">
        <p>Dil Ki Baat — a community initiative by aapkamentor.ai</p>
        <p className="mt-2">
          <Link to="/terms" className="text-primary underline underline-offset-4">
            Disclaimer & Terms of Service
          </Link>
        </p>
      </footer>

      {room && (
        <ChatWidget
          roomId={room.roomId}
          alias={room.alias}
          ttl={room.ttl}
          onClose={() => setRoom(null)}
        />
      )}
    </div>
  );
}
