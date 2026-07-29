import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Feather, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
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

const STEPS = [
  {
    icon: Feather,
    n: "01",
    t: "You write it down",
    d: "No name, no sign up, no explaining yourself. The messy version is the honest one.",
  },
  {
    icon: ShieldCheck,
    n: "02",
    t: "We hold it carefully",
    d: "Your words stay exactly as you wrote them, with every trace of you stripped out first.",
  },
  {
    icon: MessageCircleHeart,
    n: "03",
    t: "People answer honestly",
    d: "Real perspective from people who once needed to hear it themselves. No lectures.",
  },
];

const PROMISES = [
  { t: "No name is ever asked", d: "There is nothing to sign up for, and nothing to take back." },
  { t: "No advice you did not ask for", d: "Say you only want to be heard, and that is what happens." },
  { t: "Conversations that disappear", d: "Choose an hour, a day, or never. Your call, always." },
  { t: "Nothing is shared without a yes", d: "Your story stays here unless you decide otherwise." },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.62rem] uppercase tracking-[0.4em] text-primary/75">{children}</p>
  );
}

function Index() {
  const [room, setRoom] = useState<Room | null>(null);

  return (
    <div className="grain relative min-h-screen">
      <SiteHeader />
      <Hero />

      {/* ── the ticker ─────────────────────────────────────── */}
      <section id="thoughts" className="relative scroll-mt-24 pb-6">
        <Rise className="mx-auto mb-4 max-w-3xl px-6 text-center">
          <SectionLabel>What people are carrying right now</SectionLabel>
        </Rise>
        <ThoughtsMarquee />
      </section>

      {/* ── how it works ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Rise className="max-w-2xl">
          <SectionLabel>Three steps · about four minutes</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.08] text-cream">
            No accounts. No waiting room.{" "}
            <span className="text-gradient-warm italic">Just say it.</span>
          </h2>
        </Rise>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Rise key={s.t} delay={i * 0.08}>
              <article className="glass-card h-full rounded-3xl p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full border border-primary/25 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl text-primary/25">{s.n}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-cream">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </article>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── why it works: bento ────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
        <Rise className="max-w-3xl">
          <SectionLabel>Why this actually helps</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.08] text-cream">
            Feelings shrink the moment they{" "}
            <span className="text-gradient-warm italic">become sentences</span>
          </h2>
        </Rise>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_IT_WORKS.map((w, i) => (
            <Rise
              key={w.t}
              delay={i * 0.07}
              className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <article className="glass-card h-full rounded-3xl p-7">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary/70">{w.k}</p>
                <h3 className="mt-4 font-display text-2xl leading-snug text-cream">{w.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
              </article>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── whisper wall ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
        <Rise className="text-center">
          <SectionLabel>Afterwards</SectionLabel>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(1.8rem,4.4vw,2.9rem)] leading-tight text-cream">
            What people said once they had{" "}
            <span className="text-gradient-warm italic">finally said it</span>
          </h2>
        </Rise>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {WHISPERS.map((w, i) => (
            <Rise key={w.tag} delay={i * 0.07}>
              <figure className="glass-card h-full rounded-3xl p-7">
                <Eye className="size-4 text-primary/60" />
                <blockquote className="mt-4 font-display text-[1.15rem] italic leading-snug text-cream/90 sm:text-[1.35rem]">
                  “{w.text}”
                </blockquote>
                <figcaption className="mt-5 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                  {w.tag}
                </figcaption>
              </figure>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── promises ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
        <Rise>
          <h2 className="font-display text-[clamp(1.7rem,4vw,2.7rem)] text-cream">
            Four things we <span className="text-gradient-warm italic">will not do</span> to you
          </h2>
        </Rise>
        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Rise key={p.t} delay={i * 0.06}>
              <div className="border-t border-border pt-5">
                <h3 className="font-display text-xl text-primary">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      {/* ── the form ───────────────────────────────────────── */}
      <section id="share" className="relative scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-3xl">
          <Rise className="mb-12 text-center">
            <SectionLabel>Your turn</SectionLabel>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.2rem)] leading-tight text-gradient-warm">
              Whatever it is, write it here
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              No names. No judgment. Just your words. There is no right way to explain a feeling.
            </p>
          </Rise>

          <Rise delay={0.08}>
            <ConfessionWizard onStartChat={setRoom} />
          </Rise>
        </div>
      </section>

      {/* ── faq ────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
        <Rise>
          <SectionLabel>Before you write</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.4rem)] text-cream">
            Questions people <span className="text-gradient-warm italic">usually ask first</span>
          </h2>
        </Rise>
        <Rise delay={0.08} className="mt-10">
          <Accordion type="single" collapsible className="glass-card rounded-3xl px-6">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="text-left font-display text-lg text-cream hover:text-primary hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
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
