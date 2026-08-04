import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayImage from "@/assets/perfect-day.jpg";
import { seeded } from "@/lib/unspoken";
import {
  enableAudio,
  isAudioEnabled,
  playCrack,
  setCityBed,
  setDaylight,
  startHold,
  stopHold,
} from "@/lib/audio-engine";

const HOLD_MS = 1800;

/** Jagged fracture lines radiating from the centre of the screen. */
function useCracks() {
  return useMemo(() => {
    const rnd = seeded(31337);
    const lines: { d: string; len: number; w: number }[] = [];
    const branch = (
      x: number,
      y: number,
      angle: number,
      length: number,
      depth: number,
      width: number,
    ) => {
      let cx = x;
      let cy = y;
      let a = angle;
      let d = `M ${cx.toFixed(1)} ${cy.toFixed(1)}`;
      const steps = 4 + Math.floor(rnd() * 3);
      const seg = length / steps;
      for (let i = 0; i < steps; i++) {
        a += (rnd() - 0.5) * 0.62;
        cx += Math.cos(a) * seg;
        cy += Math.sin(a) * seg;
        d += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`;
      }
      lines.push({ d, len: length * 1.35, w: width });
      if (depth > 0) {
        const kids = rnd() > 0.45 ? 2 : 1;
        for (let k = 0; k < kids; k++) {
          branch(
            cx,
            cy,
            a + (rnd() - 0.5) * 1.5,
            length * (0.42 + rnd() * 0.3),
            depth - 1,
            width * 0.62,
          );
        }
      }
    };
    const spokes = 11;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + rnd() * 0.4;
      branch(50, 50, a, 22 + rnd() * 16, 2, 0.42);
    }
    return lines;
  }, []);
}

/** Slow drifting motes of dust in the sunlight. */
function Motes() {
  const motes = useMemo(() => {
    const rnd = seeded(8081);
    return Array.from({ length: 34 }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      s: 1 + rnd() * 3.4,
      d: 9 + rnd() * 14,
      delay: -rnd() * 18,
      o: 0.14 + rnd() * 0.4,
    }));
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white blur-[1px]"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            opacity: m.o,
            animation: `mote-drift ${m.d}s ease-in-out ${m.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The opening act: a perfect, over-exposed sunny day. The visitor is invited to
 * press and hold the light at the centre. At full charge the frame freezes,
 * fractures, and drops them into the city after dark.
 */
export function DayGate({ onEnter }: { onEnter: () => void }) {
  const cracks = useCracks();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "holding" | "frozen" | "gone">("idle");
  const raf = useRef(0);
  const start = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // the gate owns the viewport until it breaks
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const shatter = useCallback(() => {
    setPhase("frozen");
    setProgress(1);
    stopHold(true);
    playCrack();
    window.setTimeout(() => setCityBed(), 700);
    window.setTimeout(() => {
      setPhase("gone");
      onEnter();
    }, 1500);
  }, [onEnter]);

  const beginHold = useCallback(async () => {
    if (phaseRef.current !== "idle") return;
    if (!isAudioEnabled()) {
      await enableAudio();
      setDaylight();
    }
    setPhase("holding");
    start.current = performance.now();
    startHold();
    const step = () => {
      const t = Math.min(1, (performance.now() - start.current) / HOLD_MS);
      setProgress(t);
      if (t >= 1) {
        shatter();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [shatter]);

  const cancelHold = useCallback(() => {
    if (phaseRef.current !== "holding") return;
    cancelAnimationFrame(raf.current);
    stopHold();
    setPhase("idle");
    // ease the ring back down instead of snapping
    const from = progress;
    const t0 = performance.now();
    const back = () => {
      const k = Math.min(1, (performance.now() - t0) / 420);
      setProgress(from * (1 - k));
      if (k < 1) requestAnimationFrame(back);
    };
    requestAnimationFrame(back);
  }, [progress]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const R = 62;
  const C = 2 * Math.PI * R;
  const frozen = phase === "frozen";

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[70] select-none overflow-hidden bg-[#f6ecd8]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(22px)" }}
          transition={{ duration: 0.85, ease: [0.7, 0, 0.35, 1] }}
        >
          {/* the perfect day itself */}
          <motion.div
            className="absolute inset-0"
            animate={
              frozen
                ? { scale: 1.035, filter: "saturate(0.25) brightness(0.72) contrast(1.15)" }
                : {
                    scale: 1 + progress * 0.05,
                    filter: `saturate(${1 - progress * 0.35}) brightness(${1 + progress * 0.18})`,
                  }
            }
            transition={
              frozen ? { duration: 0.5, ease: [0.2, 0, 0, 1] } : { duration: 0.2, ease: "linear" }
            }
          >
            <img
              src={dayImage}
              alt="Two hands reaching for each other in bright afternoon sunlight"
              width={1920}
              height={1280}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-[radial-gradient(46%_46%_at_50%_44%,rgb(255_246_214/55%)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(255_250_235/28%)_0%,transparent_38%,rgb(58_16_10/34%)_100%)]" />
          </motion.div>

          <Motes />

          {/* light bloom that swells with the hold */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-200"
            style={{
              opacity: frozen ? 0 : progress * 0.85,
              background:
                "radial-gradient(30% 30% at 50% 50%, rgb(255 255 255 / 90%) 0%, rgb(255 214 140 / 35%) 45%, transparent 72%)",
            }}
          />

          {/* white flash at the instant of impact */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: frozen ? [0.95, 0] : 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />

          {/* the fracture */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
          >
            {cracks.map((c, i) => (
              <g key={i}>
                <path
                  d={c.d}
                  fill="none"
                  stroke="rgb(10 6 4 / 55%)"
                  strokeWidth={c.w * 2.1}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: c.len,
                    strokeDashoffset: frozen ? 0 : c.len,
                    transition: `stroke-dashoffset ${340 + i * 26}ms cubic-bezier(.16,1,.3,1) ${i * 12}ms`,
                  }}
                />
                <path
                  d={c.d}
                  fill="none"
                  stroke="rgb(255 250 236 / 92%)"
                  strokeWidth={c.w}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: c.len,
                    strokeDashoffset: frozen ? 0 : c.len,
                    transition: `stroke-dashoffset ${300 + i * 26}ms cubic-bezier(.16,1,.3,1) ${i * 12}ms`,
                  }}
                />
              </g>
            ))}
          </svg>

          {/* copy + the hold target */}
          <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-10 sm:py-14">
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: frozen ? 0 : 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.25 }}
              className="text-center"
            >
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.42em] text-[#5a2a14]">
                Dil Ki Baat · Sabke Sath
              </p>
              <p className="mt-1.5 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-[#5a2a14]/60">
                a project by aapkamentor.ai
              </p>
            </motion.div>

            <div className="flex w-full max-w-2xl flex-col items-center text-center">
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: "blur(16px)" }}
                animate={{ opacity: frozen ? 0 : 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.3, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-3xl leading-[1.06] tracking-tight text-[#3a1409] drop-shadow-[0_2px_18px_rgb(255_244_216/70%)] sm:text-5xl md:text-[3.6rem]"
              >
                Everybody looks
                <span className="block italic">absolutely fine</span>
                <span className="block">from the outside.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: frozen ? 0 : 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                className="mt-5 max-w-md font-sans text-sm leading-relaxed text-[#4a2013]/85 sm:text-[0.95rem]"
              >
                So does this afternoon. Warm light, someone reaching back, nothing wrong
                anywhere. Hold the light for a moment and see how long that lasts.
              </motion.p>

              {/* press and hold */}
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: frozen ? 0 : 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  void beginHold();
                }}
                onPointerUp={cancelHold}
                onPointerCancel={cancelHold}
                onPointerLeave={cancelHold}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") void beginHold();
                }}
                onKeyUp={cancelHold}
                aria-label="Press and hold to enter"
                className="group relative mt-10 grid size-[9.5rem] cursor-pointer place-items-center rounded-full outline-none"
                style={{ touchAction: "none" }}
              >
                <span
                  className="absolute inset-0 rounded-full bg-white/40 blur-2xl transition-transform duration-300"
                  style={{ transform: `scale(${0.7 + progress * 0.55})` }}
                />
                <svg viewBox="0 0 150 150" className="absolute inset-0 size-full -rotate-90">
                  <circle
                    cx="75"
                    cy="75"
                    r={R}
                    fill="none"
                    stroke="rgb(255 252 244 / 50%)"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r={R}
                    fill="none"
                    stroke="rgb(255 255 255 / 95%)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - progress)}
                  />
                </svg>
                <span
                  className="absolute rounded-full border border-white/70"
                  style={{
                    inset: "1.9rem",
                    transform: `scale(${1 + progress * 0.12})`,
                    animation: phase === "idle" ? "gate-breathe 3.6s ease-in-out infinite" : "none",
                  }}
                />
                <span className="relative font-mono text-[0.55rem] uppercase leading-[1.9] tracking-[0.34em] text-[#3a1409]">
                  {phase === "holding" ? "keep holding" : "press"}
                  <br />
                  <span className="tracking-[0.4em]">
                    {phase === "holding" ? `${Math.round(progress * 100)}%` : "& hold"}
                  </span>
                </span>
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: frozen ? 0 : 0.75 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="font-mono text-[0.52rem] uppercase tracking-[0.34em] text-[#4a2013]"
            >
              Sound on · headphones recommended
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
