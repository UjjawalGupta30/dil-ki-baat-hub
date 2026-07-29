import { useEffect, useRef, useState } from "react";
import { Send, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ttlToExpiry, TTL_OPTIONS } from "@/lib/dilkibaat";

type Message = {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
};

/** Disappearing anonymous chat, presented as a right-side sheet. */
export function ChatSheet({
  roomId,
  alias,
  ttl,
  open,
  onOpenChange,
}: {
  roomId: string;
  alias: string;
  ttl: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase.rpc("get_room_messages", { _room_id: roomId });
      if (active && data) setMessages(data as Message[]);
    };

    void load();
    const interval = window.setInterval(() => void load(), 2500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [roomId, open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_type: "user",
      message: text.slice(0, 2000),
      expires_at: ttlToExpiry(ttl),
    });
    if (error) setDraft(text);
    setSending(false);
  };

  const ttlLabel = TTL_OPTIONS.find((t) => t.value === ttl)?.label ?? "Never disappear";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border bg-background/95 p-0 backdrop-blur-xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-xl text-gradient-warm">{alias}</SheetTitle>
          <span className="glow-gold inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] text-primary">
            <Timer className="size-3" /> {ttlLabel}
          </span>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                A mentor will join shortly. Say whatever is on your heart. Nothing here is tied to
                your identity.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender_type === "admin"
                    ? "glass-card mr-auto rounded-bl-sm text-cream/90"
                    : "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                }`}
              >
                {m.message}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <form
          className="flex items-center gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Input
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say it however it comes out…"
            className="rounded-full bg-background/60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !draft.trim()}
            className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-accent"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
