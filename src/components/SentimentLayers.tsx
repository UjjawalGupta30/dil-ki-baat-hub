import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { setFocus, clearFocus } from "@/lib/scroll-state";
import { playChime } from "@/lib/audio-engine";

/**
 * ACT 2 — the sentiments drift past on four parallax Z layers. Nothing sits
 * in a card: only type, blur and glow describe depth. Hovering a line pulls
 * the WebGL dust into a cluster around it.
 */
const LAYERS = [
  {
    text: "Ghar wale career set chahte hain, par mera dil kuch aur keh raha hai.",
    speed: -260,
    className:
      "blur-[2.5px] text-cream/45 text-[clamp(1.5rem,5.5vw,3.4rem)] sm:pr-[18%] self-start",
  },
  {
    text: "What if I am wasting my twenties?",
    speed: -120,
    className:
      "text-gradient-warm text-[clamp(1.9rem,7vw,4.6rem)] self-end sm:pl-[16%] text-right",
  },
  {
    text: "Bachpan ke dost ab stranger se lagte hain.",
    speed: -380,
    className:
      "blur-[4px] text-primary/35 text-[clamp(1.4rem,5vw,3rem)] self-start sm:pr-[26%]",
  },
  {
    text: "I smile all day and overthink at 2 AM.",
    speed: -60,
    className: "text-cream text-[clamp(1.7rem,6vw,4rem)] self-end text-right sm:pl-[8%]",
  },
];

export function SentimentLayers() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-layer]", root.current);
      lines.forEach((line) => {
        const speed = Number(line.dataset.speed ?? 0);
        gsap.fromTo(
          line,
          { y: -speed * 0.5, autoAlpha: 0.15 },
          {
            y: speed * 0.5,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative mx-auto flex max-w-6xl flex-col gap-16 px-5 py-24 sm:gap-24 sm:px-8 sm:py-40"
    >
      {LAYERS.map((l, i) => (
        <p
          key={l.text}
          data-layer
          data-speed={l.speed}
          onPointerEnter={(e) => {
            setFocus(e.clientX, e.clientY);
            playChime([659.25, 783.99, 880, 987.77][i % 4]);
          }}
          onPointerMove={(e) => setFocus(e.clientX, e.clientY)}
          onPointerLeave={clearFocus}
          className={`max-w-3xl cursor-default font-display italic leading-[1.08] transition-[filter,opacity,letter-spacing] duration-700 hover:blur-0 hover:tracking-[0.005em] hover:opacity-100 ${l.className}`}
        >
          {l.text}
        </p>
      ))}
    </div>
  );
}
