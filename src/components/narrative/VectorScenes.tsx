import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { ACTS, actAlpha, actLocal, clamp01, smoothstep, type ActId } from "@/lib/narrative";

/**
 * The vector stage.
 *
 * Eight flat-illustration scenes (Kurzgesagt style: bold silhouettes, glowing
 * dots, no photographic depth) live inside one full-bleed SVG. Nothing here
 * mounts or unmounts while scrolling — a single GSAP ticker writes opacity and
 * transforms straight onto the DOM nodes, so eight full scenes cost one frame.
 *
 * Each scene owns a <g data-scene>. Elements marked with a data-motion recipe
 * get their own continuous life (float, pulse, rotate, drift, flicker) so a
 * paused scroll never looks frozen.
 */

const W = 1440;
const H = 900;

/** Deterministic pseudo-random so SSR and the client agree. */
function rnd(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1e4) / 1e4;
}

export function VectorScenes() {
  const root = useRef<SVGSVGElement>(null);
  const scenes = useRef<(SVGGElement | null)[]>([]);
  const setScene = (i: number) => (el: SVGGElement | null) => {
    scenes.current[i] = el;
  };

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;

    const motion = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>("[data-motion]"),
    ).map((el) => ({
      el,
      kind: el.dataset.motion!,
      seed: Number(el.dataset.seed ?? 0),
      amp: Number(el.dataset.amp ?? 1),
      speed: Number(el.dataset.speed ?? 1),
    }));

    const start = performance.now();

    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const p = scrollState.progress;
      // on wide screens the scene slides clear of the type column on the left
      const shift = window.innerWidth > 980 ? 210 : 0;

      // scenes cross-fade with a slight push in depth, never a hard cut
      ACTS.forEach((act, i) => {
        const g = scenes.current[i];
        if (!g) return;
        const a = actAlpha(p, act.id as ActId);
        const local = actLocal(p, act.id as ActId);
        if (a < 0.004) {
          if (g.style.display !== "none") g.style.display = "none";
          return;
        }
        if (g.style.display === "none") g.style.display = "";
        g.style.opacity = a.toFixed(3);
        const s = 0.88 + a * 0.14;
        const drift = (local - 0.5) * 90;
        g.style.transform = `translate(${(shift + scrollState.px * 18).toFixed(1)}px, ${(
          drift +
          scrollState.py * -12
        ).toFixed(1)}px) scale(${s.toFixed(4)})`;
      });

      // per-element life
      for (let i = 0; i < motion.length; i++) {
        const m = motion[i];
        const ph = m.seed * 6.283;
        switch (m.kind) {
          case "float":
            m.el.style.transform = `translateY(${(
              Math.sin(t * m.speed + ph) * 12 * m.amp
            ).toFixed(2)}px)`;
            break;
          case "bob":
            m.el.style.transform = `translate(${(Math.cos(t * 0.6 * m.speed + ph) * 8 * m.amp).toFixed(
              2,
            )}px, ${(Math.sin(t * 0.9 * m.speed + ph) * 10 * m.amp).toFixed(2)}px)`;
            break;
          case "pulse": {
            const k = (t * 0.5 * m.speed + m.seed) % 1;
            m.el.style.opacity = ((1 - k) * 0.5).toFixed(3);
            m.el.style.transform = `scale(${(0.4 + k * 1.5 * m.amp).toFixed(3)})`;
            break;
          }
          case "breathe":
            m.el.style.opacity = (0.45 + Math.sin(t * 1.6 * m.speed + ph) * 0.3).toFixed(3);
            break;
          case "spin":
            m.el.style.transform = `rotate(${((t * 22 * m.speed + m.seed * 360) % 360).toFixed(
              2,
            )}deg)`;
            break;
          case "spinBack":
            m.el.style.transform = `rotate(${(-(t * 14 * m.speed) % 360).toFixed(2)}deg)`;
            break;
          case "rise": {
            const k = (t * 0.16 * m.speed + m.seed) % 1;
            m.el.style.transform = `translateY(${(k * -260).toFixed(1)}px)`;
            m.el.style.opacity = (Math.sin(k * Math.PI) * 0.85).toFixed(3);
            break;
          }
          case "emit": {
            const k = (t * 0.22 * m.speed + m.seed) % 1;
            const ang = m.seed * 6.283;
            m.el.style.transform = `translate(${(Math.cos(ang) * k * 520).toFixed(1)}px, ${(
              Math.sin(ang) * k * 300 -
              k * 40
            ).toFixed(1)}px) scale(${(0.7 + k * 0.4).toFixed(3)})`;
            m.el.style.opacity = (Math.sin(k * Math.PI) * 0.95).toFixed(3);
            break;
          }
          case "shard": {
            const local = clamp01((scrollState.progress - 0.5) / 0.125);
            const e = smoothstep(0, 1, local);
            const ang = m.seed * 6.283;
            const d = e * (240 + m.amp * 420);
            m.el.style.transform = `translate(${(Math.cos(ang) * d).toFixed(1)}px, ${(
              Math.sin(ang) * d * 0.62
            ).toFixed(1)}px) rotate(${(e * 220 * (m.seed > 0.5 ? 1 : -1)).toFixed(1)}deg)`;
            m.el.style.opacity = (0.25 + (1 - e) * 0.75).toFixed(3);
            break;
          }
          case "gather": {
            const local = clamp01((scrollState.progress - 0.625) / 0.125);
            const e = smoothstep(0, 1, local);
            const ang = m.seed * 6.283;
            const d = (1 - e) * (300 + m.amp * 380);
            m.el.style.transform = `translate(${(Math.cos(ang) * d).toFixed(1)}px, ${(
              Math.sin(ang) * d * 0.7
            ).toFixed(1)}px)`;
            m.el.style.opacity = (0.3 + e * 0.7).toFixed(3);
            break;
          }
          case "flicker":
            m.el.style.transform = `scale(${(
              1 +
              Math.sin(t * 7 * m.speed + ph) * 0.06 * m.amp +
              Math.sin(t * 13.7 + ph) * 0.03
            ).toFixed(4)})`;
            m.el.style.opacity = (0.72 + Math.sin(t * 9 * m.speed + ph) * 0.24).toFixed(3);
            break;
          case "flyIn": {
            const local = clamp01((scrollState.progress - 0.75) / 0.125);
            const e = smoothstep(0, 1, local);
            m.el.style.transform = `translate(${((1 - e) * 420 * m.amp).toFixed(1)}px, ${(
              Math.sin(t * 1.6 + ph) * 14 -
              (1 - e) * 90
            ).toFixed(1)}px)`;
            break;
          }
          case "beam": {
            const local = clamp01((scrollState.progress - 0.78) / 0.09);
            m.el.style.transform = `scaleX(${smoothstep(0, 1, local).toFixed(3)})`;
            m.el.style.opacity = (
              smoothstep(0, 1, local) * (0.6 + Math.sin(t * 3) * 0.25)
            ).toFixed(3);
            break;
          }
        }
      }
    };

    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <svg
      ref={root}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="spot" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#FFB800" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#FFB800" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="warm" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FF9A3C" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#FF6A00" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7FE3C0" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFE9A8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7FE3C0" stopOpacity="0" />
        </linearGradient>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ─── ACT 1 · the connected void ─────────────────────────── */}
      <g ref={setScene(0)} data-scene="1" style={{ transformOrigin: "50% 50%" }}>
        <ellipse cx={W / 2} cy={520} rx={430} ry={330} fill="url(#spot)" />
        <g transform={`translate(${W / 2} 470)`}>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              data-motion="pulse"
              data-seed={i / 3}
              data-amp="1"
              r={90}
              fill="none"
              stroke="#FFB800"
              strokeWidth="1.4"
              style={{ transformOrigin: "0px 0px" }}
            />
          ))}
        </g>
        {/* seated figure */}
        <g transform={`translate(${W / 2} 470)`}>
        <g data-motion="float" data-speed="0.5" data-amp="0.5">
          <circle cx="0" cy="-46" r="30" fill="#F7F4EF" opacity="0.92" />
          <path
            d="M -44 62 C -44 6, -26 -12, 0 -12 C 26 -12, 44 6, 44 62 Z"
            fill="#F7F4EF"
            opacity="0.85"
          />
          <path d="M -66 62 L 66 62" stroke="#FFB800" strokeWidth="3" opacity="0.5" />
          <circle cx="0" cy="4" r="12" fill="#FFB800" opacity="0.55" filter="url(#glow)" />
        </g>
        </g>
        {/* floating notification vectors */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = 250 + rnd(i) * 230;
          const x = W / 2 + Math.cos(a) * r;
          const y = 470 + Math.sin(a) * r * 0.55;
          const kind = i % 3;
          return (
            <g
              key={i}
              transform={`translate(${x.toFixed(0)} ${y.toFixed(0)})`}
              opacity={0.5 + rnd(i + 9) * 0.4}
            >
              <g data-motion="bob" data-seed={rnd(i + 3)} data-speed={0.6 + rnd(i) * 0.8}>
                {kind === 0 && (
                  <>
                    <path d="M -12 4 a 16 16 0 0 1 24 0" fill="none" stroke="#7FA6D8" strokeWidth="2.4" />
                    <path d="M -6 10 a 8 8 0 0 1 12 0" fill="none" stroke="#7FA6D8" strokeWidth="2.4" />
                    <circle cx="0" cy="16" r="2.6" fill="#7FA6D8" />
                  </>
                )}
                {kind === 1 && (
                  <path
                    d="M 0 12 C -16 0, -14 -12, -5 -12 C -1 -12, 0 -9, 0 -7 C 0 -9, 1 -12, 5 -12 C 14 -12, 16 0, 0 12 Z"
                    fill="#FFB800"
                    opacity="0.8"
                  />
                )}
                {kind === 2 && (
                  <path
                    d="M -16 -10 h 32 a 5 5 0 0 1 5 5 v 12 a 5 5 0 0 1 -5 5 h -20 l -9 8 v -8 a 5 5 0 0 1 -3 -5 v -12 a 5 5 0 0 1 5 -5 z"
                    fill="none"
                    stroke="#C89BE8"
                    strokeWidth="2"
                  />
                )}
              </g>
            </g>
          );
        })}
      </g>

      {/* ─── ACT 2 · the biology of pain ────────────────────────── */}
      <g ref={setScene(1)} data-scene="2" style={{ transformOrigin: "50% 50%" }}>
        <g transform={`translate(${W / 2} 450)`}>
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              data-motion="pulse"
              data-seed={i / 4}
              data-amp="1.6"
              r={110}
              fill="none"
              stroke="#FF4D4D"
              strokeWidth="2"
              style={{ transformOrigin: "0px 0px" }}
            />
          ))}
          {/* brain outline */}
          <g data-motion="float" data-speed="0.45" data-amp="0.6" filter="url(#glow)">
            <path
              d="M -6 -108 C -60 -122, -122 -88, -118 -34 C -152 -6, -140 54, -96 66 C -92 108, -34 124, -6 96 Z"
              fill="none"
              stroke="#C89BE8"
              strokeWidth="3"
            />
            <path
              d="M 6 -108 C 60 -122, 122 -88, 118 -34 C 152 -6, 140 54, 96 66 C 92 108, 34 124, 6 96 Z"
              fill="none"
              stroke="#C89BE8"
              strokeWidth="3"
            />
            <path
              d="M -6 -96 L -6 96 M 6 -96 L 6 96"
              stroke="#C89BE8"
              strokeWidth="2"
              opacity="0.5"
            />
            {[-70, -30, 20, 60].map((y, i) => (
              <path
                key={i}
                d={`M -96 ${y} C -60 ${y - 22}, -30 ${y + 20}, -14 ${y}`}
                fill="none"
                stroke="#C89BE8"
                strokeWidth="2"
                opacity="0.55"
              />
            ))}
            {[-70, -30, 20, 60].map((y, i) => (
              <path
                key={`r${i}`}
                d={`M 96 ${y} C 60 ${y - 22}, 30 ${y + 20}, 14 ${y}`}
                fill="none"
                stroke="#C89BE8"
                strokeWidth="2"
                opacity="0.55"
              />
            ))}
            <circle cx="0" cy="-4" r="16" fill="#FF4D4D" opacity="0.75" data-motion="breathe" />
          </g>
        </g>
        {/* tribal silhouettes flanking the frame */}
        {[
          [110, 1],
          [190, 1],
          [W - 110, -1],
          [W - 190, -1],
        ].map(([x, dir], i) => (
          <g
            key={i}
            transform={`translate(${x} 640) scale(${dir} 1)`}
            opacity={0.35 - i * 0.04}
          >
            <g data-motion="float" data-seed={rnd(i + 4)} data-speed="0.4">
            <circle cx="0" cy="-84" r="22" fill="#C89BE8" />
            <path d="M -30 60 C -30 -30, 30 -30, 30 60 Z" fill="#C89BE8" />
            <path d="M 30 -30 L 74 -120" stroke="#C89BE8" strokeWidth="6" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </g>

      {/* ─── ACT 3 · the industrial drift ───────────────────────── */}
      <g ref={setScene(2)} data-scene="3" style={{ transformOrigin: "50% 50%" }}>
        {Array.from({ length: 11 }).map((_, i) => {
          const bw = 92 + rnd(i) * 70;
          const bx = 90 + i * 118;
          const bh = 260 + rnd(i + 2) * 420;
          return (
            <g key={i}>
              <clipPath id={`tower${i}`}>
                <rect x={bx} y={H - bh} width={bw} height={bh} />
              </clipPath>
              <rect x={bx} y={H - bh} width={bw} height={bh} fill="#0C0A10" opacity="0.9" />
              <rect
                x={bx}
                y={H - bh}
                width={bw}
                height={bh}
                fill="none"
                stroke="#8C8FA3"
                strokeWidth="1"
                opacity="0.35"
              />
              <g clipPath={`url(#tower${i})`}>
                {Array.from({ length: 9 }).map((__, j) => (
                  <g
                    key={j}
                    data-motion="rise"
                    data-seed={rnd(i * 13 + j)}
                    data-speed={0.6 + rnd(i + j) * 0.9}
                  >
                    <rect
                      x={bx + 16 + (j % 2) * 42}
                      y={H - bh + 60 + j * 46}
                      width="26"
                      height="20"
                      fill="#8C8FA3"
                      opacity="0.45"
                    />
                  </g>
                ))}
              </g>
            </g>
          );
        })}
        {/* the one warm window */}
        <g transform={`translate(${W / 2} 430)`} filter="url(#glow)">
          <rect x="-22" y="-16" width="44" height="34" fill="#FFB800" data-motion="breathe" />
          <ellipse cx="0" cy="0" rx="150" ry="120" fill="url(#spot)" />
        </g>
      </g>

      {/* ─── ACT 4 · the vicious cycle ──────────────────────────── */}
      <g ref={setScene(3)} data-scene="4" style={{ transformOrigin: "50% 50%" }}>
        <g transform={`translate(${W / 2} 450)`}>
          <g data-motion="spin" style={{ transformOrigin: "0px 0px" }}>
            <circle
              r="200"
              fill="none"
              stroke="#E08A6A"
              strokeWidth="3"
              strokeDasharray="26 20"
              opacity="0.75"
            />
            <circle r="150" fill="none" stroke="#FF6B4D" strokeWidth="1.5" opacity="0.45" />
            {[0, 90, 180, 270].map((a) => (
              <path
                key={a}
                d="M -16 -14 L 0 0 L -16 14"
                fill="none"
                stroke="#FF6B4D"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${a}) translate(200 0)`}
              />
            ))}
          </g>
          <g data-motion="spinBack" style={{ transformOrigin: "0px 0px" }}>
            <circle
              r="252"
              fill="none"
              stroke="#E08A6A"
              strokeWidth="1"
              strokeDasharray="4 26"
              opacity="0.5"
            />
          </g>
          {/* thought cards drifting out of the loop */}
          {[
            "Ghar wale career set chahte hain…",
            "What if I am wasting my 20s?",
            "I smile all day and overthink at 2 AM.",
            "Bachpan ke dost ab stranger lagte hain…",
            "I said yes when I meant no. Again.",
            "Everyone seems so far ahead of me.",
          ].map((line, i) => (
            <g key={line} data-motion="emit" data-seed={i / 6 + 0.04} data-speed={0.7 + rnd(i) * 0.5}>
              <rect
                x="-140"
                y="-19"
                width="280"
                height="38"
                rx="19"
                fill="#1A0A0A"
                opacity="0.72"
                stroke="#E08A6A"
                strokeWidth="1"
              />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="#F7F4EF"
                fontSize="15"
                opacity="0.85"
                fontFamily="var(--font-sans, sans-serif)"
              >
                {line}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* ─── ACT 5 · the unburdening ────────────────────────────── */}
      <g ref={setScene(4)} data-scene="5" style={{ transformOrigin: "50% 50%" }}>
        <g transform={`translate(${W / 2} 450)`}>
          <ellipse rx="420" ry="330" fill="url(#warm)" />
          {/* the wheel breaking apart */}
          {Array.from({ length: 34 }).map((_, i) => (
            <g key={i} data-motion="shard" data-seed={rnd(i)} data-amp={rnd(i + 7)}>
              <path
                d={`M 0 0 L ${18 + rnd(i + 1) * 22} ${-6 - rnd(i + 2) * 12} L ${
                  10 + rnd(i + 3) * 18
                } ${12 + rnd(i + 4) * 14} Z`}
                fill="#E2C382"
                opacity="0.75"
                transform={`rotate(${(rnd(i + 5) * 360).toFixed(0)}) translate(${(
                  150 +
                  rnd(i + 6) * 60
                ).toFixed(0)} 0)`}
              />
            </g>
          ))}
          {/* golden dust */}
          {Array.from({ length: 90 }).map((_, i) => (
            <circle
              key={i}
              data-motion="shard"
              data-seed={rnd(i + 40)}
              data-amp={rnd(i + 41) * 1.4}
              r={1 + rnd(i + 42) * 2.6}
              cx={(rnd(i + 43) - 0.5) * 300}
              cy={(rnd(i + 44) - 0.5) * 220}
              fill="#FFD98A"
              opacity="0.8"
            />
          ))}
        </g>
      </g>

      {/* ─── ACT 6 · the venting portal ─────────────────────────── */}
      <g ref={setScene(5)} data-scene="6" style={{ transformOrigin: "50% 50%" }}>
        <g transform={`translate(${W / 2} 450)`}>
          <ellipse rx="400" ry="320" fill="url(#spot)" opacity="0.7" />
          <g filter="url(#glow)">
            <ellipse
              rx="330"
              ry="250"
              fill="none"
              stroke="#E2C382"
              strokeWidth="2"
              opacity="0.55"
              data-motion="breathe"
            />
            <ellipse rx="300" ry="222" fill="none" stroke="#D8A6F0" strokeWidth="1" opacity="0.4" />
          </g>
          {Array.from({ length: 120 }).map((_, i) => {
            const a = (i / 120) * Math.PI * 2;
            return (
              <circle
                key={i}
                data-motion="gather"
                data-seed={rnd(i + 60)}
                data-amp={rnd(i + 61)}
                cx={+(Math.cos(a) * 330).toFixed(2)}
                cy={+(Math.sin(a) * 250).toFixed(2)}
                r={1.2 + rnd(i + 62) * 2.2}
                fill={i % 4 === 0 ? "#D8A6F0" : "#E2C382"}
                opacity="0.85"
              />
            );
          })}
        </g>
      </g>

      {/* ─── ACT 7 · the empathetic bridge ──────────────────────── */}
      <g ref={setScene(6)} data-scene="7" style={{ transformOrigin: "50% 50%" }}>
        <rect
          x={W / 2 - 300}
          y={636}
          width="600"
          height="4"
          rx="2"
          fill="url(#beamGrad)"
          data-motion="beam"
          style={{ transformOrigin: `${W / 2}px 638px` }}
          filter="url(#glow)"
        />
        {[
          { x: 470, dir: 1, color: "#7FE3C0" },
          { x: 970, dir: -1, color: "#FFE9A8" },
        ].map((b, i) => (
          <g
            key={i}
            transform={`translate(${b.x} 620) scale(${b.dir} 1)`}
          >
            <g data-motion="flyIn" data-seed={i / 2} data-amp={b.dir}>
            <g filter="url(#glow)">
              <path
                d="M -46 0 C -30 -44, 30 -44, 52 0 C 30 34, -26 34, -46 0 Z"
                fill={b.color}
                opacity="0.9"
              />
              <path d="M 52 0 L 84 -12 L 56 8 Z" fill={b.color} opacity="0.9" />
              <circle cx="34" cy="-8" r="3.4" fill="#0F1A15" />
              <path
                d="M -18 -6 C -4 -34, 26 -30, 30 -8 C 14 4, -6 6, -18 -6 Z"
                fill="#0F1A15"
                opacity="0.28"
                data-motion="float"
                data-speed="1.8"
                data-amp="0.4"
              />
            </g>
            </g>
          </g>
        ))}
        {Array.from({ length: 26 }).map((_, i) => (
          <circle
            key={i}
            cx={W / 2 + (rnd(i) - 0.5) * 620}
            cy={638 + (rnd(i + 5) - 0.5) * 150}
            r={1 + rnd(i + 9) * 2.4}
            fill="#FFE9A8"
            data-motion="float"
            data-seed={rnd(i + 2)}
            data-speed={0.5 + rnd(i) * 0.8}
            opacity="0.6"
          />
        ))}
      </g>

      {/* ─── ACT 8 · the human sanctuary ────────────────────────── */}
      <g ref={setScene(7)} data-scene="8" style={{ transformOrigin: "50% 50%" }}>
        <g transform={`translate(${W / 2} 520)`}>
          <ellipse rx="460" ry="330" fill="url(#warm)" />
          {/* fire */}
          <g filter="url(#glow)">
            <path
              d="M 0 -120 C 46 -60, 62 -20, 44 24 C 30 58, -30 58, -44 24 C -62 -20, -46 -60, 0 -120 Z"
              fill="#FF8A1F"
              opacity="0.9"
              data-motion="flicker"
              data-speed="1"
              style={{ transformOrigin: "0px 20px" }}
            />
            <path
              d="M 0 -66 C 26 -30, 34 -8, 24 16 C 16 34, -16 34, -24 16 C -34 -8, -26 -30, 0 -66 Z"
              fill="#FFD98A"
              opacity="0.95"
              data-motion="flicker"
              data-speed="1.7"
              data-amp="1.4"
              style={{ transformOrigin: "0px 20px" }}
            />
          </g>
          {/* logs */}
          <path d="M -78 46 L 78 66" stroke="#5A3418" strokeWidth="16" strokeLinecap="round" />
          <path d="M 78 46 L -78 66" stroke="#43260F" strokeWidth="16" strokeLinecap="round" />
          {/* embers */}
          {Array.from({ length: 46 }).map((_, i) => (
            <circle
              key={i}
              cx={(rnd(i) - 0.5) * 240}
              cy={20 - rnd(i + 3) * 40}
              r={1 + rnd(i + 4) * 2.4}
              fill="#FFB35C"
              data-motion="rise"
              data-seed={rnd(i + 11)}
              data-speed={0.7 + rnd(i) * 1.2}
            />
          ))}
          {/* people around the fire */}
          {[-320, -210, 210, 320].map((x, i) => (
            <g
              key={x}
              transform={`translate(${x} ${i === 0 || i === 3 ? 70 : 46}) scale(${
                x < 0 ? 1 : -1
              } 1)`}
              opacity="0.9"
            >
              <g data-motion="float" data-seed={rnd(i + 20)} data-speed="0.35">
              <circle cx="0" cy="-58" r="24" fill="#2A1608" stroke="#FFB35C" strokeWidth="2" />
              <path
                d="M -34 44 C -34 -32, 34 -32, 34 44 Z"
                fill="#2A1608"
                stroke="#FFB35C"
                strokeWidth="2"
              />
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

export default VectorScenes;
