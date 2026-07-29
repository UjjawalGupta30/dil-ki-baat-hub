import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Magnetic } from "@/components/Magnetic";
import {
  CATEGORIES,
  HIGHLIGHT_OPTIONS,
  INTENTS,
  MOOD_LABELS,
  TTL_OPTIONS,
  getAnonUserId,
  saveRoom,
} from "@/lib/dilkibaat";

const schema = z.object({
  content: z
    .string()
    .trim()
    .min(10, { message: "Please share at least a sentence or two." })
    .max(5000, { message: "Please keep it under 5000 characters." }),
  community_question: z.string().trim().max(300).optional(),
  nickname: z.string().trim().max(40).optional(),
});

const STEP_LABELS = ["The weight", "What it's about", "How you feel", "How we reach you"];

export function ConfessionWizard({
  onStartChat,
}: {
  onStartChat: (room: { roomId: string; alias: string; ttl: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [intent, setIntent] = useState("Both");
  const [mood, setMood] = useState(3);
  const [question, setQuestion] = useState("");
  const [highlight, setHighlight] = useState("Maybe");
  const [nickname, setNickname] = useState("");
  const [chatEnabled, setChatEnabled] = useState(false);
  const [ttl, setTtl] = useState("24h");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const dirRef = useRef(1);
  const paneRef = useRef<HTMLDivElement>(null);

  // Slide the active step in from the direction of travel.
  useGSAP(
    () => {
      if (!paneRef.current) return;
      gsap.fromTo(
        paneRef.current,
        { x: dirRef.current * 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, ease: EASE, clearProps: "transform" },
      );
    },
    { scope: paneRef, dependencies: [step] },
  );

  const go = (next: number) => {
    if (next === step) return;
    dirRef.current = next > step ? 1 : -1;
    const el = paneRef.current;
    if (!el) return setStep(next);
    gsap.to(el, {
      x: dirRef.current * -50,
      opacity: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => setStep(next),
    });
  };

  const next = () => {
    if (step === 0 && content.trim().length < 10) {
      toast.error("A sentence or two is enough, but we need something to hold.");
      return;
    }
    go(Math.min(step + 1, 3));
  };

  const toggleCategory = (c: string) =>
    setCategories((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const submit = async () => {
    const parsed = schema.safeParse({ content, community_question: question, nickname });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!agreed) {
      toast.error("Please read and accept the disclaimer and terms first.");
      return;
    }

    setLoading(true);
    const id = crypto.randomUUID();
    const alias = `Gumnam Dost #${Math.floor(100 + Math.random() * 900)}`;

    const { error } = await supabase.from("submissions").insert({
      id,
      content: parsed.data.content,
      category: categories.length ? categories.join(", ") : "Other",
      intent,
      emotional_state: mood,
      community_question: parsed.data.community_question || null,
      highlight_on_instagram: highlight,
      nickname: parsed.data.nickname || null,
      alias,
      anon_user_id: getAnonUserId(),
      chat_enabled: chatEnabled,
      chat_ttl: ttl,
      status: "Pending",
    });
    setLoading(false);

    if (error) {
      toast.error("Could not send your story. Please try again.");
      return;
    }

    toast.success("Received. Someone will read this with care.");
    setContent("");
    setCategories([]);
    setQuestion("");
    setNickname("");
    setMood(3);
    setAgreed(false);
    dirRef.current = -1;
    setStep(0);

    if (chatEnabled) {
      saveRoom(id, alias);
      onStartChat({ roomId: id, alias, ttl });
    }
  };

  return (
    <div className="portal-shell overflow-hidden p-6 sm:p-12">
      {/* progress */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] uppercase tracking-[0.28em]">
          {STEP_LABELS.map((l, i) => (
            <button
              key={l}
              type="button"
              onClick={() => i < step && go(i)}
              className={`transition-colors duration-500 ${
                i === step
                  ? "text-primary"
                  : i < step
                    ? "text-muted-foreground hover:text-primary"
                    : "text-muted-foreground/40"
              }`}
            >
              {String(i + 1).padStart(2, "0")} {l}
            </button>
          ))}
        </div>
        <div className="mt-4 h-px w-full bg-border">
          <div
            className="h-px bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <div ref={paneRef} className="min-h-[22rem]">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] leading-tight text-cream">
                What&apos;s heavy on your heart?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start anywhere, even in the middle. Nobody sees your name, because we never ask for
                it.
              </p>
            </div>
            <Textarea
              value={content}
              maxLength={5000}
              rows={8}
              onChange={(e) => setContent(e.target.value)}
              placeholder="The thing you have not said out loud yet…"
              className="resize-y rounded-[2rem] border-0 bg-background/25 text-base leading-relaxed shadow-[inset_0_0_0_1px_oklch(0.82_0.168_78/18%)] transition-shadow duration-500 focus-visible:shadow-[inset_0_0_0_1px_oklch(0.82_0.168_78/60%),0_0_60px_-24px_oklch(0.82_0.168_78/90%)] focus-visible:ring-0"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Take your time.</span>
              <span className={content.length > 4800 ? "text-destructive" : ""}>
                {content.length} / 5000
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] leading-tight text-cream">
                What is this really about?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick as many as feel true. Naming it makes it smaller.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = categories.includes(c);
                  return (
                    <Badge
                      key={c}
                      role="button"
                      tabIndex={0}
                      aria-pressed={on}
                      onClick={() => toggleCategory(c)}
                      onKeyDown={(e) => e.key === "Enter" && toggleCategory(c)}
                      variant="outline"
                      className={`orb cursor-pointer border-0 bg-transparent px-5 py-2 text-[0.8rem] font-normal ${
                        on ? "orb-on" : "text-muted-foreground hover:text-cream"
                      }`}
                    >
                      {c}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">
                What would help most right now?
              </Label>
              <RadioGroup value={intent} onValueChange={setIntent} className="mt-3 gap-3">
                {INTENTS.map((i) => (
                  <label
                    key={i.value}
                    htmlFor={`intent-${i.value}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-400 ${
                      intent === i.value
                        ? "border-primary/45 bg-primary/10"
                        : "border-border hover:border-primary/25"
                    }`}
                  >
                    <RadioGroupItem id={`intent-${i.value}`} value={i.value} />
                    <span className="text-sm text-cream/90">{i.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] leading-tight text-cream">
                How are you feeling right now?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Honest, not brave. Nobody is grading this.
              </p>
              <div className="mt-7">
                <Slider
                  value={[mood]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([v]) => setMood(v)}
                  aria-label="Emotional state"
                />
                <div className="mt-3 flex justify-between text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Very low</span>
                  <span>Uplifted</span>
                </div>
                <p className="mt-4 font-display text-2xl italic text-gradient-warm">
                  {MOOD_LABELS[mood]}
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="q" className="text-sm text-muted-foreground">
                  Something you want people to answer?
                </Label>
                <Input
                  id="q"
                  value={question}
                  maxLength={300}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Optional"
                  className="rounded-xl bg-background/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nick" className="text-sm text-muted-foreground">
                  Give this story a name
                </Label>
                <Input
                  id="nick"
                  value={nickname}
                  maxLength={40}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Optional, only you would recognise it"
                  className="rounded-xl bg-background/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                May we share this anonymously on Instagram?
              </Label>
              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_OPTIONS.map((h) => (
                  <Badge
                    key={h}
                    role="button"
                    tabIndex={0}
                    aria-pressed={highlight === h}
                    onClick={() => setHighlight(h)}
                    onKeyDown={(e) => e.key === "Enter" && setHighlight(h)}
                    variant={highlight === h ? "default" : "outline"}
                    className={`cursor-pointer rounded-full px-4 py-1.5 font-normal ${
                      highlight === h
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-cream"
                    }`}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] leading-tight text-cream">
                Want to talk it through, live?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A private conversation with a mentor that erases itself when you choose.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-5 py-4">
              <span className="text-sm text-cream/90">Open an anonymous live chat</span>
              <Switch
                checked={chatEnabled}
                onCheckedChange={setChatEnabled}
                aria-label="Open live chat with a mentor"
              />
            </div>

            {chatEnabled && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Messages disappear after</Label>
                <Select value={ttl} onValueChange={setTtl}>
                  <SelectTrigger className="rounded-xl bg-background/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TTL_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-1"
              />
              <span>
                I have read and accept the{" "}
                <a href="/terms" className="text-primary underline underline-offset-4">
                  Disclaimer and Terms of Service
                </a>
                . I understand Dil Ki Baat is peer support, not therapy or emergency care.
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => go(Math.max(step - 1, 0))}
          disabled={step === 0}
          className="rounded-full text-muted-foreground hover:text-cream disabled:opacity-30"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>

        {step < 3 ? (
          <Magnetic strength={0.22}>
            <Button
              type="button"
              onClick={next}
              className="glow-gold rounded-full bg-primary px-7 text-primary-foreground hover:bg-accent"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          </Magnetic>
        ) : (
          <Magnetic strength={0.22}>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="glow-gold rounded-full bg-primary px-7 text-primary-foreground hover:bg-accent"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Let it out
            </Button>
          </Magnetic>
        )}
      </div>
    </div>
  );
}
