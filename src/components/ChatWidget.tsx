import { useEffect, useRef, useState } from "react";
import { Send, Timer, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ttlToExpiry, TTL_OPTIONS } from "@/lib/dilkibaat";

type Message = {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
};

export function ChatWidget({
  roomId,
  alias,
  ttl,
  onClose,
}: {
  roomId: string;
  alias: string;
  ttl: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase.rpc("get_room_messages", { _room_id: roomId });
      if (active && data) setMessages(data as Message[]);
    };

    void load();
    const interval = window.setInterval(() => void load(), 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [roomId]);


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
    <div className="fixed bottom-4 right-4 z-50 flex h-[30rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl glass-panel">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-display text-lg leading-tight text-primary">{alias}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="size-3" /> {ttlLabel}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
          <X className="size-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              A mentor will join shortly. Say whatever is on your heart — nothing here is tied to
              your identity.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.sender_type === "admin"
                  ? "cream-card mr-auto rounded-bl-sm"
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
        />
        <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
