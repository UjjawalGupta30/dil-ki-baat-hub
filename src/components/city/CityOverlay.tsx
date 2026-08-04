import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FILTERS } from "@/lib/unspoken";

/**
 * Scroll progress promoted to React state on its own animation frame loop.
 * Reads the document directly so the overlay can never fall a step behind the
 * WebGL city, and quantises to 0.5% steps so React only re-renders when the
 * value actually moves.
 */
export function useCityProgress() {
  const [p, setP] = useState(0);
  const last = useRef(-1);
  useEffect(() => {
    let id = 0;
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const raw = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const v = Math.round(raw * 200) / 200;
      if (v !== last.current) {
        last.current = v;
        setP(v);
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  return p;
}


const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------ type motion */

const wordSet: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const word: Variants = {
  initial: { y: "110%", opacity: 0, rotateX: -55, filter: "blur(10px)" },
  animate: {
    y: "0%",
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 1.05, ease: EASE },
  },
  exit: {
    y: "-90%",
    opacity: 0,
    filter: "blur(14px)",
    transition: { duration: 0.5, ease: [0.7, 0, 0.4, 1] },
  },
};

/**
 * Word-by-word masked reveal. Each word sits inside its own overflow-hidden
 * slot so it genuinely rises out of the line rather than fading in place.
 */
function Words({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      variants={wordSet}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ perspective: 800 }}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span variants={word} className="inline-block will-change-transform">
            {w}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

const softIn: Variants = {
  initial: { opacity: 0, y: 22, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, filter: "blur(16px)" },
};

/** Thin animated rule used to separate a claim from its source. */
function Rule({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ scaleX: 0, opacity: 0 }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className="mx-auto block h-px w-24 origin-center bg-gradient-to-r from-transparent via-primary/70 to-transparent"
    />
  );
}

/* ------------------------------------------------------------------ stages */

export function StageText({ p }: { p: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6">
      <AnimatePresence>
        {p < 0.14 && (
          <motion.div
            key="arrival"
            variants={softIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-3xl text-center"
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.42em" }}
              transition={{ duration: 1.4, ease: EASE }}
              className="font-mono text-[0.55rem] uppercase text-primary/80 sm:text-[0.6rem]"
            >
              2:47 AM · the same city
            </motion.p>
            <h2 className="mt-6 font-display text-3xl leading-[1.08] tracking-tight text-cream sm:text-5xl md:text-6xl">
              <Words text="The light went out." />
              <span className="mt-1 block text-gradient-gold">
                <Words text="The people did not." />
              </span>
            </h2>
            <motion.p
              variants={softIn}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
              className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              Every window you pass said they were fine today.
            </motion.p>
          </motion.div>
        )}

        {p >= 0.16 && p < 0.32 && (
          <motion.div
            key="fact"
            variants={softIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.85, ease: EASE }}
            className="max-w-2xl text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.15 }}
              className="font-mono text-[0.55rem] uppercase tracking-[0.4em] text-primary/70"
            >
              not a feeling · a number
            </motion.p>
            <h2 className="mt-5 font-display text-[2rem] leading-[1.12] text-cream sm:text-[3rem] md:text-[3.6rem]">
              <Words text="One in every eight people alive" />
              <span className="block text-gradient-gold">
                <Words text="is carrying a mental health condition." />
              </span>
            </h2>
            <div className="mt-7">
              <Rule delay={1.1} />
            </div>
            <motion.p
              variants={softIn}
              transition={{ duration: 1, delay: 1.25, ease: EASE }}
              className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-cream/80 sm:text-base"
            >
              <span className="text-primary">970 million people</span>, says the World Health
              Organization. Someone in your last five chats is one of them.
            </motion.p>
          </motion.div>
        )}

        {p >= 0.36 && p < 0.44 && (
          <motion.div
            key="hint"
            variants={softIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-lg pb-[26vh] text-center"
          >
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.38em] text-primary/75">
              tap any lit window
            </p>
            <p className="mt-4 font-display text-xl leading-snug text-cream/90 sm:text-2xl">
              <Words text="Real sentences. Real people. Nobody signed their name." />
            </p>
          </motion.div>
        )}

        {p >= 0.68 && p < 0.855 && (
          <motion.div
            key="whocares"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.06 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-3xl text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-mono text-[0.55rem] uppercase tracking-[0.42em] text-crimson-glow/80"
            >
              the question that keeps you quiet
            </motion.p>

            <h2 className="mt-5 flex flex-nowrap items-baseline justify-center gap-x-[0.06em] whitespace-nowrap">
              {"WHO CARES?".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 90, rotate: -14, filter: "blur(18px)" }}
                  animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 1.15,
                    delay: 0.22 + i * 0.065,
                    ease: EASE,
                  }}
                  className="font-display text-[2.4rem] font-black leading-none text-crimson-glow sm:text-[4.4rem] md:text-[6rem]"
                  style={{ display: ch === " " ? "block" : "inline-block", width: ch === " " ? "0.4em" : undefined }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, delay: 1.05, ease: EASE }}
              className="mx-auto mt-4 h-px w-40 origin-center bg-gradient-to-r from-transparent via-crimson-glow/70 to-transparent"
            />

            <motion.p
              variants={softIn}
              initial="initial"
              animate="animate"
              transition={{ duration: 1.1, delay: 1.15, ease: EASE }}
              className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base"
            >
              You have asked it at 3 AM. The honest answer:{" "}
              <span className="text-primary">everyone already sitting where you are.</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="mt-6 font-mono text-[0.55rem] uppercase tracking-[0.34em] text-muted-foreground"
            >
              keep scrolling to say yours · no name, no account
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Category filter rail, only alive through the windows act. */
export function FilterRail({
  p,
  filter,
  onFilter,
}: {
  p: number;
  filter: string;
  onFilter: (f: string) => void;
}) {
  const on = p >= 0.34 && p < 0.68;
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4"
        >
          <div className="glass-panel flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5">
            {FILTERS.map((f, i) => (
              <motion.button
                key={f}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
                onClick={() => onFilter(f)}
                className={`shrink-0 rounded-full px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] transition-all duration-300 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {f}
              </motion.button>
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
      <span className="absolute -left-9 top-0 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground/60">
        {String(Math.round(p * 100)).padStart(2, "0")}
      </span>
    </div>
  );
}
