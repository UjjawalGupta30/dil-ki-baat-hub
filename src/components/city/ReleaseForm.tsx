import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CITY_CATEGORIES, EMOTION_LABELS } from "@/lib/unspoken";
import { getAnonUserId } from "@/lib/dilkibaat";
import { cityState } from "@/lib/city-state";

/** The glass release panel that floats in the crimson end of the city. */
export function ReleaseForm({ onReleased }: { onReleased: (text: string) => void }) {
  const [category, setCategory] = useState<string>("Career");
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState(2);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const text = content.trim();
    if (text.length < 10) {
      toast.error("A sentence or two is enough, but we need something to hold.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("submissions").insert({
      content: text,
      category,
      intent: "Express",
      emotional_state: Math.max(1, Math.min(5, Math.round((emotion / 5) * 4) + 1)),
      highlight_on_instagram: "Maybe",
      anon_user_id: getAnonUserId(),
      status: "Pending",
    });
    setLoading(false);
    if (error) {
      toast.error("The city could not take it just now. Please try again.");
      return;
    }
    cityState.burst += 1;
    onReleased(text);
    setContent("");
    toast.success("Released. It is a light in someone else's window now.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(16px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="release-glass mx-auto w-full max-w-xl p-5 sm:p-7"
    >
      <h2 className="font-display text-2xl text-cream sm:text-3xl">
        Leave your burden in the city.
      </h2>
      <p className="mt-1.5 text-xs text-muted-foreground">
        No names, no accounts. It becomes one more lit window for someone else.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {CITY_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3.5 py-1.5 text-[0.64rem] uppercase tracking-[0.2em] transition-all duration-300 ${
              category === c
                ? "border-primary/70 bg-primary/15 text-primary"
                : "border-cream/12 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder="Write your unspoken truth here... No names, no accounts, 100% anonymous."
        className="mt-4 resize-none border-cream/12 bg-background/40 text-sm text-cream placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
      />

      <div className="mt-5">
        <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.24em]">
          <span className="text-muted-foreground">Heavy / anxious</span>
          <span className="text-primary">{EMOTION_LABELS[emotion]}</span>
          <span className="text-muted-foreground">Relieved / hopeful</span>
        </div>
        <Slider
          value={[emotion]}
          min={0}
          max={5}
          step={1}
          onValueChange={(v) => setEmotion(v[0])}
          className="mt-3"
        />
      </div>

      <Button
        onClick={submit}
        disabled={loading}
        size="lg"
        className="mt-6 w-full rounded-full text-[0.72rem] uppercase tracking-[0.28em] glow-gold"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        Release anonymously
      </Button>
    </motion.div>
  );
}
