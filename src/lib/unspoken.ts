/**
 * "Unspoken: The City of Anonymous Thoughts"
 * Content matrix + procedural city description shared by the 3D scene and the
 * HTML overlay, so both layers always agree on what lives behind which window.
 */

export const CITY_CATEGORIES = [
  "Career",
  "Relationships",
  "Family",
  "Self-Doubt",
  "Loneliness",
  "Ambition",
] as const;

export type CityCategory = (typeof CITY_CATEGORIES)[number];

export const FILTERS = ["All", "Career", "Relationships", "Family", "Self-Doubt"] as const;

export type Thought = {
  id: string;
  category: CityCategory;
  label: string;
  text: string;
  /** where the window sits in the city, in world units */
  pos: [number, number, number];
};

export const THOUGHTS: Thought[] = [
  {
    id: "t1",
    category: "Career",
    label: "Career & Pressure",
    text: "3rd UPSC attempt. Dad sold his land to fund my coaching. I haven't slept in months, acting like everything is fine.",
    pos: [-9.6, 14, -26],
  },
  {
    id: "t2",
    category: "Career",
    label: "Career & Pressure",
    text: "Making 28 LPA in IT, but relatives think I 'just press buttons all day'. The burnout is destroying my health.",
    pos: [10.2, 22, -44],
  },
  {
    id: "t3",
    category: "Relationships",
    label: "Relationships & Marriage",
    text: "31 and unmarried. Every single family gathering feels like a public trial where I am guilty.",
    pos: [-10.2, 26, -58],
  },
  {
    id: "t4",
    category: "Relationships",
    label: "Relationships & Marriage",
    text: "We haven't spoken a warm word in 3 years, but staying in this marriage because 'Log Kya Kahenge'.",
    pos: [9.8, 11, -70],
  },
  {
    id: "t5",
    category: "Relationships",
    label: "Relationships & Marriage",
    text: "In love with someone from another caste. I am suppressing it forever just to keep peace at home.",
    pos: [-9.8, 33, -84],
  },
  {
    id: "t6",
    category: "Self-Doubt",
    label: "Self-Doubt & Double Life",
    text: "Living a complete double life. The person my parents think I am doesn't exist at all.",
    pos: [10.4, 18, -96],
  },
  {
    id: "t7",
    category: "Self-Doubt",
    label: "Self-Doubt & Double Life",
    text: "Everyone comes to me for advice and financial help. No one ever asks if I am doing okay.",
    pos: [-10.4, 9, -110],
  },
  {
    id: "t8",
    category: "Family",
    label: "Family & Financial Burden",
    text: "Supporting 5 family members on 1 salary. My personal dreams died the day I signed my offer letter.",
    pos: [9.6, 29, -122],
  },
  {
    id: "t9",
    category: "Family",
    label: "Family & Financial Burden",
    text: "Sacrificed my art scholarship so my elder brother could clear his loans.",
    pos: [-9.6, 20, -136],
  },
  {
    id: "t10",
    category: "Loneliness",
    label: "Loneliness",
    text: "1,200 contacts on WhatsApp, but zero people I can call when I break down at 2 AM.",
    pos: [10.2, 13, -150],
  },
  {
    id: "t11",
    category: "Loneliness",
    label: "Loneliness",
    text: "I am the funniest person in every room and the quietest one in my own head.",
    pos: [-10.2, 30, -164],
  },
];

export const CATEGORY_ICON: Record<CityCategory, string> = {
  Career: "briefcase",
  Relationships: "heart",
  Family: "users",
  "Self-Doubt": "brain",
  Loneliness: "moon",
  Ambition: "flame",
};

/** Deterministic pseudo random so the skyline is identical on server and client. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Building = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tank: boolean;
  balconies: number;
};

/** Two rows of towers flanking a central alleyway the camera flies down. */
export function buildCity(count = 56): Building[] {
  const rnd = seeded(20260804);
  const out: Building[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    const depth = 3.6 + rnd() * 3.4;
    const width = 4.4 + rnd() * 3.6;
    out.push({
      x: side * (9.5 + rnd() * (row % 3 === 0 ? 12 : 3)),
      z: -8 - row * 11.5 - rnd() * 3,
      w: width,
      d: depth,
      h: 14 + rnd() * 44,
      tank: rnd() > 0.35,
      balconies: Math.floor(rnd() * 4),
    });
  }
  return out;
}

export const TICKER_LINES = [
  "Someone in Pune just released: \"I am tired in a way sleep does not fix.\"",
  "Someone in Delhi just released: \"I said yes when I meant no. Again.\"",
  "Someone in Kochi just released: \"My parents want a life I never picked.\"",
  "Someone in Jaipur just released: \"I miss a person who was not good for me.\"",
  "Someone in Kolkata just released: \"Everyone my age seems so far ahead of me.\"",
  "Someone in Indore just released: \"I smile all day and overthink at 2 AM.\"",
];

export const EMOTION_LABELS = ["Heavy", "Anxious", "Numb", "Lighter", "Relieved", "Hopeful"];
