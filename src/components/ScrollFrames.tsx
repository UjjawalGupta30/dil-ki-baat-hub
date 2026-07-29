import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * A single oversized "psychology word" that tilts in 3D and settles as the
 * user scrolls past it. Used for the story frames on the landing page.
 */
export function ScrollWord({
  word,
  eyebrow,
  title,
  body,
  align = "left",
  index = 0,
}: {
  word: string;
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "right";
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.5 });

  const rotateX = useTransform(p, [0, 0.5, 1], reduced ? [0, 0, 0] : [26, 0, -18]);
  const rotateZ = useTransform(
    p,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : align === "left" ? [-6, 0, 4] : [6, 0, -4],
  );
  const y = useTransform(p, [0, 1], reduced ? [0, 0] : [90, -90]);
  const scale = useTransform(p, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.88, 1, 0.96]);
  const opacity = useTransform(p, [0, 0.22, 0.75, 1], [0, 1, 1, 0.25]);
  const lineScale = useTransform(p, [0.1, 0.55], [0, 1]);
  const textY = useTransform(p, [0, 1], reduced ? [0, 0] : [40, -40]);

  return (
    <div
      ref={ref}
      className={`relative py-14 sm:py-24 ${align === "right" ? "text-right" : "text-left"}`}
      style={{ perspective: 1200 }}
    >
      <motion.p
        style={{ y: textY, opacity }}
        className="text-[0.62rem] uppercase tracking-[0.42em] text-ember/80"
      >
        {String(index + 1).padStart(2, "0")} &nbsp; {eyebrow}
      </motion.p>

      <motion.h3
        style={{ rotateX, rotateZ, y, scale, opacity, transformStyle: "preserve-3d" }}
        className="text-gradient-warm select-none font-display text-[clamp(3.4rem,15vw,10rem)] font-normal leading-[0.86] tracking-tight"
      >
        {word}
      </motion.h3>

      <motion.div
        style={{
          scaleX: lineScale,
          transformOrigin: align === "right" ? "right" : "left",
        }}
        className={`mt-6 h-px w-full max-w-md sm:max-w-lg ${
          align === "right"
            ? "ml-auto bg-gradient-to-l from-primary via-rose to-transparent"
            : "bg-gradient-to-r from-primary via-rose to-transparent"
        }`}
      />


      <motion.div
        style={{ y: textY, opacity }}
        className={`mt-6 max-w-xl ${align === "right" ? "ml-auto" : ""}`}
      >
        <h4 className="font-display text-2xl italic leading-snug text-cream/90 sm:text-3xl">
          {title}
        </h4>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{body}</p>
      </motion.div>
    </div>
  );
}

/** Soft parallax wrapper for a whole frame. */
export function ParallaxFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [50, -50]);
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
