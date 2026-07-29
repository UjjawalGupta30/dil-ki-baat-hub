export const CATEGORIES = [
  "Relationship",
  "Career",
  "Family",
  "Anxiety",
  "Self thoughts",
  "Social taboos",
  "Confusion",
  "Other",
] as const;

/** The marquee strip: things people actually carry, said the way they say it. */
export const HINGLISH_THOUGHTS = [
  "Ghar wale career set chahte hain, par mera dil kuch aur keh raha hai...",
  "What if I am wasting my twenties?",
  "Bachpan ke dost ab stranger se lagte hain... is it normal?",
  "I smile all day and overthink at 2 AM.",
  "Pyaar tha ya sirf comfort? Samjh nahi aata.",
  "Everyone my age seems so far ahead of me.",
  "Sabko lagta hai main strong hoon. Nobody asks twice.",
  "I said yes when I meant no. Again.",
];

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
  "Everyone thinks I am the strong one.",
  "I smile all day and cry at night.",
  "I do not know who I am without them.",
  "My parents want a life I never picked.",
  "Everyone my age seems so far ahead.",
  "I said yes when I meant no. Again.",
  "What if I am wasting my twenties?",
  "I miss a person who was not good for me.",
  "I am tired in a way sleep does not fix.",
];

/** Short anonymous lines shown on the wall. Illustrative, no identifying detail. */
export const WHISPERS = [
  {
    text: "I told my family I was fine for two years. Writing it here was the first time I said otherwise.",
    tag: "Family",
  },
  {
    text: "I was not looking for answers. I just needed one person to read it and not flinch.",
    tag: "Self",
  },
  {
    text: "Someone replied with the exact thing I had been afraid to admit to myself.",
    tag: "Relationship",
  },
  {
    text: "The chat disappeared after an hour. Somehow that made it easier to be honest.",
    tag: "Anxiety",
  },
];

/** Why writing it down actually works. Short, plainly worded. */
export const WHY_IT_WORKS = [
  {
    k: "Naming it",
    t: "Words make a feeling smaller",
    d: "The moment a heavy feeling becomes a sentence, it stops being an ocean and starts having edges.",
  },
  {
    k: "Being witnessed",
    t: "Being read beats being fixed",
    d: "Most of us do not need a solution. We need proof that someone actually received it.",
  },
  {
    k: "Distance",
    t: "No name, no editing yourself",
    d: "When nobody can link the story to your face, you finally write the honest version.",
  },
  {
    k: "Perspective",
    t: "Someone has stood here before",
    d: "They will tell you what they would do differently, and it costs you nothing to ask.",
  },
];

export const FAQS = [
  {
    q: "Will anyone know it was me?",
    a: "No. We never ask for your name, email or phone number, and nothing is ever linked back to you.",
  },
  {
    q: "Do I have to be in crisis to write?",
    a: "Not at all. A restless week, a friendship that changed, a decision you keep postponing. All of it belongs here.",
  },
  {
    q: "What if I do not want advice?",
    a: "Then say so. You can choose to simply be heard, and nobody will hand you a lesson you did not ask for.",
  },
  {
    q: "Is this therapy?",
    a: "No. This is peer support and honest perspective. If you are in danger, please call a helpline. They are listed on every page.",
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
