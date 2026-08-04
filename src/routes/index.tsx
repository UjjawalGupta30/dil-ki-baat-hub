import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Instagram, Share2, ShieldCheck } from "lucide-react";
import { SmoothScroll } from "@/components/SmoothScroll";
import { HelpModal } from "@/components/HelpModal";
import { AudioToggle } from "@/components/AudioToggle";
import { ThoughtNodes } from "@/components/city/ThoughtNodes";
import { ReleaseForm } from "@/components/city/ReleaseForm";
import {
  FilterRail,
  ScrollSpine,
  StageText,
  useCityProgress,
} from "@/components/city/CityOverlay";
import { cityState } from "@/lib/city-state";
import { TICKER_LINES } from "@/lib/unspoken";
import { gsap } from "@/lib/gsap";

const CityScene = lazy(() => import("@/components/city/CityScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unspoken | The City of Anonymous Thoughts" },
      {
        name: "description",
        content:
          "Fly through a 3D city of lit windows and read what people never say out loud, then leave your own burden anonymously. A safe, nameless space by Dil Ki Baat.",
      },
      { property: "og:title", content: "Unspoken | The City of Anonymous Thoughts" },
      {
        property: "og:description",
        content:
          "Behind every lit window is something unsaid. Read them, then release yours anonymously.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: City,
});

/** Publishes window scroll + pointer into the shared city state every frame. */
function useCityInput() {
  useEffect(() => {
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      cityState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const move = (e: PointerEvent) => {
      cityState.px = (e.clientX / window.innerWidth) * 2 - 1;
      cityState.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    gsap.ticker.add(tick);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", move);
    };
  }, []);
}

function City() {
  useCityInput();
  const p = useCityProgress();
  const [filter, setFilter] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [feed, setFeed] = useState<string[]>(TICKER_LINES);
  const scrolled = useRef(false);

  useEffect(() => {
    if (p > 0.02) scrolled.current = true;
  }, [p]);

  return (
    <div className="relative w-full">
      <SmoothScroll />

      {/* the living city: one fixed WebGL canvas for the whole journey */}
      <div className="fixed inset-0 z-0 h-screen w-full bg-[#07090e]">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <Canvas
              dpr={[1, 1.6]}
              camera={{ fov: 58, near: 0.1, far: 620, position: [0, 52, 46] }}
              gl={{ antialias: true, powerPreference: "high-performance" }}
            >
              <CityScene />
              <ThoughtNodes filter={filter} openId={openId} onOpen={setOpenId} />
            </Canvas>
          </Suspense>
        </ClientOnly>
        {/* vignette keeps overlay typography legible over the skyline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(78%_62%_at_50%_46%,transparent_0%,rgb(0_0_0/72%)_100%)]"
        />
      </div>

      {/* minimal floating chrome */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 pt-4 sm:px-7 sm:pt-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full border border-primary/30">
            <Heart className="size-3.5 fill-primary/70 text-primary" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-base tracking-tight text-cream">
              Unspoken
            </span>
            <span className="mt-1 truncate text-[0.52rem] uppercase tracking-[0.26em] text-primary/70">
              Dil Ki Baat · aapkamentor.ai
            </span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AudioToggle />
          <HelpModal />
        </div>
      </header>

      <StageText p={p} />
      <FilterRail p={p} filter={filter} onFilter={setFilter} />
      <ScrollSpine p={p} />

      {/* scroll hint */}
      <AnimatePresence>
        {p < 0.04 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex flex-col items-center gap-2"
          >
            <span className="text-[0.58rem] uppercase tracking-[0.4em] text-primary/70">
              Scroll to enter
            </span>
            <span className="h-10 w-[1px] animate-pulse bg-gradient-to-b from-primary to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* the release panel floats in once the city turns crimson */}
      <AnimatePresence>
        {p >= 0.86 && (
          <motion.div
            key="release"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto px-4 py-24"
          >
            <ReleaseForm
              onReleased={(text) =>
                setFeed((f) => [`Someone just released: "${text.slice(0, 90)}"`, ...f].slice(0, 12))
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* live feed ticker */}
      <AnimatePresence>
        {p >= 0.86 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-cream/10 bg-background/55 py-2.5 backdrop-blur-md"
          >
            <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-14 whitespace-nowrap pl-6">
              {[...feed, ...feed].map((line, i) => (
                <span key={i} className="text-[0.68rem] tracking-wide text-muted-foreground">
                  {line}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the virtual track that scrubs the flight through the city */}
      <div aria-hidden="true" className="h-[700vh] w-full" />

      <footer className="relative z-40 border-t border-cream/10 bg-background/85 px-6 py-10 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg text-cream">You are not alone.</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              Nothing here is tied to your name, email or phone. Every thought is stored
              anonymously and reviewed with care before it becomes a window.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <HelpModal />
            <a
              href="https://www.instagram.com/dil.ki.baat.sabkesath"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-full border border-cream/12 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Instagram className="size-3.5" /> Follow
            </a>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  void navigator.share({ title: "Unspoken", url: window.location.href });
                } else {
                  void navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-2 rounded-full border border-cream/12 px-4 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center gap-4 text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" /> 100% anonymous
          </span>
          <span>© {new Date().getFullYear()} Dil Ki Baat by aapkamentor.ai</span>
        </div>
      </footer>
    </div>
  );
}
