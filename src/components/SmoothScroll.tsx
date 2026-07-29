import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";

/**
 * Silk scroll physics. Lenis drives the scroll position, GSAP's ticker drives
 * Lenis, and ScrollTrigger is told to update from the same loop so every
 * scroll-linked animation stays in perfect sync with the WebGL core.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    const onScroll = ({ progress, velocity }: { progress: number; velocity: number }) => {
      scrollState.progress = progress;
      scrollState.velocity = gsap.utils.clamp(-1, 1, velocity / 40);
    };
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
    };
  }, []);

  return null;
}
