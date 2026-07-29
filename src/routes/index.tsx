import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { HeartBackground } from "@/components/HeartBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { ConfessionForm } from "@/components/ConfessionForm";
import { ChatWidget } from "@/components/ChatWidget";
import { Reveal, RevealWords } from "@/components/Reveal";

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

const STEPS = [
  {
    n: "01",
    hi: "Pehla kadam",
    t: "You speak",
    d: "Write whatever sits heavy — in Hindi, English or Hinglish. No name, no identity, just the truth.",
  },
  {
    n: "02",
    hi: "Humari zimmedari",
    t: "We listen & post",
    d: "We carry your words to the page exactly as they are, with every trace of you removed.",
  },
  {
    n: "03",
    hi: "Saath milkar",
    t: "People respond",
    d: "Perspectives, honest advice, and lessons from people who have stood exactly where you stand.",
  },
];

function Index() {
  const [room, setRoom] = useState<Room | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const heroFade = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const heroLift = useTransform(scrollYProgress, [0, 0.2], [0, -90]);

  return (
    <div className="grain relative min-h-screen">
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-primary via-rose to-ember"
        style={{ scaleX: progress }}
      />

      {/* ── Frame 1 · the heart ─────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <HeartBackground />
        <SiteHeader />

        <motion.div
          style={{ opacity: heroFade, y: heroLift }}
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24 pt-10 sm:px-10"
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="mb-6 text-[0.68rem] uppercase tracking-[0.4em] text-muted-foreground"
          >
            A brand by aapkamentor.ai
          </motion.p>

          <h1 className="max-w-4xl font-display text-[clamp(2.6rem,8.5vw,6rem)] font-normal leading-[1.02]">
            <RevealWords
              text="Dil se sunenge,"
              className="block"
              wordClassName="text-gradient-warm"
              onMount
            />
            <RevealWords
              text="samajh se bolenge."
              className="block italic text-cream/90"
              delay={0.22}
              onMount
            />
          </h1>


          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-lg text-pretty text-lg text-muted-foreground sm:ml-auto sm:mr-[6%] sm:text-right"
          >
            We all carry something — love, friendship, pain, confusion. But not everyone has someone
            to tell it to. That is why this page exists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
            className="mt-12 flex flex-col items-start gap-8 sm:flex-row sm:items-center"
          >
            <a
              href="#share"
              className="group relative inline-flex items-center gap-3 font-display text-xl italic text-cream"
            >
              <span className="relative">
                Share your Dil Ki Baat
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-gradient-to-r from-primary via-rose to-ember transition-transform duration-700 group-hover:scale-x-[1.06]" />
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-border text-primary transition-transform duration-500 group-hover:translate-y-1">
                ↓
              </span>
            </a>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm tracking-wide text-muted-foreground">
              <span>Anonymous</span>
              <span className="text-primary/50">·</span>
              <span>Supportive</span>
              <span className="text-primary/50">·</span>
              <span>Judgement-free</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Frame 2 · a held breath ─────────────────────────── */}
      <section className="relative mx-auto max-w-5xl px-6 py-28 sm:px-10 sm:py-40">
        <Reveal from="none">
          <p className="mx-auto max-w-3xl text-balance text-center font-display text-[clamp(1.5rem,4vw,2.6rem)] italic leading-snug text-cream/85">
            “Sab theek hai” kehne se pehle,{" "}
            <span className="text-gradient-warm">kisi ne poocha tha kya?</span>
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mx-auto mt-10 max-w-xs">
          <div className="hairline" />
        </Reveal>
      </section>

      {/* ── Frame 3 · the three steps, broken grid ──────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 sm:px-10 sm:pb-44">
        <Reveal from="left">
          <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] text-cream/90">
            How it <span className="text-gradient-warm italic">works</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-16 sm:gap-20 md:grid-cols-12">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.t}
              from={i === 1 ? "right" : "up"}
              delay={i * 0.12}
              className={
                i === 0
                  ? "md:col-span-5"
                  : i === 1
                    ? "md:col-span-5 md:col-start-8 md:mt-24"
                    : "md:col-span-6 md:col-start-3 md:mt-10"
              }
            >
              <article className="relative">
                <span className="pointer-events-none absolute -left-4 -top-20 select-none font-display text-[7rem] leading-none text-plum/30 sm:-top-28 sm:text-[10rem]">
                  {s.n}
                </span>
                <div className="relative">
                  <p className="text-[0.65rem] uppercase tracking-[0.32em] text-ember/80">{s.hi}</p>
                  <h3 className="mt-3 font-display text-3xl italic text-primary">{s.t}</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Frame 4 · the letter ────────────────────────────── */}
      <section id="share" className="relative scroll-mt-6 px-5 pb-32 sm:px-10">
        <div className="relative mx-auto max-w-3xl">
          <Reveal from="none">
            <div className="mb-12 text-center">
              <h2 className="font-display text-[clamp(2rem,5.5vw,3.4rem)] leading-tight text-gradient-warm">
                Likh dijiye, jo dil mein hai
              </h2>
              <p className="mt-4 text-muted-foreground">
                <strong className="font-semibold text-cream">
                  No names. No judgment. Just your thoughts.
                </strong>{" "}
                Real people will share their views, experiences & honest takes.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 -rotate-[1.4deg] rounded-[1.75rem] bg-rose/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rotate-[0.9deg] rounded-[1.75rem] bg-primary/10"
              />
              <div className="paper relative rounded-[1.5rem] px-6 py-10 sm:px-12 sm:py-14">
                <ConfessionForm onStartChat={setRoom} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="relative px-6 pb-16 text-center text-sm text-muted-foreground">
        <div className="hairline mx-auto mb-10 max-w-4xl" />
        <p className="font-display text-lg italic text-cream/70">
          Aapki baat, aapki pehchaan ke bina.
        </p>
        <p className="mt-3">Dil Ki Baat — a community initiative by aapkamentor.ai</p>
        <p className="mt-2">
          <Link
            to="/terms"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          >
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
