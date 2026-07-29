import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { HeartBackground } from "@/components/HeartBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConfessionForm } from "@/components/ConfessionForm";
import { ChatWidget } from "@/components/ChatWidget";
import { Reveal, RevealWords } from "@/components/Reveal";
import { ScrollWord } from "@/components/ScrollFrames";
import { SceneLayer } from "@/components/SceneLayer";
import { DropBox } from "@/components/DropBox";
import { FAQS, WHISPERS, WHY_IT_WORKS } from "@/lib/dilkibaat";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dil Ki Baat, Say It Anonymously and Be Heard Honestly" },
      {
        name: "description",
        content:
          "A quiet, anonymous place to put down what you carry. Write it, be read without judgement, and hear honest perspective from people who have stood where you stand.",
      },
      { property: "og:title", content: "Dil Ki Baat, Say It Anonymously and Be Heard Honestly" },
      {
        property: "og:description",
        content:
          "No names. No judgement. Just your words, received with care, and honest perspective in return.",
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
    w: "Write",
    hi: "The first sentence",
    t: "You write it down",
    d: "No name, no sign up, no explaining yourself. The messy version is the honest one.",
  },
  {
    n: "02",
    w: "Held",
    hi: "Our part of the promise",
    t: "We hold it carefully",
    d: "Your words stay exactly as you wrote them, with every trace of you stripped out first.",
  },
  {
    n: "03",
    w: "Heard",
    hi: "What comes back",
    t: "People answer honestly",
    d: "Real perspective from people who once needed to hear it themselves. No lectures.",
  },
];

const WHY_WORDS = ["Name it", "Witness", "Distance", "Hindsight"];

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl space-y-4 text-pretty text-lg text-muted-foreground sm:ml-auto sm:mr-[6%] sm:text-right"
          >
            <p>
              The 2am overthinking. The thing you cannot explain to anyone. The pressure to have it
              all figured out already.
            </p>
            <p className="text-cream/70">Write it here. A real person reads it.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
            className="mt-12 flex flex-col items-start gap-8 sm:flex-row sm:items-center"
          >
            <motion.a
              href="#share"
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="group relative inline-flex items-center gap-4 font-display text-2xl italic text-cream sm:text-3xl"
            >
              <span className="relative inline-block">
                <span className="relative z-10">Begin where it hurts</span>
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-primary via-rose to-ember transition-transform duration-700 ease-out group-hover:scale-x-100" />
                <span className="animate-shimmer-line absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-ember to-transparent" />
              </span>
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-border text-primary">
                <span className="absolute inset-0 rounded-full bg-ember/15 blur-md transition-all duration-500 group-hover:bg-ember/35" />
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  ↓
                </motion.span>
              </span>
            </motion.a>
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

      {/* ── Frame 3 · three steps, told in single words ─────── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-24 sm:px-10 sm:pb-36">
        <SceneLayer count={220} spread={16} shape="octa" />
        <Reveal from="left">
          <p className="text-[0.62rem] uppercase tracking-[0.42em] text-ember/80">
            Three steps · about four minutes
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,5.5vw,3.6rem)] leading-[1.05] text-cream/90">
            No accounts. No waiting room.{" "}
            <span className="text-gradient-warm italic">Just say it.</span>
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border/40">
          {STEPS.map((s, i) => (
            <ScrollWord
              key={s.t}
              index={i}
              word={s.w}
              eyebrow={s.hi}
              title={s.t}
              body={s.d}
              align={i % 2 ? "right" : "left"}
            />
          ))}
        </div>
      </section>

      {/* ── Frame 4 · why writing it down works ─────────────── */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-24 sm:px-10 sm:pb-36">
        <SceneLayer count={240} spread={17} shape="torus" />
        <Reveal from="none">
          <p className="text-[0.62rem] uppercase tracking-[0.42em] text-ember/80">
            Why this actually helps
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.6rem)] leading-[1.05] text-cream/90">
            Feelings shrink the moment they{" "}
            <span className="text-gradient-warm italic">become sentences</span>
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border/40">
          {WHY_IT_WORKS.map((w, i) => (
            <ScrollWord
              key={w.t}
              index={i}
              word={WHY_WORDS[i] ?? w.k}
              eyebrow={w.k}
              title={w.t}
              body={w.d}
              align={i % 2 ? "right" : "left"}
            />
          ))}
        </div>
      </section>


      {/* ── Frame 5 · the whisper wall ──────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-28 sm:px-10 sm:pb-40">
        <SceneLayer count={200} spread={19} showForm={false} />
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
      <section id="share" className="relative scroll-mt-6 overflow-hidden px-5 pb-32 sm:px-10">
        <SceneLayer count={180} spread={18} showForm={false} />
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
                Take your time. There is no right way to explain a feeling.
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
      <section className="relative mx-auto max-w-3xl overflow-hidden px-6 pb-28 sm:px-10 sm:pb-36">
        <SceneLayer count={160} spread={13} shape="icosa" />
        <Reveal from="none">
          <h2 className="font-display text-[clamp(1.5rem,3.6vw,2.3rem)] text-cream/85">
            Questions people <span className="text-gradient-warm italic">usually ask first</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <DropBox items={FAQS} />
        </Reveal>
      </section>

      <SiteFooter />


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
