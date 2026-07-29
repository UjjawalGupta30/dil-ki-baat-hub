import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { actIndex, type ActId } from "@/lib/narrative";

/**
 * Reads the master scroll clock published by <SmoothScroll />.
 *
 * The raw progress is intentionally kept in a ref: the WebGL scene and the
 * DOM layers sample it every frame, so putting it in React state would
 * re-render the whole tree sixty times a second. Only the integer act is
 * promoted to state, because that changes at most eight times per journey.
 */
export function useScrollProgress() {
  const progress = useRef(0);
  const [act, setAct] = useState<ActId>(1);

  useEffect(() => {
    const tick = () => {
      progress.current = scrollState.progress;
      const next = actIndex(scrollState.progress);
      setAct((current) => (current === next ? current : next));
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return { progress, act };
}
