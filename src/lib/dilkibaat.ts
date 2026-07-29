export const CATEGORIES = [
  "Relationship",
  "Love",
  "Family",
  "Anxiety",
  "Self thoughts",
  "Social taboos",
  "Confusion",
  "Other",
] as const;

export const INTENTS = [
  { value: "Advice", label: "I want advice" },
  { value: "Express", label: "I just want to express" },
  { value: "Both", label: "Both" },
] as const;

export const HIGHLIGHT_OPTIONS = ["Yes", "No", "Maybe"] as const;

export const TTL_OPTIONS = [
  { value: "1h", label: "Disappear in 1 hour" },
  { value: "24h", label: "Disappear in 24 hours" },
  { value: "never", label: "Never disappear" },
] as const;

export const MOOD_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Okay",
  4: "Better",
  5: "Uplifted",
};

export const AMBIENT_PROMPTS = [
  "I keep choosing everyone else first.",
  "Ever felt alone in a crowded room?",
  "Was it love, or was it just comfort?",
  "Everyone thinks I'm the strong one.",
  "I smile all day and cry at night.",
  "I don't know who I am without them.",
];

/** Short anonymous lines shown on the wall — no identifying detail, illustrative. */
export const WHISPERS = [
  {
    text: "I told my family I'm fine for two years. Writing it here was the first time I said otherwise.",
    tag: "Family · 2 min read",
  },
  {
    text: "I wasn't looking for answers. I just needed one person to read it and not flinch.",
    tag: "Self · Anonymous",
  },
  {
    text: "Someone replied with the exact thing I'd been afraid to admit to myself. It helped.",
    tag: "Relationship · Anonymous",
  },
  {
    text: "The chat disappeared after an hour. Somehow that made it easier to be honest.",
    tag: "Anxiety · Anonymous",
  },
];

/** Why writing it down actually works — grounded, plainly worded. */
export const WHY_IT_WORKS = [
  {
    k: "Naming it",
    t: "Putting feelings into words calms them",
    d: "Psychologists call it affect labelling. The moment a vague, heavy feeling becomes a sentence, it stops being an ocean and becomes something with edges — something you can look at.",
  },
  {
    k: "Being witnessed",
    t: "Being read matters more than being fixed",
    d: "Most of us don't need a solution. We need proof that someone received what we said. A single honest response can undo weeks of feeling invisible.",
  },
  {
    k: "Distance",
    t: "Anonymity removes the cost of honesty",
    d: "When no one can attach your story to your face, you stop editing yourself. What comes out is usually the version you never say out loud — and that's the version worth hearing.",
  },
  {
    k: "Perspective",
    t: "Other people's hindsight is free",
    d: "Someone has already stood where you're standing. They'll tell you what they'd do differently, and it will cost you nothing but the courage to ask.",
  },
];

export const FAQS = [
  {
    q: "Will anyone know it was me?",
    a: "No. We never ask for your name, email or phone number. Your story is stored without any identifying detail, and nothing is ever linked back to you.",
  },
  {
    q: "Do I have to be in crisis to write?",
    a: "Not at all. Small confusions deserve space too. A restless week, a friendship that changed, a decision you keep postponing — all of it belongs here.",
  },
  {
    q: "What if I don't want advice?",
    a: "Then say so. You can choose to simply be heard. Nobody will hand you a lesson you didn't ask for.",
  },
  {
    q: "Is this therapy?",
    a: "No. This is peer support and honest perspective. If you're in danger or in crisis, please reach out to a professional helpline — they're listed on every page.",
  },
];


export const HELPLINES = [
  {
    name: "Tele-MANAS (Govt. of India)",
    number: "14416",
    detail: "Free, 24×7 mental health support in 20+ Indian languages.",
    tel: "14416",
  },
  {
    name: "Vandrevala Foundation",
    number: "9999 666 555",
    detail: "24×7 free counselling helpline across India.",
    tel: "+919999666555",
  },
];

const ANON_KEY = "dkb_anon_user_id";

export function getAnonUserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

const ROOMS_KEY = "dkb_rooms";

export function saveRoom(roomId: string, alias: string) {
  if (typeof window === "undefined") return;
  const rooms = JSON.parse(window.localStorage.getItem(ROOMS_KEY) || "[]");
  window.localStorage.setItem(ROOMS_KEY, JSON.stringify([{ roomId, alias }, ...rooms].slice(0, 10)));
}

export function ttlToExpiry(ttl: string): string | null {
  if (ttl === "1h") return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  if (ttl === "24h") return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return null;
}
