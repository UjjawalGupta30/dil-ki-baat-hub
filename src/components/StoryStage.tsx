import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { ConfessionWizard } from "@/components/ConfessionWizard";
import { Magnetic } from "@/components/Magnetic";
import { clearFocus, scrollControls, scrollState, setFocus } from "@/lib/scroll-state";
import { ACTS, ECHOES, actAlpha, actLocal } from "@/lib/story";
import { playChime, setWarmth } from "@/lib/audio-engine";

type Room = { roomId: string; alias: string; ttl: string };

const ACT_LIST = [
  { key: "monolith", label: "The monolith", range: ACTS.monolith },
  { key: "shatter", label: "The shatter", range: ACTS.shatter },
  { key: "echoes", label: "Echoes of the unspoken", range: ACTS.echoes },
  { key: "assembly", label: "The sacred re-assembly", range: ACTS.assembly },
  { key: "sanctuary", label: "The sanctuary", range: ACTS.sanctuary },
] as const;

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.56rem] uppercase tracking-[0.46em] text-primary/70 sm:text-[0.62rem]">
      {children}
    </p>
  );
}

/**
 * The pinned viewport. Every act lives in the same fixed frame and is faded,
 * blurred and flown through Z-space purely from the normalised scroll
 * progress, so the page reads as one continuous camera move rather than a
 * stack of sections.
 */
