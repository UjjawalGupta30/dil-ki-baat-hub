import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollControls, scrollState } from "@/lib/scroll-state";
import { ACT_COUNT, ACT_SPAN } from "@/lib/narrative";
import { playActCue, setScrollProgress } from "@/lib/audio-engine";

/**
 * Silk scroll physics and the master clock of the whole story. Lenis drives
 * the scroll position, GSAP's ticker drives Lenis, and one normalised
 * progress value (0 -> 1) is pushed to the WebGL scene, the DOM acts and the
 * synthesiser from the same loop.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fired = new Set<number>();

    const publish = (progress: number, velocity: number) => {
      scrollState.progress = progress;
      scrollState.velocity = gsap.utils.clamp(-1, 1, velocity / 40);
      setScrollProgress(progress);

      // one signature sound per act threshold, re-armable when scrolling back
      for (let act = 2; act <= ACT_COUNT; act++) {
        const edge = (act - 1) * ACT_SPAN;
        if (progress >= edge && !fired.has(act)) {
          fired.add(act);
          playActCue(act);
        } else if (progress < edge - 0.015) {
          fired.delete(act);
        }
      }
    };


    // Reduced motion: no smoothing, but the story still needs its clock.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        publish(max > 0 ? window.scrollY / max : 0, 0);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    scrollControls.to = (p: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      lenis.scrollTo(max * p, { duration: 1.6 });
    };

    const onScroll = ({ progress, velocity }: { progress: number; velocity: number }) =>
      publish(progress, velocity);

    lenis.on("scroll", onScroll);
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const pointer = (e: PointerEvent) => {
      scrollState.px = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", pointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", pointer);
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
