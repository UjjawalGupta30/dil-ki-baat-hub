import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { cityState } from "@/lib/city-state";
import { FILTERS } from "@/lib/unspoken";

/** Scroll progress promoted to React state at a coarse rate the DOM can afford. */
export function useCityProgress() {
  const [p, setP] = useState(0);
  const last = useRef(0);
  useEffect(() => {
    const tick = () => {
      const v = Math.round(cityState.progress * 200) / 200;
      if (v !== last.current) {
        last.current = v;
        setP(v);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return p;
}

const fade = {
  initial: { opacity: 0, y: 26, filter: "blur(14px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -26, filter: "blur(18px)" },
};

export function StageText({ p }: { p: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {p < 0.13 && (
          <motion.div
            key="hook"
            {...fade}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-center"
          >
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-cream sm:text-6xl md:text-7xl">
              So you think no one has
              <span className="block text-gradient-gold">problems in life?</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: p > 0.03 ? 1 : 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto mt-6 max-w-md text-sm text-muted-foreground sm:text-base"
            >
              Let&apos;s look deeper behind closed windows. Scroll to enter the city.
            </motion.p>
          </motion.div>
        )}

        {p >= 0.15 && p < 0.33 && (
          <motion.div
            key="rise"
            {...fade}
            transition={{ duration: 0.7 }}
            className="max-w-xl text-center"
          >
            <p className="font-display text-2xl leading-snug text-cream sm:text-4xl">
              Ten million lit windows.
            </p>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Every one of them is holding something it never said out loud.
            </p>
          </motion.div>
        )}

        {p >= 0.68 && p < 0.85 && (
          <motion.div
            key="crimson"
            {...fade}
            transition={{ duration: 0.75 }}
            className="max-w-2xl text-center"
          >
            <motion.h2
              initial={{ letterSpacing: "0.5em", opacity: 0 }}
              animate={{ letterSpacing: "0.12em", opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-bold text-crimson-glow sm:text-7xl md:text-8xl"
            >
              WHO CARES?
            </motion.h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-cream/85 sm:text-base">
              Just share it anonymously. Let your experience act as a light for someone else.
              Let it go.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Category filter rail, only alive through the map act. */
export function FilterRail({
  p,
  filter,
  onFilter,
}: {
  p: number;
  filter: string;
  onFilter: (f: string) => void;
}) {
  const on = p >= 0.34 && p < 0.7;
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4"
        >
          <div className="glass-panel flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilter(f)}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.66rem] uppercase tracking-[0.22em] transition-all duration-300 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Thin progress spine so the visitor always knows how deep they are. */
export function ScrollSpine({ p }: { p: number }) {
  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden h-40 w-[2px] -translate-y-1/2 bg-cream/10 sm:block">
      <div
        className="w-full bg-gradient-to-b from-primary to-ember transition-[height] duration-200"
        style={{ height: `${Math.round(p * 100)}%` }}
      />
    </div>
  );
}
