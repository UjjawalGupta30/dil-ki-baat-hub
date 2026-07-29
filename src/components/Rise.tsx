import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";

/**
 * Scroll-triggered entrance. Reserves layout space up front (opacity only
 * plus a small translate) so nothing shifts, keeping CLS at zero.
 */
export function Rise({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
}) {
  const Tag = as as ElementType<{ ref?: unknown; className?: string; children?: ReactNode }>;
  const ref = useRef<HTMLDivElement>(null);


  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
