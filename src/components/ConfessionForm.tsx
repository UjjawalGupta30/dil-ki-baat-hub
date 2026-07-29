import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

function Ask({
  children,
  hint,
  htmlFor,
}: {
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block font-display text-[1.35rem] italic leading-snug text-ink"
      >
        {children}
      </label>
      {hint && <p className="text-sm text-ink/55">{hint}</p>}
    </div>
  );
}

export function ConfessionForm({
  onStartChat,
}: {
  onStartChat: (room: { roomId: string; alias: string; ttl: string }) => void;
}) {
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

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      content,
      community_question: question,
      nickname,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!agreed) {
      toast.error("Please read and accept the disclaimer & terms first.");
      return;
    }

    setLoading(true);
    const id = crypto.randomUUID();
    const alias = `Anonymous Friend #${Math.floor(100 + Math.random() * 900)}`;

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

    toast.success("Received. Someone will read this with care \u{1F90D}");
    setContent("");
    setCategories([]);
    setQuestion("");
    setNickname("");
    setMood(3);
    setAgreed(false);

    if (chatEnabled) {
      saveRoom(id, alias);
      onStartChat({ roomId: id, alias, ttl });
    }
  };

  const pill = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm transition-all duration-300 ${
      active
        ? "bg-ink text-cream shadow-sm"
        : "bg-ink/[0.06] text-ink/75 hover:bg-ink/[0.12] hover:text-ink"
    }`;

  return (
    <form onSubmit={submit} className="space-y-11 text-ink">
      <div className="space-y-3">
        <Ask
          htmlFor="content"
          hint="There's no right way to start. A sentence is enough. So is a page."
        >
          What&apos;s sitting heavy today?
        </Ask>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Start anywhere, even in the middle."
          className="ink-line w-full resize-y px-0 py-3 text-lg leading-relaxed text-ink placeholder:text-ink/35"
        />
        <p className="text-xs text-ink/45">
          Nobody sees your name, because we never ask for it.
        </p>
      </div>


      <fieldset className="space-y-3">
        <legend className="font-display text-[1.35rem] italic text-ink">
          What is this really about?
        </legend>
        <p className="text-sm text-ink/55">Pick as many as feel true. Naming it helps.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggleCategory(c)}
              aria-pressed={categories.includes(c)}
              className={pill(categories.includes(c))}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-[1.35rem] italic text-ink">
          What would help most right now?
        </legend>
        <p className="text-sm text-ink/55">
          You are allowed to want nothing but a listener.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {INTENTS.map((i) => (
            <button
              type="button"
              key={i.value}
              onClick={() => setIntent(i.value)}
              aria-pressed={intent === i.value}
              className={pill(intent === i.value)}
            >
              {i.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-[1.35rem] italic text-ink">
          Where are you on the scale today?
        </legend>
        <p className="text-sm text-ink/55">Honest, not brave. Nobody is grading this.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-1">
          <span className="text-xs uppercase tracking-widest text-ink/45">Very low</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(n)}
                aria-label={MOOD_LABELS[n]}
                aria-pressed={mood === n}
                className={`grid size-11 place-items-center rounded-full transition-all duration-300 ${
                  mood >= n
                    ? "scale-105 bg-ember/15 text-ember"
                    : "bg-ink/[0.06] text-ink/35 hover:bg-ink/[0.12]"
                }`}
              >
                <Heart className={`size-4 ${mood >= n ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
          <span className="text-xs uppercase tracking-widest text-ink/45">Uplifted</span>
        </div>
        <p className="font-display text-lg italic text-ember">{MOOD_LABELS[mood]}</p>
      </fieldset>

      <div className="space-y-2">
        <Ask htmlFor="question" hint="One question is often enough to unlock the right reply.">
          Is there something you want people to answer?
        </Ask>
        <input
          id="question"
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Optional"
          className="ink-line w-full px-0 py-2.5 text-ink placeholder:text-ink/35"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="font-display text-[1.35rem] italic text-ink">
          May we share this story (anonymously) on Instagram?
        </legend>
        <p className="text-sm text-ink/55">
          Only your words travel. Never a name, never a hint of you.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {HIGHLIGHT_OPTIONS.map((h) => (
            <button
              type="button"
              key={h}
              onClick={() => setHighlight(h)}
              aria-pressed={highlight === h}
              className={pill(highlight === h)}
            >
              {h}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Ask htmlFor="nickname" hint="A quiet way to find your own story later.">
          Give this story a name
        </Ask>
        <input
          id="nickname"
          value={nickname}
          maxLength={40}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Optional, something only you would recognise"
          className="ink-line w-full px-0 py-2.5 text-ink placeholder:text-ink/35"
        />
      </div>

      <div className="space-y-4 border-t border-ink/15 pt-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <p className="font-display text-[1.2rem] italic text-ink">
              Would you like to talk it through, live?
            </p>
            <p className="text-sm text-ink/55">
              A private conversation with a mentor that erases itself when you choose.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={chatEnabled}
            aria-label="Open live chat with a mentor"
            onClick={() => setChatEnabled((v) => !v)}
            className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
              chatEnabled ? "bg-ember" : "bg-ink/20"
            }`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-cream transition-all duration-300 ${
                chatEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {chatEnabled && (
          <div className="flex flex-wrap gap-2">
            {TTL_OPTIONS.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setTtl(t.value)}
                aria-pressed={ttl === t.value}
                className={pill(ttl === t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[oklch(0.655_0.132_42)]"
        />
        <span>
          I have read and accept the{" "}
          <a
            href="/terms"
            className="text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember"
          >
            Disclaimer &amp; Terms of Service
          </a>
          . I understand Dil Ki Baat is peer support, not therapy or emergency care, and I will not
          share personal details of others.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-full bg-ink px-8 py-4 font-display text-lg italic text-cream transition-transform duration-500 hover:scale-[1.015] disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-plum via-ember to-plum opacity-70 transition-transform duration-700 group-hover:translate-x-0" />
        <span className="relative inline-flex items-center justify-center gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Let it out
        </span>
      </button>
    </form>
  );
}
