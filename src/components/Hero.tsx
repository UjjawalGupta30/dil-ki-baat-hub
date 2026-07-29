import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP, SplitText, EASE } from "@/lib/gsap";
import { Magnetic } from "@/components/Magnetic";

/**
 * ACT 1 — "The weight". Massive type that dissolves backward into Z space as
 * the visitor scrolls, handing the frame over to the 3D core behind it.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heading = root.current?.querySelector<HTMLElement>("[data-hero-title]");
      if (!heading) return;

      if (reduce) {
        gsap.set(heading, { autoAlpha: 1 });
        return;
      }

      const split = new SplitText(heading, { type: "chars,words" });
      gsap.set(heading, { autoAlpha: 1 });
      gsap.from(split.chars, {
        yPercent: 118,
        opacity: 0,
        duration: 1.15,
        stagger: 0.024,
        ease: EASE,
      });
      gsap.from("[data-hero-fade]", {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        delay: 0.5,
        stagger: 0.14,
        ease: EASE,
      });

      // ACT 1 — the letters scale up through Z and fly past the camera
      gsap.to(split.chars, {
        z: 900,
        scale: 1.6,
        autoAlpha: 0,
        filter: "blur(16px)",
        ease: "none",
        stagger: { each: 0.012, from: "center" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // everything else recedes quietly into depth
      gsap.to("[data-hero-fade]", {
        z: -600,
        autoAlpha: 0,
        filter: "blur(10px)",
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });


      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] items-center justify-center px-5 pb-24 pt-32 sm:px-8"
      style={{ perspective: "1100px" }}
    >
      <div
        data-hero-stage
        style={{ transformStyle: "preserve-3d" }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center will-change-transform"
      >

        <p
          data-hero-fade
          className="mb-8 text-[0.55rem] uppercase tracking-[0.42em] text-primary/70 sm:text-[0.62rem]"
        >
          Anonymous · Unhurried · Judgement free
        </p>

        <h1
          data-hero-title
          style={{ transformStyle: "preserve-3d" }}
          className="invisible text-balance font-display text-[clamp(2.6rem,9vw,6.4rem)] font-normal leading-[1.02] text-cream drop-shadow-[0_18px_60px_rgba(0,0,0,0.7)]"
        >

          Say the thing you never say.
        </h1>

        <p
          data-hero-fade
          className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-cream/70 sm:text-lg"
        >
          Everything you have been carrying quietly has somewhere to go now. No name, no
          account, no one waiting to judge the shape of it.
        </p>

        <div data-hero-fade className="mt-12">
          <Magnetic strength={0.34}>
            <a
              href="#share"
              className="halo-pill inline-flex h-14 items-center rounded-full px-10 font-display text-lg text-cream"
            >
              Begin where it hurts
            </a>
          </Magnetic>
        </div>

        <a
          data-hero-fade
          href="#thoughts"
          aria-label="Scroll to read what others are carrying"
          className="mt-16 text-primary/70 transition-colors duration-500 hover:text-primary"
        >
          <ArrowDown className="size-5 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
