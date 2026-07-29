import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { playClick, setScrollProgress } from "@/lib/audio-engine";

const MILESTONES = [0.25, 0.5, 0.75];

/**
 * Silk scroll physics. Lenis drives the scroll position, GSAP's ticker drives
 * Lenis, and ScrollTrigger is told to update from the same loop so every
 * scroll-linked animation stays in perfect sync with the WebGL core.
 *
 * The same normalised progress also drives the synthesiser: filter cutoff
 * rides the journey and each quarter mark fires a tactile click.
 */
export function SmoothScroll() {
  useEffect(() => {
    const passed = new Set<number>();

    const commit = (progress: number, velocity: number) => {
      scrollState.progress = progress;
      scrollState.velocity = gsap.utils.clamp(-1, 1, velocity / 40);
      setScrollProgress(progress);
      MILESTONES.forEach((m) => {
        if (progress >= m && !passed.has(m)) {
          passed.add(m);
          playClick(0.8 + m * 0.5);
        } else if (progress < m - 0.02) {
          passed.delete(m);
        }
      });
    };

    // Reduced motion: no smooth scrolling, but the scene still needs progress.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const onNative = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        commit(max > 0 ? window.scrollY / max : 0, 0);
      };
      onNative();
      window.addEventListener("scroll", onNative, { passive: true });
      return () => window.removeEventListener("scroll", onNative);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    const onScroll = ({ progress, velocity }: { progress: number; velocity: number }) =>
      commit(progress, velocity);
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
