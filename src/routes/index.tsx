import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { CoreCanvas } from "@/components/CoreCanvas";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SentimentLayers } from "@/components/SentimentLayers";
import { ThoughtsMarquee } from "@/components/ThoughtsMarquee";
import { ConfessionWizard } from "@/components/ConfessionWizard";
import { ChatSheet } from "@/components/ChatSheet";
import { Rise } from "@/components/Rise";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS, WHISPERS, WHY_IT_WORKS } from "@/lib/dilkibaat";
import { scrollState } from "@/lib/scroll-state";
import { AudioToggle } from "@/components/AudioToggle";
import { playRelease } from "@/lib/audio-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat | Say It Anonymously and Be Heard Honestly" },
      {
        name: "description",
        content:
          "An anonymous, unhurried space to speak, vent and be heard without judgment. Write what is heavy, choose a disappearing live chat, and get honest perspective.",
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

const PROMISES = [
  { t: "No name is ever asked", d: "There is nothing to sign up for, and nothing to take back." },
  { t: "No advice you did not ask for", d: "Say you only want to be heard, and that is what happens." },
  { t: "Conversations that disappear", d: "Choose an hour, a day, or never. Your call, always." },
  { t: "Nothing is shared without a yes", d: "Your story stays here unless you decide otherwise." },
];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.58rem] uppercase tracking-[0.44em] text-primary/70">{children}</p>;
}

function Index() {
  const [room, setRoom] = useState<Room | null>(null);

  // ACT 4 — once a conversation opens, the core widens into a calm aura
  // and the drone resolves into a warm harmonic chord.
  useEffect(() => {
    scrollState.connected = !!room;
    if (room) playRelease();
    return () => {
      scrollState.connected = false;
    };
  }, [room]);

  return (
    <div className="grain relative min-h-screen">
      <SmoothScroll />
      <CoreCanvas />
      <AudioToggle />
      <SiteHeader />


      {/* ── ACT 1 · the weight ─────────────────────────────── */}
      <Hero />

      {/* ── ACT 2 · the breakthrough ───────────────────────── */}
      <section id="thoughts" className="relative scroll-mt-24">
        <Rise className="mx-auto max-w-3xl px-6 text-center">
          <Label>Act two · the breakthrough</Label>
          <p className="mt-5 font-display text-[clamp(1.4rem,3.6vw,2.3rem)] italic leading-snug text-cream/80">
            Unspoken thoughts were never meant to be locked inside.
          </p>
        </Rise>

        <SentimentLayers />
        <ThoughtsMarquee />
      </section>

      {/* ── why it works: light, not boxes ─────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-40">
        <Rise className="aura-field max-w-3xl">
          <Label>Why this actually helps</Label>
          <h2 className="mt-5 font-display text-[clamp(2rem,5.4vw,3.6rem)] leading-[1.06] text-cream">
            Feelings shrink the moment they{" "}
            <span className="text-gradient-warm italic">become sentences</span>
          </h2>
        </Rise>

        <div className="mt-20 grid gap-x-14 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_IT_WORKS.map((w, i) => (
            <Rise key={w.t} delay={i * 0.06} className={i === 0 ? "sm:col-span-2" : ""}>
              <div className="relative">
                <div className="hairline mb-6 w-full opacity-60" />
                <p className="text-[0.56rem] uppercase tracking-[0.34em] text-primary/70">{w.k}</p>
                <h3 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-snug text-cream">
                  {w.t}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/55">{w.d}</p>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── whisper wall: floating quotes ──────────────────── */}
      <section className="relative mx-auto max-w-5xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Rise className="text-center">
          <Label>Afterwards</Label>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(1.8rem,4.6vw,3rem)] leading-tight text-cream">
            What people said once they had{" "}
            <span className="text-gradient-warm italic">finally said it</span>
          </h2>
        </Rise>

        <div className="mt-20 flex flex-col gap-20">
          {WHISPERS.map((w, i) => (
            <Rise
              key={w.tag}
              delay={i * 0.05}
              className={i % 2 ? "self-end text-right sm:pl-[14%]" : "self-start sm:pr-[14%]"}
            >
              <figure className="aura-field max-w-xl">
                <blockquote className="font-display text-[clamp(1.3rem,3.4vw,2.1rem)] italic leading-snug text-cream/90">
                  “{w.text}”
                </blockquote>
                <figcaption className="mt-6 text-[0.56rem] uppercase tracking-[0.34em] text-primary/60">
                  {w.tag}
                </figcaption>
              </figure>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── promises ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Rise>
          <h2 className="font-display text-[clamp(1.8rem,4.2vw,2.9rem)] text-cream">
            Four things we <span className="text-gradient-warm italic">will not do</span> to you
          </h2>
        </Rise>
        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Rise key={p.t} delay={i * 0.05}>
              <div>
                <div className="hairline mb-5 w-2/3 opacity-70" />
                <h3 className="font-display text-xl text-primary">{p.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/55">{p.d}</p>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── ACT 3 · the venting portal ─────────────────────── */}
      <section id="share" className="relative scroll-mt-24 px-5 pb-28 sm:px-8 sm:pb-40">
        <div className="mx-auto max-w-3xl">
          <Rise className="mb-14 text-center">
            <Label>Act three · your turn</Label>
            <h2 className="mt-5 font-display text-[clamp(2rem,5.4vw,3.4rem)] leading-tight text-gradient-warm">
              Whatever it is, let it out here
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-cream/60">
              No names. No judgment. Just your words, held gently. There is no right way to
              explain a feeling.
            </p>
          </Rise>

          <Rise delay={0.06}>
            <ConfessionWizard onStartChat={setRoom} />
          </Rise>
        </div>
      </section>

      {/* ── faq ────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-3xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Rise>
          <Label>Before you write</Label>
          <h2 className="mt-5 font-display text-[clamp(1.7rem,3.8vw,2.5rem)] text-cream">
            Questions people <span className="text-gradient-warm italic">usually ask first</span>
          </h2>
        </Rise>
        <Rise delay={0.06} className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-b border-primary/10">
                <AccordionTrigger className="py-6 text-left font-display text-lg text-cream hover:text-primary hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-7 text-sm leading-relaxed text-cream/60">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Rise>
      </section>

      <SiteFooter />

      {room && (
        <ChatSheet
          roomId={room.roomId}
          alias={room.alias}
          ttl={room.ttl}
          open={!!room}
          onOpenChange={(v) => !v && setRoom(null)}
        />
      )}
    </div>
  );
}
