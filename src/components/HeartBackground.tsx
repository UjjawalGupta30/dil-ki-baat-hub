import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AMBIENT_PROMPTS } from "@/lib/dilkibaat";

const StoryHeart = lazy(() => import("./three/StoryHeart"));

/** Placed loosely around the frame so the words feel like passing thoughts. */
const PROMPT_POSITIONS = [
  "left-[3%] top-[8%] -rotate-3",
  "right-[4%] top-[12%] rotate-2",
  "left-[6%] bottom-[8%] rotate-2",
  "right-[6%] bottom-[10%] -rotate-2",
  "left-[34%] top-[4%] -rotate-1",
  "right-[26%] bottom-[3%] rotate-3",
  "left-[24%] bottom-[20%] rotate-1",
  "right-[8%] top-[34%] -rotate-3",
  "left-[2%] top-[26%] rotate-1",
  "right-[36%] top-[7%] -rotate-2",
  "left-[9%] bottom-[34%] -rotate-2",
  "right-[14%] bottom-[26%] rotate-2",
];

const TONES = ["text-rose/70", "text-primary/70", "text-ember/65", "text-cream/50"];

export function HeartBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 translate-y-[12%] opacity-60 sm:translate-y-[8%] sm:opacity-80 lg:translate-x-[22%] lg:translate-y-[4%]">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <StoryHeart />
          </Suspense>
        </ClientOnly>
      </div>

      {/* warm lamplight wash */}
      <div className="animate-breathe absolute left-1/2 top-1/3 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/10 blur-[130px]" />
      <div className="absolute right-[12%] top-[12%] size-72 rounded-full bg-plum/25 blur-[110px]" />

      <div className="absolute inset-0">
        {AMBIENT_PROMPTS.map((prompt, i) => (
          <motion.span
            key={prompt}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.8, delay: 0.4 + i * 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`animate-float absolute max-w-[13rem] font-display text-[0.8rem] italic leading-snug lg:max-w-[17rem] lg:text-[0.98rem] ${
              PROMPT_POSITIONS[i % PROMPT_POSITIONS.length]
            } ${TONES[i % TONES.length]} ${i > 3 ? "hidden lg:block" : ""}`}
            style={{ animationDelay: `${i * 1.4}s` }}
          >
            {prompt}
          </motion.span>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