export function StoryStage({
  onStartChat,
  room,
  onReopenChat,
}: {
  onStartChat: (room: Room) => void;
  room: Room | null;
  onReopenChat: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const root = stage.current;
    if (!root) return;

    const acts = Array.from(root.querySelectorAll<HTMLElement>("[data-act]"));
    const echoes = Array.from(root.querySelectorAll<HTMLElement>("[data-echo]"));
    const rails = Array.from(root.querySelectorAll<HTMLElement>("[data-rail]"));
    let warm = false;

    const tick = () => {
      const p = scrollState.progress;

      acts.forEach((el) => {
        const range = (el.dataset.range ?? "0,1").split(",").map(Number) as [number, number];
        const alpha = actAlpha(p, range);
        const local = actLocal(p, range);
        const blur = (1 - alpha) * 14;
        gsap.set(el, {
          autoAlpha: alpha,
          z: -local * 620,
          // a zero-length blur still forces a rasterised layer, which softens
          // type inside the perspective container, so drop it entirely
          filter: blur > 0.35 ? `blur(${blur}px)` : "none",
        });
        el.style.pointerEvents = alpha > 0.55 ? "auto" : "none";
      });

      const echoLocal = actLocal(p, ACTS.echoes);
      echoes.forEach((el) => {
        const speed = Number(el.dataset.speed ?? 300);
        const depth = Number(el.dataset.depth ?? 0);
        gsap.set(el, {
          y: (0.5 - echoLocal) * speed,
          z: -depth * 220,
          scale: 1 - depth * 0.08,
        });
      });

      rails.forEach((el) => {
        const i = Number(el.dataset.rail);
        const on = p >= ACT_LIST[i].range[0] - 0.02 && p < ACT_LIST[i].range[1];
        el.style.opacity = on ? "1" : "0.28";
        el.style.transform = `scaleX(${on ? 1 : 0.4})`;
      });

      const shouldWarm = p > 0.8 || scrollState.connected;
      if (shouldWarm !== warm) {
        warm = shouldWarm;
        setWarmth(shouldWarm);
      }
    };

    tick();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      setWarmth(false);
    };
  }, [reduced]);

  const frame = reduced
    ? "relative flex min-h-[60svh] flex-col items-center justify-center px-5 py-24 sm:px-10"
    : "absolute inset-0 flex flex-col items-center justify-center px-5 py-24 sm:px-10";

  return (
    <div
      ref={stage}
      id="viewport"
      className={
        reduced
          ? "relative z-20 w-full"
          : "pointer-events-none fixed inset-0 z-20 w-full overflow-hidden"
      }
      style={reduced ? undefined : { perspective: "1200px" }}
    >
      {/* ─────────── ACT 1 · THE MONOLITH ─────────── */}
      <section
        data-act
        data-range={`${ACTS.monolith[0]},${ACTS.monolith[1]}`}
        className={`${frame} text-center`}
      >
        <Caption>Act one · the monolith</Caption>
        <h1 className="mt-8 max-w-4xl text-balance font-display text-[clamp(2.4rem,8.4vw,6rem)] leading-[1.02] text-cream drop-shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
          Say the thing you never say.
        </h1>
        <p className="mt-8 max-w-xl text-pretty leading-relaxed text-cream/65 sm:text-lg">
          Everything you have been carrying quietly has somewhere to go now. No name, no
          account, no one waiting to judge the shape of it.
        </p>
        <div className="mt-11">
          <Magnetic strength={0.34}>
            <button
              type="button"
              onClick={() => scrollControls.to(0.66)}
              className="halo-pill inline-flex h-14 items-center rounded-full px-10 font-display text-lg text-cream"
            >
              Begin where it hurts
            </button>
          </Magnetic>
        </div>
        <p className="mt-14 flex items-center gap-3 text-[0.58rem] uppercase tracking-[0.4em] text-primary/60">
          Scroll to travel <ArrowDown className="size-4 animate-bounce" />
        </p>
      </section>

      {/* ─────────── ACT 2 · THE SHATTER ─────────── */}
      <section
        data-act
        data-range={`${ACTS.shatter[0]},${ACTS.shatter[1]}`}
        className={`${frame} text-center`}
      >
        <Caption>Act two · the shatter</Caption>
        <h2 className="mt-8 max-w-3xl text-balance font-display text-[clamp(1.9rem,6vw,4.2rem)] leading-[1.06] text-cream">
          Unspoken thoughts were never meant to{" "}
          <span className="text-gradient-warm italic">stay locked inside</span>
        </h2>
        <p className="mt-8 max-w-lg leading-relaxed text-cream/60">
          What looks solid from the outside is usually held together by silence. Let it come
          apart here, where nothing breaks that cannot be put back.
        </p>
      </section>

      {/* ─────────── ACT 3 · ECHOES OF THE UNSPOKEN ─────────── */}
      <section
        data-act
        data-range={`${ACTS.echoes[0]},${ACTS.echoes[1]}`}
        className={reduced ? `${frame}` : "absolute inset-0 overflow-hidden px-5 sm:px-10"}
      >
        <div className={reduced ? "w-full" : "relative mx-auto h-full w-full max-w-6xl"}>
          <div className={reduced ? "mb-12 text-center" : "absolute inset-x-0 top-24 text-center"}>
            <Caption>Act three · echoes of the unspoken</Caption>
          </div>

          <div
            className={
              reduced
                ? "flex flex-col gap-10"
                : "flex h-full flex-col justify-center gap-6 sm:gap-9"
            }
            style={reduced ? undefined : { transformStyle: "preserve-3d" }}
          >
            {ECHOES.map((e) => (
              <p
                key={e.text}
                data-echo
                data-speed={e.speed}
                data-depth={e.depth}
                onPointerEnter={(ev) => {
                  setFocus(ev.clientX, ev.clientY);
                  playChime(e.chime);
                }}
                onPointerMove={(ev) => setFocus(ev.clientX, ev.clientY)}
                onPointerLeave={clearFocus}
                style={{ marginInlineStart: reduced ? 0 : `${50 + e.lane * 44}%` }}
                className={`echo-line max-w-[min(30rem,86vw)] -translate-x-1/2 cursor-default font-display italic leading-[1.14] ${
                  e.depth === 0
                    ? "text-[clamp(1.05rem,2.7vw,1.9rem)] text-cream/85"
                    : e.depth === 1
                      ? "text-[clamp(0.98rem,2.4vw,1.6rem)] text-cream/55 blur-[1.5px]"
                      : "text-[clamp(0.92rem,2.1vw,1.4rem)] text-primary/40 blur-[3px]"
                }`}
              >
                “{e.text}”
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ACT 4 · THE SACRED RE-ASSEMBLY ─────────── */}
      <section
        data-act
        data-range={`${ACTS.assembly[0]},${ACTS.assembly[1]}`}
        className={reduced ? frame : "absolute inset-0 flex items-center justify-center px-3 sm:px-8"}
      >
        <div
          data-lenis-prevent
          className="max-h-[100svh] w-full max-w-3xl overflow-y-auto overscroll-contain px-2 py-20 sm:py-10"
        >
          <div className="mb-6 text-center">
            <Caption>Act four · the sacred re-assembly</Caption>
            <h2 className="mt-4 font-display text-[clamp(1.7rem,4.2vw,2.7rem)] leading-tight text-gradient-warm">
              Whatever it is, let it out here
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/60">
              No names. No judgment. Just your words, held gently. There is no right way to
              explain a feeling.
            </p>
          </div>

          <ConfessionWizard onStartChat={onStartChat} />
        </div>
      </section>

      {/* ─────────── ACT 5 · THE SANCTUARY ─────────── */}
      <section
        data-act
        data-range={`${ACTS.sanctuary[0]},${ACTS.sanctuary[1]}`}
        className={`${frame} text-center`}
      >
        <Caption>Act five · the sanctuary</Caption>
        <h2 className="mt-8 max-w-3xl text-balance font-display text-[clamp(1.9rem,5.6vw,3.8rem)] leading-[1.08] text-cream">
          You said it. Now you are{" "}
          <span className="text-gradient-warm italic">not alone with it</span>
        </h2>
        <p className="mt-7 max-w-xl leading-relaxed text-cream/60">
          A room opens for as long as you want it to, and closes the moment you decide. Nothing
          is stored on your device, nothing carries your name.
        </p>

        {room && (
          <button
            type="button"
            onClick={onReopenChat}
            className="halo-pill mt-10 inline-flex h-13 items-center gap-3 rounded-full px-8 py-4 font-display text-lg text-cream"
          >
            <MessageCircleHeart className="size-5" /> Return to {room.alias}
          </button>
        )}

        <div className="mt-14 flex flex-col items-center gap-3 text-xs leading-relaxed text-cream/45">
          <p className="flex items-center gap-2 text-primary/70">
            <ShieldCheck className="size-4" /> If it is heavier than a conversation
          </p>
          <p>
            Tele-MANAS 14416 · 1800 891 4416 &nbsp;|&nbsp; Vandrevala Foundation +91 9999 666 555
          </p>
          <p className="max-w-md text-cream/35">
            Dil Ki Baat is an anonymous peer-support social experiment by aapkamentor.ai, not a
            substitute for professional clinical therapy.
          </p>
          <p className="mt-4 text-[0.58rem] uppercase tracking-[0.36em] text-primary/50">
            @dil.ki.baat.sabkesath
          </p>
        </div>
      </section>

      {/* act rail */}
      {!reduced && (
        <nav
          aria-label="Story progress"
          className="pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 flex-col gap-5 lg:flex"
        >
          {ACT_LIST.map((a, i) => (
            <button
              key={a.key}
              type="button"
              onClick={() => scrollControls.to(a.range[0] + 0.05)}
              className="group flex items-center gap-3 text-left"
            >
              <span
                data-rail={i}
                className="block h-px w-8 origin-left bg-primary transition-all duration-500"
              />
              <span className="text-[0.5rem] uppercase tracking-[0.3em] text-primary/0 transition-colors duration-500 group-hover:text-primary/70">
                {a.label}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
