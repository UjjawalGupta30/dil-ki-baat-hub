import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Instagram, LogOut, MessageCircle, Send, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, ttlToExpiry } from "@/lib/dilkibaat";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Mentor Dashboard | Dil Ki Baat" },
      {
        name: "description",
        content:
          "Review anonymous submissions, track the emotional pulse index and reply to live disappearing chats.",
      },
      { property: "og:title", content: "Mentor Dashboard | Dil Ki Baat" },
      { property: "og:description", content: "Dil Ki Baat moderation and live chat workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Submission = {
  id: string;
  created_at: string;
  content: string;
  category: string;
  intent: string;
  emotional_state: number;
  community_question: string | null;
  highlight_on_instagram: string;
  nickname: string | null;
  alias: string;
  chat_enabled: boolean;
  chat_ttl: string;
  status: string;
};

type ChatMessage = {
  id: string;
  room_id: string;
  sender_type: string;
  message: string;
  created_at: string;
};

const QUICK_REPLIES = [
  "Thank you for trusting us with this. You're safe here. 🤍",
  "That sounds really heavy. Do you want advice, or would you rather just be heard right now?",
  "You are not alone in feeling this way — many people carry the same silence.",
  "Take your time. I'm here and I'm listening.",
  "If things ever feel unbearable, please call Tele-MANAS at 14416 — free, 24×7.",
];

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setIsAdmin(false);
      const { data: ok } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(ok));
    });
  }, []);

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat_messages", activeRoom],
    enabled: isAdmin === true && !!activeRoom,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", activeRoom!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  useEffect(() => {
    if (isAdmin !== true) return;
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["chat_messages"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const chatRooms = useMemo(
    () => submissions.filter((s) => s.chat_enabled && s.status !== "Archived"),
    [submissions],
  );

  const filtered = useMemo(
    () =>
      submissions.filter(
        (s) =>
          (statusFilter === "all" || s.status === statusFilter) &&
          (categoryFilter === "all" || s.category.includes(categoryFilter)),
      ),
    [submissions, statusFilter, categoryFilter],
  );

  const pulse = submissions.length
    ? (submissions.reduce((a, s) => a + s.emotional_state, 0) / submissions.length).toFixed(2)
    : "—";

  const chartData = CATEGORIES.map((c) => ({
    name: c,
    count: submissions.filter((s) => s.category.includes(c)).length,
  })).filter((d) => d.count > 0);

  const update = async (id: string, patch: Partial<Submission>) => {
    const { error } = await supabase.from("submissions").update(patch).eq("id", id);
    if (error) return toast.error("Update failed");
    qc.invalidateQueries({ queryKey: ["submissions"] });
    toast.success("Updated");
  };

  const sendReply = async (text: string) => {
    if (!activeRoom || !text.trim()) return;
    const room = submissions.find((s) => s.id === activeRoom);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: activeRoom,
      sender_type: "admin",
      message: text.trim().slice(0, 2000),
      expires_at: ttlToExpiry(room?.chat_ttl ?? "never"),
    });
    if (error) return toast.error("Message failed");
    setDraft("");
    qc.invalidateQueries({ queryKey: ["chat_messages", activeRoom] });
  };

  if (isAdmin === null) {
    return <p className="p-10 text-center text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-primary">Mentor access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account is signed in but doesn't have the admin role yet. Ask a Dil Ki Baat owner to
          grant it.
        </p>
        <Button
          className="mt-6"
          variant="secondary"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-gradient-gold">Mentor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Dil Ki Baat · aapkamentor.ai</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total confessions", value: submissions.length, icon: Sparkles },
          { label: "Active live chats", value: chatRooms.length, icon: MessageCircle },
          { label: "Emotional pulse index", value: pulse, icon: Sparkles },
          {
            label: "Pending review",
            value: submissions.filter((s) => s.status === "Pending").length,
            icon: Archive,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-panel p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-4xl text-primary">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-2xl glass-panel p-5">
        <h2 className="font-display text-xl text-primary">Category breakdown</h2>
        <div className="mt-4 h-64">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)" }} />
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="count" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <Tabs defaultValue="submissions" className="mt-6">
        <TabsList>
          <TabsTrigger value="submissions">Submissions manager</TabsTrigger>
          <TabsTrigger value="chats">Live chat workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Pending", "Approved", "Archived"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No submissions match these filters.</p>
            )}
            {filtered.map((s) => (
              <article key={s.id} className="rounded-2xl glass-panel p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{s.alias}</Badge>
                  <Badge>{s.status}</Badge>
                  <span>{s.category}</span>
                  <span>· {s.intent}</span>
                  <span>· mood {s.emotional_state}/5</span>
                  <span>· IG: {s.highlight_on_instagram}</span>
                  <span>· {new Date(s.created_at).toLocaleString()}</span>
                </div>
                {s.nickname && (
                  <p className="mt-2 font-display text-lg text-primary">{s.nickname}</p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{s.content}</p>
                {s.community_question && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    Asks: {s.community_question}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={s.status === "Approved" ? "default" : "secondary"}
                    className="gap-2"
                    onClick={() =>
                      update(s.id, { status: s.status === "Approved" ? "Pending" : "Approved" })
                    }
                  >
                    <Instagram className="size-4" />
                    {s.status === "Approved" ? "Approved for IG" : "Approve for IG"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => update(s.id, { status: "Archived" })}
                  >
                    <Archive className="size-4" /> Archive
                  </Button>
                  {s.chat_enabled && (
                    <Button size="sm" variant="ghost" onClick={() => setActiveRoom(s.id)}>
                      Open chat
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chats" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
            <aside className="rounded-2xl glass-panel p-3">
              <p className="px-2 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Active rooms
              </p>
              <ScrollArea className="h-[28rem]">
                <div className="space-y-1 pr-2">
                  {chatRooms.length === 0 && (
                    <p className="px-2 text-sm text-muted-foreground">No open chats.</p>
                  )}
                  {chatRooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveRoom(r.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        activeRoom === r.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      <span className="block font-medium">{r.alias}</span>
                      <span className="block truncate text-xs opacity-75">{r.content}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </aside>

            <section className="flex h-[32rem] flex-col rounded-2xl glass-panel">
              {!activeRoom ? (
                <p className="m-auto text-sm text-muted-foreground">
                  Select a room to start replying.
                </p>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                            m.sender_type === "admin"
                              ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                              : "cream-card mr-auto rounded-bl-sm"
                          }`}
                        >
                          {m.message}
                        </div>
                      ))}
                      <div ref={endRef} />
                    </div>
                  </ScrollArea>

                  <div className="flex flex-wrap gap-2 border-t border-border p-3">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendReply(q)}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {q.length > 42 ? `${q.slice(0, 42)}…` : q}
                      </button>
                    ))}
                  </div>

                  <form
                    className="flex items-center gap-2 border-t border-border p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendReply(draft);
                    }}
                  >
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Reply as mentor…"
                      maxLength={2000}
                    />
                    <Button type="submit" size="icon" disabled={!draft.trim()}>
                      <Send className="size-4" />
                    </Button>
                  </form>
                </>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
