import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HINGLISH_THOUGHTS } from "@/lib/dilkibaat";

/**
 * A single continuous strip of relatable thoughts. One row, infinite loop,
 * paused on hover. Replaces all floating absolute-positioned text.
 */
export function ThoughtsMarquee() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      const half = el.scrollWidth / 2;
      if (!half) return;

      const tween = gsap.fromTo(
        el,
        { x: 0 },
        { x: -half, duration: half / 42, ease: "none", repeat: -1 },
      );

      const pause = () => tween.timeScale(0.15);
      const play = () => tween.timeScale(1);
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", play);
      return () => {
        el.removeEventListener("pointerenter", pause);
        el.removeEventListener("pointerleave", play);
      };
    },
    { scope: track },
  );

  const items = [...HINGLISH_THOUGHTS, ...HINGLISH_THOUGHTS];

  return (
    <section aria-label="Things people are carrying" className="relative py-10">
      <div className="edge-fade overflow-hidden">
        <div ref={track} className="flex w-max gap-4 px-4 will-change-transform">
          {items.map((t, i) => (
            <article
              key={`${t}-${i}`}
              className="flex w-[19rem] shrink-0 items-center px-6 py-5 sm:w-[24rem]"
            >
              <p className="font-display text-[1.05rem] italic leading-snug text-cream/55 transition-colors duration-500 hover:text-cream sm:text-[1.18rem]">
                “{t}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
