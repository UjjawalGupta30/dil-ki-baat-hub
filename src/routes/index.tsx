import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { HeartBackground } from "@/components/HeartBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { ConfessionForm } from "@/components/ConfessionForm";
import { ChatWidget } from "@/components/ChatWidget";
import { Reveal, RevealWords } from "@/components/Reveal";
import { FAQS, WHISPERS, WHY_IT_WORKS } from "@/lib/dilkibaat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat — Say It Anonymously, Be Heard Honestly" },
      {
        name: "description",
        content:
          "A quiet, anonymous place to put down what you carry. Write it, be read without judgement, and hear honest perspective from people who have stood where you stand.",
      },
      { property: "og:title", content: "Dil Ki Baat — Say It Anonymously, Be Heard Honestly" },
      {
        property: "og:description",
        content:
          "No names. No judgement. Just your words, received with care — and honest perspective in return.",
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
    hi: "The first sentence",
    t: "You write it down",
    d: "In whatever language your feelings arrive in. No name, no sign-up, no explanation owed to anyone. Just the truth as it is right now.",
  },
  {
    n: "02",
    hi: "Our part of the promise",
    t: "We hold it carefully",
    d: "Your words are kept exactly as you wrote them, with every trace of you removed before another human ever reads a line.",
  },
  {
    n: "03",
    hi: "What comes back",
    t: "People answer honestly",
    d: "Perspective, lived experience, and the occasional uncomfortable truth — from people who once needed to hear it themselves.",
  },
];

const PROMISES = [
  { t: "No name is ever asked", d: "There is nothing to sign up for, and nothing to take back." },
  { t: "No advice you didn't ask for", d: "Say you only want to be heard, and that is what happens." },
  { t: "Conversations that disappear", d: "Choose an hour, a day, or never. Your call, always." },
  { t: "Nothing is shared without a yes", d: "Your story stays here unless you decide otherwise." },
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
              text="Say the thing"
              className="block"
              wordClassName="text-gradient-warm"
              onMount
            />
            <RevealWords
              text="you never say."
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
            Everyone is carrying something they have never put into words — a love, a fear, a
            decision, a quiet kind of loneliness. This is a place to set it down and be read by
            people who will not flinch.
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
                Begin where it hurts
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-gradient-to-r from-primary via-rose to-ember transition-transform duration-700 group-hover:scale-x-[1.06]" />
              </span>
              <span className="grid size-9 place-items-center rounded-full border border-border text-primary transition-transform duration-500 group-hover:translate-y-1">
                ↓
              </span>
            </a>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm tracking-wide text-muted-foreground">
              <span>Anonymous</span>
              <span className="text-primary/50">·</span>
              <span>Unhurried</span>
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
            You have said “I'm fine” so many times.{" "}
            <span className="text-gradient-warm">When did anyone last ask twice?</span>
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-center leading-relaxed text-muted-foreground">
            Silence is a habit, not a personality. It only takes one honest paragraph to break it,
            and nobody here needs to know your name to take you seriously.
          </p>
        </Reveal>
        <Reveal delay={0.35} className="mx-auto mt-10 max-w-xs">
          <div className="hairline" />
        </Reveal>
      </section>

      {/* ── Frame 3 · the three steps, broken grid ──────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 sm:px-10 sm:pb-44">
        <Reveal from="left">
          <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] text-cream/90">
            How it <span className="text-gradient-warm italic">works</span>
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Three steps, no accounts, no waiting rooms. Most people finish writing in under four
            minutes and feel lighter before they even press send.
          </p>
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

      {/* ── Frame 4 · why writing it down works ─────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 sm:px-10 sm:pb-40">
        <Reveal from="none">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-ember/80">
            Why this actually helps
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(1.8rem,4.5vw,3rem)] leading-tight text-cream/90">
            Feelings shrink the moment they{" "}
            <span className="text-gradient-warm italic">become sentences</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-x-16 gap-y-14 sm:grid-cols-2">
          {WHY_IT_WORKS.map((w, i) => (
            <Reveal key={w.t} from={i % 2 ? "right" : "left"} delay={(i % 2) * 0.1}>
              <div className={i % 2 ? "sm:mt-16" : ""}>
                <p className="font-display text-sm italic tracking-wide text-rose">{w.k}</p>
                <h3 className="mt-2 font-display text-2xl leading-snug text-cream/90">{w.t}</h3>
                <div className="my-4 h-px w-16 bg-gradient-to-r from-primary/70 to-transparent" />
                <p className="max-w-md leading-relaxed text-muted-foreground">{w.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Frame 5 · the whisper wall ──────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-28 sm:px-10 sm:pb-40">
        <div className="mx-auto max-w-5xl">
          <Reveal from="none">
            <h2 className="text-center font-display text-[clamp(1.6rem,4vw,2.6rem)] text-cream/85">
              What people said <span className="text-gradient-warm italic">afterwards</span>
            </h2>
          </Reveal>

          <div className="mt-16 space-y-16">
            {WHISPERS.map((w, i) => (
              <Reveal key={w.tag} from={i % 2 ? "right" : "left"} delay={0.05 * i}>
                <figure
                  className={`max-w-2xl ${i % 2 ? "ml-auto text-right" : "mr-auto text-left"}`}
                >
                  <blockquote className="font-display text-[clamp(1.2rem,2.6vw,1.85rem)] italic leading-snug text-cream/85">
                    “{w.text}”
                  </blockquote>
                  <figcaption className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {w.tag}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Frame 6 · the promises ──────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 sm:px-10 sm:pb-40">
        <Reveal from="left">
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.6rem)] text-cream/90">
            Four things we <span className="text-gradient-warm italic">will not do</span> to you
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Reveal key={p.t} from="up" delay={i * 0.08}>
              <div className="relative pl-6">
                <span className="absolute left-0 top-2 size-1.5 rounded-full bg-ember" />
                <h3 className="font-display text-xl italic text-primary">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Frame 7 · the letter ────────────────────────────── */}
      <section id="share" className="relative scroll-mt-6 px-5 pb-32 sm:px-10">
        <div className="relative mx-auto max-w-3xl">
          <Reveal from="none">
            <div className="mb-12 text-center">
              <h2 className="font-display text-[clamp(2rem,5.5vw,3.4rem)] leading-tight text-gradient-warm">
                Whatever it is, write it here
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-cream">
                  No names. No judgement. Just your words.
                </strong>{" "}
                Take your time — there is no right way to explain a feeling, and nobody is waiting
                on the other side with a stopwatch.
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

      {/* ── Frame 8 · questions people ask ──────────────────── */}
      <section className="relative mx-auto max-w-3xl px-6 pb-28 sm:px-10 sm:pb-36">
        <Reveal from="none">
          <h2 className="font-display text-[clamp(1.5rem,3.6vw,2.3rem)] text-cream/85">
            Questions people <span className="text-gradient-warm italic">usually ask first</span>
          </h2>
        </Reveal>
        <dl className="mt-12 space-y-10">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} from="up" delay={i * 0.06}>
              <dt className="font-display text-xl italic text-primary">{f.q}</dt>
              <dd className="mt-3 leading-relaxed text-muted-foreground">{f.a}</dd>
              <div className="hairline mt-8" />
            </Reveal>
          ))}
        </dl>
      </section>

      <footer className="relative px-6 pb-16 text-center text-sm text-muted-foreground">
        <div className="hairline mx-auto mb-10 max-w-4xl" />
        <p className="font-display text-lg italic text-cream/70">
          Your story, without your name attached to it.
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
