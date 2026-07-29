import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { backgroundAt } from "@/lib/narrative";

/**
 * The colour bed sitting underneath the vector canvas. Its tint is
 * interpolated between the eight act palettes on every frame, so the world
 * changes mood continuously instead of cutting between scenes.
 */
export function ColorBed() {
  const bed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      if (bed.current) bed.current.style.backgroundColor = backgroundAt(scrollState.progress);
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      ref={bed}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ backgroundColor: "rgb(11,14,23)" }}
    />
  );
}
