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

const HOLD_MS = 1600;

type Shard = {
  clip: string;
  /** centre of the shard in % of the viewport */
  cx: number;
  cy: number;
  /** flight vector */
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  rz: number;
  delay: number;
  dur: number;
};

/**
 * Splits the viewport into a jittered triangular mesh. Neighbouring triangles
 * share vertices, so the pieces are seamless before the break and read as real
 * glass fragments once they fly apart.
 */
function useShards(): Shard[] {
  return useMemo(() => {
    const rnd = seeded(90210);
    const cols = 8;
    const rows = 6;
    const pt: { x: number; y: number }[][] = [];
    for (let r = 0; r <= rows; r++) {
      pt[r] = [];
      for (let c = 0; c <= cols; c++) {
        const edge = r === 0 || c === 0 || r === rows || c === cols;
        const jx = edge ? 0 : (rnd() - 0.5) * (100 / cols) * 0.72;
        const jy = edge ? 0 : (rnd() - 0.5) * (100 / rows) * 0.72;
        pt[r][c] = { x: (c / cols) * 100 + jx, y: (r / rows) * 100 + jy };
      }
    }
    const out: Shard[] = [];
    const tri = (a: { x: number; y: number }, b: typeof a, c: typeof a) => {
      const cx = (a.x + b.x + c.x) / 3;
      const cy = (a.y + b.y + c.y) / 3;
      const dx = cx - 50;
      const dy = cy - 50;
      const dist = Math.hypot(dx, dy) / 70; // 0 at impact point, ~1 at corners
      const push = 0.55 + rnd() * 1.1;
      out.push({
        clip: `polygon(${a.x.toFixed(2)}% ${a.y.toFixed(2)}%, ${b.x.toFixed(2)}% ${b.y.toFixed(2)}%, ${c.x.toFixed(2)}% ${c.y.toFixed(2)}%)`,
        cx,
        cy,
        tx: dx * push * 1.5,
        ty: dy * push * 1.5 + 6 + rnd() * 26,
        tz: 190 + (1 - dist) * 620 + rnd() * 220,
        rx: (rnd() - 0.5) * 78,
        ry: (rnd() - 0.5) * 78,
        rz: (rnd() - 0.5) * 90,
        delay: dist * 190 + rnd() * 70,
        dur: 900 + rnd() * 620,
      });
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tl = pt[r][c];
        const tr = pt[r][c + 1];
        const bl = pt[r + 1][c];
        const br = pt[r + 1][c + 1];
        if ((r + c) % 2 === 0) {
          tri(tl, tr, br);
          tri(tl, br, bl);
        } else {
          tri(tl, tr, bl);
          tri(tr, br, bl);
        }
      }
    }
    return out;
  }, []);
}

/** Fracture lines that snap across the glass a beat before it lets go. */
function useCracks() {
  return useMemo(() => {
    const rnd = seeded(31337);
    const lines: { d: string; len: number; w: number }[] = [];
    const branch = (x: number, y: number, angle: number, length: number, depth: number, width: number) => {
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
      lines.push({ d, len: length * 1.4, w: width });
      if (depth > 0) {
        const kids = rnd() > 0.45 ? 2 : 1;
        for (let k = 0; k < kids; k++) {
          branch(cx, cy, a + (rnd() - 0.5) * 1.5, length * (0.42 + rnd() * 0.3), depth - 1, width * 0.6);
        }
      }
    };
    const spokes = 13;
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2 + rnd() * 0.4;
      branch(50, 50, a, 24 + rnd() * 18, 2, 0.4);
    }
    return lines;
  }, []);
}

