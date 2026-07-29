import { lazy, Suspense, useRef } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP, SplitText, EASE } from "@/lib/gsap";
import { Magnetic } from "@/components/Magnetic";
import { Button } from "@/components/ui/button";

const PulseSphere = lazy(() => import("@/components/three/PulseSphere"));

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const heading = root.current?.querySelector<HTMLElement>("[data-hero-title]");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({ defaults: { ease: EASE } });

      if (heading && !reduce) {
        const split = new SplitText(heading, { type: "chars,words" });
        gsap.set(heading, { autoAlpha: 1 });
        tl.from(split.chars, {
          yPercent: 108,
          opacity: 0,
          duration: 1.05,
          stagger: 0.022,
        });
        return () => split.revert();
      }

      if (heading) gsap.set(heading, { autoAlpha: 1 });
      return undefined;
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.from("[data-hero-fade]", {
        autoAlpha: 0,
        y: 22,
        duration: 1,
        delay: 0.55,
        stagger: 0.14,
        ease: EASE,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-20 pt-32 sm:px-8"
    >
      {/* 3D pulse sphere, behind everything, never intercepts clicks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 aspect-square w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 opacity-55 sm:opacity-75">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <PulseSphere />
            </Suspense>
          </ClientOnly>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p
          data-hero-fade
          className="mb-7 rounded-full border border-border px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.34em] text-primary/80"
        >
          Anonymous · Unhurried · Judgement free
        </p>

        <h1
          data-hero-title
          className="invisible text-balance font-display text-[clamp(2.5rem,8vw,5.6rem)] font-normal leading-[1.04] text-cream"
        >
          Say the thing you never say.
        </h1>

        <p
          data-hero-fade
          className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          An anonymous, unhurried space to speak, vent, and be heard without judgment.
        </p>

        <div data-hero-fade className="mt-11">
          <Magnetic strength={0.3}>
            <Button
              asChild
              size="lg"
              className="glow-gold h-14 rounded-full bg-primary px-9 font-display text-lg text-primary-foreground transition-colors duration-500 hover:bg-accent"
            >
              <a href="#share">Share What&apos;s Heavy</a>
            </Button>
          </Magnetic>
        </div>

        <a
          data-hero-fade
          href="#thoughts"
          aria-label="Scroll to read what others are carrying"
          className="mt-16 grid size-10 place-items-center rounded-full border border-border text-primary/80 transition-colors duration-500 hover:border-primary/40 hover:text-primary"
        >
          <ArrowDown className="size-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
