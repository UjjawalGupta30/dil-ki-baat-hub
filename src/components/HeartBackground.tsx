import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AMBIENT_PROMPTS } from "@/lib/dilkibaat";

const HeartScene = lazy(() => import("./three/HeartScene"));

const PROMPT_POSITIONS = [
  "left-[3%] top-[20%] -rotate-6 text-rose",
  "right-[4%] top-[27%] rotate-3 text-primary",
  "left-[7%] bottom-[24%] rotate-2 text-ember",
  "right-[6%] bottom-[18%] -rotate-3 text-rose",
  "left-[38%] top-[7%] -rotate-2 text-primary",
  "right-[26%] bottom-[7%] rotate-6 text-ember",
];

export function HeartBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <HeartScene />
          </Suspense>
        </ClientOnly>
      </div>

      {/* warm lamplight wash */}
      <div className="animate-breathe absolute left-1/2 top-1/3 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/10 blur-[130px]" />
      <div className="absolute right-[12%] top-[12%] size-72 rounded-full bg-plum/25 blur-[110px]" />

      <div className="absolute inset-0 hidden lg:block">
        {AMBIENT_PROMPTS.map((prompt, i) => (
          <motion.span
            key={prompt}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 0.75, y: 0 }}
            transition={{ duration: 1.6, delay: 0.5 + i * 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`animate-float absolute max-w-[16rem] font-display text-[0.95rem] italic leading-snug ${PROMPT_POSITIONS[i % PROMPT_POSITIONS.length]}`}
            style={{ animationDelay: `${i * 1.6}s` }}
          >
            “{prompt}”
          </motion.span>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
