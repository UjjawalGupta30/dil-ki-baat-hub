import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AMBIENT_PROMPTS } from "@/lib/dilkibaat";

const StoryHeart = lazy(() => import("./three/StoryHeart"));

/** Placed loosely around the frame so the words feel like passing thoughts. */
const PROMPT_POSITIONS = [
  "left-[2%] top-[16%] -rotate-6",
  "right-[3%] top-[22%] rotate-3",
  "left-[5%] bottom-[26%] rotate-2",
  "right-[5%] bottom-[15%] -rotate-3",
  "left-[30%] top-[6%] -rotate-2",
  "right-[22%] bottom-[6%] rotate-5",
  "left-[13%] top-[45%] rotate-1",
  "right-[9%] top-[52%] -rotate-4",
  "left-[44%] bottom-[12%] -rotate-1",
  "right-[34%] top-[13%] rotate-2",
];

const TONES = ["text-rose/80", "text-primary/80", "text-ember/75", "text-cream/60"];

export function HeartBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 translate-y-[12%] opacity-50 sm:translate-y-[8%] sm:opacity-70 lg:translate-x-[22%] lg:translate-y-[4%]">
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
