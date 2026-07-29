import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * The question drop box. Each row unlatches like a paper flap:
 * the marker rotates, a warm light line sweeps across, and the answer
 * unfolds with a slight 3D tilt so it feels physical rather than toggled.
 */
export function DropBox({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border/40">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="relative" style={{ perspective: 1000 }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center gap-5 py-7 text-left"
            >
              <motion.span
                animate={{
                  rotate: isOpen ? 135 : 0,
                  color: isOpen ? "var(--ember)" : "var(--primary)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid size-8 shrink-0 place-items-center text-2xl font-light leading-none"
              >
                +
              </motion.span>

              <motion.span
                animate={{ x: isOpen ? 6 : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="font-display text-xl italic leading-snug text-cream/90 transition-colors group-hover:text-primary sm:text-2xl"
              >
                {item.q}
              </motion.span>
            </button>

            {/* light sweep under the open row */}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ scaleX: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-primary via-rose to-transparent"
            />

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0, rotateX: -12, y: -8 }}
                  animate={{ height: "auto", opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ height: 0, opacity: 0, rotateX: -8, y: -6 }}
                  transition={{
                    height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.35 },
                    rotateX: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  }}
                  style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-8 pl-13 pr-2 leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
