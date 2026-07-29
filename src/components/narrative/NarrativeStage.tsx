import { useEffect, useRef } from "react";
import { ArrowDown, MessageCircleHeart } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { scrollControls, scrollState } from "@/lib/scroll-state";
import { ACTS, ACT_SPAN, actAlpha, actLocal, LOOP_CARDS, type ActId } from "@/lib/narrative";
import { ConfessionWizard } from "@/components/ConfessionWizard";
import { Magnetic } from "@/components/Magnetic";
import { Button } from "@/components/ui/button";

type Room = { roomId: string; alias: string; ttl: string };

/**
 * The DOM half of the story.
 *
 * Eight layers live inside one pinned viewport. None of them mount or
 * unmount while scrolling: a single GSAP ticker writes opacity, translation
 * and pointer-events straight onto the nodes, so the text glides in and out
 * of the vector canvas without a single React re-render.
 */
export function NarrativeStage({
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
  const caption = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastLabel = "";

    const tick = () => {
      const p = scrollState.progress;

      ACTS.forEach((act, index) => {
        const el = layers.current[index];
        if (!el) return;
        const a = actAlpha(p, act.id);
        const local = actLocal(p, act.id);
        el.style.opacity = a.toFixed(3);
        el.style.transform = `translate3d(0, ${((0.5 - local) * 74).toFixed(1)}px, 0) scale(${(
          0.965 +
          a * 0.035
        ).toFixed(4)})`;
        el.style.filter = a > 0.985 ? "none" : `blur(${((1 - a) * 7).toFixed(2)}px)`;
        el.style.pointerEvents = a > 0.72 ? "auto" : "none";
        el.style.visibility = a > 0.012 ? "visible" : "hidden";

        const dot = rail.current[index];
        if (dot) {
          dot.style.opacity = (0.22 + a * 0.78).toFixed(3);
          dot.style.transform = `scaleX(${(0.4 + a * 0.6).toFixed(3)})`;
        }
      });

      const current = ACTS[Math.min(7, Math.floor(p / ACT_SPAN))];
      if (caption.current && current.label !== lastLabel) {
        lastLabel = current.label;
        caption.current.textContent = current.label;
      }
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
      className="pointer-events-none sticky top-0 z-10 flex h-[100svh] w-full flex-col justify-between overflow-hidden p-5 sm:p-8 md:p-12"
    >
      <div className="relative flex-1">
        {/* ACT 1 — the connected void */}
        <ActLayer ref={setLayer(0)} act={ACTS[0]}>
          <h1 className="font-display text-[clamp(2.4rem,7.6vw,5.6rem)] font-light leading-[0.98] text-cream">
            Say the thing
            <span className="block italic text-primary">you never say.</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-cream/70 sm:text-lg">
            {ACTS[0].body}
          </p>
          <p className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-primary/70">
            <ArrowDown className="size-3.5 animate-bounce" /> scroll to begin the story
          </p>
        </ActLayer>

        {/* ACT 2 — the biology of pain */}
        <ActLayer ref={setLayer(1)} act={ACTS[1]}>
          <Heading>Loneliness is not weakness. It is an alarm.</Heading>
          <Body>{ACTS[1].body}</Body>
          <Body muted>
            The ache you feel at 2 AM is the same circuitry that once kept your ancestors close to
            the fire. It is old, it is loud, and it is not your fault.
          </Body>
        </ActLayer>

        {/* ACT 3 — the industrial drift */}
        <ActLayer ref={setLayer(2)} act={ACTS[2]}>
          <Heading>We built cities, and forgot the fire.</Heading>
          <Body>{ACTS[2].body}</Body>
          <ul className="mt-6 space-y-2 text-sm text-cream/60 sm:text-base">
            <li>A thousand contacts. Nobody to call at 2 AM.</li>
            <li>Every window lit. Every window separate.</li>
            <li>We answer “how are you?” before we ever ask ourselves.</li>
          </ul>
        </ActLayer>

        {/* ACT 4 — the vicious cycle */}
        <ActLayer ref={setLayer(3)} act={ACTS[3]}>
          <Heading>Then the loop starts.</Heading>
          <Body>{ACTS[3].body}</Body>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {LOOP_CARDS.map((line) => (
              <span
                key={line}
                className="glass-card rounded-full px-4 py-2 text-xs text-cream/75 transition-colors duration-500 hover:text-cream sm:text-sm"
              >
                {line}
              </span>
            ))}
          </div>
        </ActLayer>

        {/* ACT 5 — the unburdening */}
        <ActLayer ref={setLayer(4)} act={ACTS[4]}>
          <Heading>The loop breaks the moment you say it out loud.</Heading>
          <Body>{ACTS[4].body}</Body>
          <Magnetic>
            <Button
              size="lg"
              onClick={() => goToAct(6)}
              className="pointer-events-auto mt-8 rounded-full bg-primary px-8 text-primary-foreground hover:bg-accent"
            >
              Start writing
            </Button>
          </Magnetic>
        </ActLayer>

        {/* ACT 6 — the venting portal */}
        <ActLayer ref={setLayer(5)} act={ACTS[5]} wide>
          <div className="mx-auto w-full max-w-2xl text-left">
            <Heading small>Release it to the void.</Heading>
            <p className="mt-3 max-w-xl text-sm text-cream/65 sm:text-base">{ACTS[5].body}</p>
            <div className="mt-6 max-h-[54svh] overflow-y-auto pr-1">
              <ConfessionWizard onStartChat={onStartChat} />
            </div>
          </div>
        </ActLayer>

        {/* ACT 7 — the empathetic bridge */}
        <ActLayer ref={setLayer(6)} act={ACTS[6]}>
          <Heading>Someone on the other side has stood exactly here.</Heading>
          <Body>{ACTS[6].body}</Body>
          <Body muted>
            Every story that lands here is read by a real person. Not a bot, not a feed, not an
            algorithm deciding whether your pain performs well.
          </Body>
        </ActLayer>

        {/* ACT 8 — the human sanctuary */}
        <ActLayer ref={setLayer(7)} act={ACTS[7]}>
          <Heading>You made it to the fire.</Heading>
          <Body>{ACTS[7].body}</Body>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
            <span className="text-xs text-cream/50">
              Nothing here is tied to your name, ever.
            </span>
          </div>
        </ActLayer>
      </div>

      {/* act rail */}
      <div className="pointer-events-auto relative flex items-end justify-between gap-6">
        <span
          ref={caption}
          className="text-[0.62rem] uppercase tracking-[0.3em] text-cream/45 sm:text-xs"
        >
          {ACTS[0].label}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {ACTS.map((act, i) => (
            <button
              key={act.id}
              type="button"
              aria-label={`Go to ${act.label}`}
              onClick={() => goToAct(act.id)}
              className="group p-1.5"
            >
              <span
                ref={(el) => {
                  rail.current[i] = el;
                }}
                className="block h-px w-6 origin-left bg-primary transition-colors duration-500 sm:w-9"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Heading({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <h2
      className={`font-display font-light leading-[1.04] text-cream ${
        small
          ? "text-[clamp(1.6rem,3.6vw,2.6rem)]"
          : "text-[clamp(1.9rem,5.4vw,4.1rem)]"
      }`}
    >
      {children}
    </h2>
  );
}

function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p
      className={`mt-5 max-w-xl text-balance leading-relaxed ${
        muted ? "text-sm text-cream/55 sm:text-base" : "text-base text-cream/75 sm:text-lg"
      }`}
    >
      {children}
    </p>
  );
}

const ActLayer = ({
  ref,
  act,
  wide,
  children,
}: {
  ref: (el: HTMLDivElement | null) => void;
  act: (typeof ACTS)[number];
  wide?: boolean;
  children: React.ReactNode;
}) => (
  <div
    ref={ref}
    data-act={act.id}
    className={`absolute inset-0 flex flex-col justify-center will-change-transform ${
      wide ? "items-center text-center sm:text-left" : "items-start"
    }`}
    style={{ opacity: 0, visibility: "hidden" }}
  >
    <div className={wide ? "w-full" : "max-w-3xl"}>
      {!wide && (
        <span className="mb-4 block text-[0.62rem] uppercase tracking-[0.34em] text-primary/70">
          {act.eyebrow}
        </span>
      )}
      {children}
    </div>
  </div>
);
