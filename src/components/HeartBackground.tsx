import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { AMBIENT_PROMPTS } from "@/lib/dilkibaat";

const HeartScene = lazy(() => import("./three/HeartScene"));

const PROMPT_POSITIONS = [
  "left-[4%] top-[18%]",
  "right-[5%] top-[26%]",
  "left-[8%] bottom-[22%]",
  "right-[8%] bottom-[16%]",
  "left-[42%] top-[8%]",
  "right-[30%] bottom-[6%]",
];

export function HeartBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-80">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <HeartScene />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="absolute inset-0 hidden md:block">
        {AMBIENT_PROMPTS.map((prompt, i) => (
          <span
            key={prompt}
            className={`animate-float absolute max-w-[15rem] rounded-xl border border-border bg-card/40 px-3 py-2 font-display text-sm text-primary/80 backdrop-blur-sm ${PROMPT_POSITIONS[i % PROMPT_POSITIONS.length]}`}
            style={{ animationDelay: `${i * 1.4}s` }}
          >
            “{prompt}”
          </span>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