/** Slow drifting motes of dust in the sunlight. */
function Motes() {
  const motes = useMemo(() => {
    const rnd = seeded(8081);
    return Array.from({ length: 30 }, () => ({
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
 * Act 0. A perfect, over-exposed afternoon. Hold the light and the whole frame
 * goes to glass: it whitens, fractures, then breaks into ninety-six shards that
 * fly past the camera and leave the night city behind them.
 */
export function DayGate({ onEnter }: { onEnter: () => void }) {
  const shards = useShards();
  const cracks = useCracks();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "holding" | "cracked" | "broken" | "gone">("idle");
  const raf = useRef(0);
  const start = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

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
    setPhase("cracked");
    setProgress(1);
    stopHold(true);
    playCrack();
    // cracks race across the glass, then it lets go
    window.setTimeout(() => setPhase("broken"), 260);
    window.setTimeout(() => setCityBed(), 620);
    window.setTimeout(() => {
      setPhase("gone");
      onEnter();
    }, 2150);
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

  const R = 58;
  const C = 2 * Math.PI * R;
  const breaking = phase === "cracked" || phase === "broken";
  const broken = phase === "broken";

  /** the frame itself, reused as the fill of every shard */
  const plate = (
    <>
      <img
        src={dayImage}
        alt="Two hands reaching for each other in bright afternoon sunlight"
        width={1920}
        height={1280}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(46%_46%_at_50%_44%,rgb(255_246_214/55%)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(255_250_235/30%)_0%,transparent_40%,rgb(58_16_10/36%)_100%)]" />
    </>
  );

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[70] select-none overflow-hidden"
          style={{ perspective: "900px", perspectiveOrigin: "50% 48%" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* intact plate: fades the instant the glass gives way */}
          <motion.div
            className="absolute inset-0 bg-[#f6ecd8]"
            animate={{
              opacity: broken ? 0 : 1,
              scale: breaking ? 1.02 : 1 + progress * 0.045,
              filter: breaking
                ? "saturate(0.3) brightness(1.25) contrast(1.1)"
                : `saturate(${1 - progress * 0.4}) brightness(${1 + progress * 0.2})`,
            }}
            transition={{ duration: broken ? 0.001 : 0.22, ease: "linear" }}
          >
            {plate}
            <Motes />
          </motion.div>

          {/* bloom under the thumb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              opacity: breaking ? 0 : progress * 0.9,
              background:
                "radial-gradient(28% 28% at 50% 50%, rgb(255 255 255 / 92%) 0%, rgb(255 214 140 / 38%) 46%, transparent 72%)",
            }}
          />

          {/* fracture lines snap across before the break */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
            style={{ opacity: broken ? 0 : 1, transition: "opacity 120ms linear" }}
          >
            {cracks.map((c, i) => (
              <g key={i}>
                <path
                  d={c.d}
                  fill="none"
                  stroke="rgb(12 6 4 / 45%)"
                  strokeWidth={c.w * 2}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: c.len,
                    strokeDashoffset: breaking ? 0 : c.len,
                    transition: `stroke-dashoffset ${150 + i * 10}ms cubic-bezier(.2,.9,.2,1) ${i * 5}ms`,
                  }}
                />
                <path
                  d={c.d}
                  fill="none"
                  stroke="rgb(255 252 240 / 95%)"
                  strokeWidth={c.w}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: c.len,
                    strokeDashoffset: breaking ? 0 : c.len,
                    transition: `stroke-dashoffset ${130 + i * 10}ms cubic-bezier(.2,.9,.2,1) ${i * 5}ms`,
                  }}
                />
              </g>
            ))}
          </svg>

          {/* the shards: only mounted for the break, then discarded */}
          {breaking && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {shards.map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    clipPath: s.clip,
                    WebkitClipPath: s.clip,
                    transformOrigin: `${s.cx}% ${s.cy}%`,
                    transform: broken
                      ? `translate3d(${s.tx}vw, ${s.ty}vh, ${s.tz}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) rotateZ(${s.rz}deg)`
                      : "translate3d(0,0,0)",
                    opacity: broken ? 0 : 1,
                    filter: "saturate(0.32) brightness(1.22) contrast(1.08)",
                    transition: `transform ${s.dur}ms cubic-bezier(.22,.62,.2,1) ${s.delay}ms, opacity ${s.dur * 0.75}ms linear ${s.delay + s.dur * 0.3}ms`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  {plate}
                  <span className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-black/25 mix-blend-overlay" />
                </div>
              ))}
            </div>
          )}

          {/* impact flash */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: breaking ? [1, 0] : 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* copy + hold target */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between px-6 py-9 sm:py-14"
            style={{ opacity: breaking ? 0 : 1, transition: "opacity 180ms linear" }}
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center"
            >
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.44em] text-[#5a2a14]">
                Dil Ki Baat · Sabke Sath
              </p>
              <p className="mt-1.5 font-mono text-[0.48rem] uppercase tracking-[0.3em] text-[#5a2a14]/60">
                aapkamentor.ai
              </p>
            </motion.div>

            <div className="flex w-full max-w-xl flex-col items-center text-center">
              <h1 className="font-display text-[2.1rem] leading-[1.02] tracking-tight text-[#3a1409] drop-shadow-[0_2px_18px_rgb(255_244_216/70%)] sm:text-[3.4rem] md:text-[4rem]">
                {["Everyone", "looks", "fine."].map((w, i) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: 1, delay: 0.35 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {w}&nbsp;
                    </motion.span>
                  </span>
                ))}
                <span className="block overflow-hidden italic">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 1.1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Nobody is.
                  </motion.span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1 }}
                className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-[#4a2013]/85 sm:max-w-sm sm:text-[0.95rem]"
              >
                Hold the light. See what this afternoon is hiding.
              </motion.p>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
                className="group relative mt-8 grid size-[8.5rem] cursor-pointer place-items-center rounded-full outline-none sm:size-[9.5rem]"
                style={{ touchAction: "none" }}
              >
                <span
                  className="absolute inset-0 rounded-full bg-white/45 blur-2xl transition-transform duration-300"
                  style={{ transform: `scale(${0.68 + progress * 0.6})` }}
                />
                <svg viewBox="0 0 150 150" className="absolute inset-0 size-full -rotate-90">
                  <circle cx="75" cy="75" r={R} fill="none" stroke="rgb(255 252 244 / 55%)" strokeWidth="1.2" />
                  <circle
                    cx="75"
                    cy="75"
                    r={R}
                    fill="none"
                    stroke="rgb(255 255 255 / 96%)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - progress)}
                  />
                </svg>
                <span
                  className="absolute rounded-full border border-white/70"
                  style={{
                    inset: "1.8rem",
                    transform: `scale(${1 + progress * 0.14})`,
                    animation: phase === "idle" ? "gate-breathe 3.4s ease-in-out infinite" : "none",
                  }}
                />
                <span className="relative font-mono text-[0.56rem] uppercase tracking-[0.36em] text-[#3a1409]">
                  {phase === "holding" ? `${Math.round(progress * 100)}%` : "hold"}
                </span>
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="font-mono text-[0.5rem] uppercase tracking-[0.34em] text-[#4a2013]"
            >
              Sound on
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
