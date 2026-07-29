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
  "Ghar wale career set chahte hain...",
  "Ever felt alone in a crowd?",
  "Pyaar tha ya sirf comfort?",
  "Log kya kahenge?",
  "I smile all day and cry at night.",
  "Dosti mein bhi ab formality aa gayi hai.",
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
