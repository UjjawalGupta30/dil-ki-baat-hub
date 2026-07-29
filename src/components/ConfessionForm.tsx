import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

    toast.success("Your Dil Ki Baat has been heard 🤍");
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

  return (
    <form onSubmit={submit} className="space-y-8 rounded-3xl glass-panel p-6 sm:p-8">
      <div className="space-y-2">
        <Label htmlFor="content" className="font-display text-xl text-primary">
          What's on your mind?
        </Label>
        <p className="text-sm text-muted-foreground">
          A situation, a doubt, an emotion — anything. No names, no judgment.
        </p>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Likh dijiye… jo dil mein hai."
          className="resize-y"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="font-display text-xl text-primary">Is it related to…</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = categories.includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggleCategory(c)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/50 text-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-xl text-primary">
          Do you want advice, just to vent, or both?
        </legend>
        <RadioGroup value={intent} onValueChange={setIntent} className="gap-2">
          {INTENTS.map((i) => (
            <div key={i.value} className="flex items-center gap-3">
              <RadioGroupItem value={i.value} id={`intent-${i.value}`} />
              <Label htmlFor={`intent-${i.value}`} className="font-normal">
                {i.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-xl text-primary">
          How are you feeling emotionally right now?
        </legend>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Very Low</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(n)}
                aria-label={MOOD_LABELS[n]}
                aria-pressed={mood === n}
                className={`flex size-11 items-center justify-center rounded-full border transition-all ${
                  mood === n
                    ? "scale-110 border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/50 text-muted-foreground hover:bg-accent"
                }`}
              >
                <Heart className={`size-4 ${mood >= n ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Uplifted</span>
        </div>
        <p className="text-sm text-primary/80">{MOOD_LABELS[mood]}</p>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="question" className="font-display text-xl text-primary">
          Any specific question you want the community to answer?
        </Label>
        <Input
          id="question"
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="font-display text-xl text-primary">
          Do you want us to highlight your story on Instagram?
        </legend>
        <RadioGroup value={highlight} onValueChange={setHighlight} className="flex gap-6">
          {HIGHLIGHT_OPTIONS.map((h) => (
            <div key={h} className="flex items-center gap-2">
              <RadioGroupItem value={h} id={`hl-${h}`} />
              <Label htmlFor={`hl-${h}`} className="font-normal">
                {h}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="nickname" className="font-display text-xl text-primary">
          Set a "nickname" for your story
        </Label>
        <Input
          id="nickname"
          value={nickname}
          maxLength={40}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Optional — e.g. Chhoti si baat"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="chat" className="font-display text-lg text-primary">
              Open live chat with an admin / mentor
            </Label>
            <p className="text-sm text-muted-foreground">
              A private, anonymous, disappearing conversation.
            </p>
          </div>
          <Switch id="chat" checked={chatEnabled} onCheckedChange={setChatEnabled} />
        </div>
        {chatEnabled && (
          <Select value={ttl} onValueChange={setTtl}>
            <SelectTrigger>
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
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 size-4 accent-[oklch(0.769_0.129_88.3)]"
        />
        <span>
          I have read and accept the{" "}
          <a href="/terms" className="text-primary underline underline-offset-4">
            Disclaimer & Terms of Service
          </a>
          . I understand Dil Ki Baat is peer support, not therapy or emergency care, and I will not
          share personal details of others.
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Share anonymously
      </Button>
    </form>
  );
}
