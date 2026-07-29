import { useEffect, useRef } from "react";
import { ArrowDown, MessageCircleHeart } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { scrollControls, scrollState } from "@/lib/scroll-state";
import { ACTS, ACT_SPAN, actLocal, smoothstep, type ActId } from "@/lib/narrative";
import { ConfessionWizard } from "@/components/ConfessionWizard";
import { Magnetic } from "@/components/Magnetic";
import { Button } from "@/components/ui/button";

type Room = { roomId: string; alias: string; ttl: string };

/** One voiceover line per act, floating under the vector illustration. */
export const VOICEOVER: Record<number, string> = {
  1: "We live in the most connected time in human history, yet millions of us feel isolated.",
  2: "Loneliness is a biological warning — just like hunger.",
  3: "We traded tribes for cities and screens, and ended up overthinking alone at 2 AM.",
  4: "Isolation creates a vicious loop: we overthink, assume the worst, and pull away.",
  5: "The loop breaks the moment you say it out loud.",
  6: "No names. No accounts. Write it exactly the way it sits in your chest.",
  7: "Your truth gives someone else permission to speak.",
  8: "A fire, and people around it. Stay as long as it helps.",
};

/**
 * The typography half of the story: minimal subtitles that live directly
 * under the canvas illustration, never beside it. Eight layers share one
 * pinned viewport and are driven by a single GSAP ticker, so nothing
 * re-renders while scrolling.
 */
export function StoryOverlay({
  room,
  onStartChat,
  onReopenChat,
}: {
  room: Room | null;
  onStartChat: (room: Room) => void;
  onReopenChat: () => void;
}) {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const tick = () => {
      const p = scrollState.progress;
      ACTS.forEach((act, index) => {
        // subtitles only live inside their own act, so two lines never stack
        const start = (act.id - 1) * ACT_SPAN;
        const end = act.id * ACT_SPAN;
        const a =
          smoothstep(start - 0.004, start + 0.022, p) *
          (1 - smoothstep(end - 0.022, end + 0.004, p));
        const el = layers.current[index];
        if (el) {
          const local = actLocal(p, act.id);
          el.style.opacity = a.toFixed(3);
          el.style.transform = `translate3d(0, ${((0.5 - local) * 44).toFixed(1)}px, 0)`;
          el.style.filter = a > 0.985 ? "none" : `blur(${((1 - a) * 6).toFixed(2)}px)`;
          el.style.pointerEvents = a > 0.72 ? "auto" : "none";
          el.style.visibility = a > 0.012 ? "visible" : "hidden";
        }
        const dot = rail.current[index];
        if (dot) {
          dot.style.opacity = (0.22 + a * 0.78).toFixed(3);
          dot.style.transform = `scaleX(${(0.4 + a * 0.6).toFixed(3)})`;
        }
      });
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const setLayer = (i: number) => (el: HTMLDivElement | null) => {
    layers.current[i] = el;
  };
  const goToAct = (id: ActId) => scrollControls.to((id - 1) * ACT_SPAN + ACT_SPAN * 0.45);

  return (
    <div
      id="pinned-viewport"
      className="pointer-events-none sticky top-0 z-10 h-[100svh] w-full overflow-hidden"
    >
      {/* ACT 1 — title card under the spotlight */}
      <Sub ref={setLayer(0)}>
        <h1 className="font-display text-[clamp(1.9rem,4.6vw,3.4rem)] font-light leading-tight text-primary">
          Say the thing you never say.
        </h1>
        <Line>{VOICEOVER[1]}</Line>
        <p className="mt-5 inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.32em] text-primary/70">
          <ArrowDown className="size-3.5 animate-bounce" /> scroll to begin
        </p>
      </Sub>

      <Sub ref={setLayer(1)}>
        <Line lead>{VOICEOVER[2]}</Line>
      </Sub>

      <Sub ref={setLayer(2)}>
        <Line lead>{VOICEOVER[3]}</Line>
      </Sub>

      <Sub ref={setLayer(3)}>
        <Line lead>{VOICEOVER[4]}</Line>
      </Sub>

      <Sub ref={setLayer(4)}>
        <Line lead>{VOICEOVER[5]}</Line>
        <Magnetic>
          <Button
            size="lg"
            onClick={() => goToAct(6)}
            className="pointer-events-auto mt-6 rounded-full bg-primary px-8 text-primary-foreground hover:bg-accent"
          >
            Start writing
          </Button>
        </Magnetic>
      </Sub>

      {/* ACT 6 — the form lives inside the portal, dead centre */}
      <div
        ref={setLayer(5)}
        className="absolute inset-0 flex items-center justify-center px-4 will-change-transform"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        <div className="max-h-[78svh] w-full max-w-xl overflow-y-auto px-1 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary/70">
            Write what&apos;s heavy on your heart
          </p>
          <ConfessionWizard onStartChat={onStartChat} />
        </div>
      </div>

      <Sub ref={setLayer(6)}>
        <Line lead>{VOICEOVER[7]}</Line>
      </Sub>

      <Sub ref={setLayer(7)}>
        <Line lead>{VOICEOVER[8]}</Line>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {room ? (
            <Magnetic>
              <Button
                size="lg"
                onClick={onReopenChat}
                className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-accent"
              >
                <MessageCircleHeart className="size-4" /> Open your room · {room.alias}
              </Button>
            </Magnetic>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={() => goToAct(6)}
              className="rounded-full border-primary/40 bg-primary/10 px-7 text-primary hover:bg-primary/20 hover:text-cream"
            >
              Write yours first
            </Button>
          )}
        </div>
      </Sub>

      {/* act rail */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:gap-2">
        {ACTS.map((act, i) => (
          <button
            key={act.id}
            type="button"
            aria-label={`Go to ${act.label}`}
            onClick={() => goToAct(act.id)}
            className="p-2"
          >
            <span
              ref={(el) => {
                rail.current[i] = el;
              }}
              className="block h-px w-4 origin-left bg-primary sm:w-8"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Line({ children, lead }: { children: React.ReactNode; lead?: boolean }) {
  return (
    <p
      className={`mx-auto max-w-2xl text-balance leading-relaxed text-cream/85 ${
        lead
          ? "font-display text-[clamp(1.15rem,2.7vw,1.9rem)] font-light"
          : "mt-4 text-sm sm:text-base text-cream/70"
      }`}
    >
      {children}
    </p>
  );
}

const Sub = ({
  ref,
  children,
}: {
  ref: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) => (
  <div
    ref={ref}
    className="absolute inset-x-0 bottom-[9svh] flex flex-col items-center px-5 text-center will-change-transform"
    style={{ opacity: 0, visibility: "hidden" }}
  >
    {children}
  </div>
);
