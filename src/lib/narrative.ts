/**
 * The eight-act score for Dil Ki Baat.
 *
 * One normalised scroll value (0 -> 1) drives everything: the background
 * colour, the morphing vector point-cloud, the typography and the synth.
 * Every act owns exactly one eighth of the track.
 */

export const ACT_COUNT = 8;
export const ACT_SPAN = 1 / ACT_COUNT;

export type ActId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Act = {
  id: ActId;
  key: string;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  /** Background colour for this act, interpolated between neighbours. */
  bg: [number, number, number];
  /** Dominant particle colour for the act. */
  ink: [number, number, number];
  accent: [number, number, number];
};

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const ACTS: Act[] = [
  {
    id: 1,
    key: "void",
    label: "The connected void",
    eyebrow: "Act one",
    headline: "Say the thing you never say.",
    body: "We live in the most connected era in human history, yet millions go to sleep with unspoken weight.",
    bg: hexToRgb("#0B0E17"),
    ink: hexToRgb("#7FA6D8"),
    accent: hexToRgb("#FFB800"),
  },
  {
    id: 2,
    key: "biology",
    label: "The biology of pain",
    eyebrow: "Act two",
    headline: "Social pain is biology.",
    body: "Isolation once meant death. Your brain reads loneliness as a survival signal, like hunger.",
    bg: hexToRgb("#12091A"),
    ink: hexToRgb("#C89BE8"),
    accent: hexToRgb("#FF4D4D"),
  },
  {
    id: 3,
    key: "city",
    label: "The industrial drift",
    eyebrow: "Act three",
    headline: "Lost in the city lights.",
    body: "We traded tribes for cities and screens, and connection for convenience.",
    bg: hexToRgb("#170A0F"),
    ink: hexToRgb("#8C8FA3"),
    accent: hexToRgb("#FFB800"),
  },
  {
    id: 4,
    key: "loop",
    label: "The vicious cycle",
    eyebrow: "Act four",
    headline: "The overthinking loop.",
    body: "Isolation breeds overthinking. We assume the worst, then pull away before anyone can.",
    bg: hexToRgb("#1A0A0A"),
    ink: hexToRgb("#E08A6A"),
    accent: hexToRgb("#FF6B4D"),
  },
  {
    id: 5,
    key: "shatter",
    label: "The unburdening",
    eyebrow: "Act five",
    headline: "Breaking the cycle.",
    body: "Unspoken weight only shrinks when you let it out.",
    bg: hexToRgb("#2E1408"),
    ink: hexToRgb("#E2C382"),
    accent: hexToRgb("#FFD98A"),
  },
  {
    id: 6,
    key: "portal",
    label: "The venting portal",
    eyebrow: "Act six",
    headline: "Release it to the void.",
    body: "No names, no accounts, nothing traced back to you. Write it exactly the way it sits in your chest.",
    bg: hexToRgb("#140A12"),
    ink: hexToRgb("#E2C382"),
    accent: hexToRgb("#D8A6F0"),
  },
  {
    id: 7,
    key: "bridge",
    label: "The empathetic bridge",
    eyebrow: "Act seven",
    headline: "You are heard.",
    body: "When you speak your truth, you give someone else permission to do the same.",
    bg: hexToRgb("#0F1A15"),
    ink: hexToRgb("#7FE3C0"),
    accent: hexToRgb("#FFE9A8"),
  },
  {
    id: 8,
    key: "sanctuary",
    label: "The human sanctuary",
    eyebrow: "Act eight",
    headline: "A fire, and people around it.",
    body: "Open the room, stay as long as it helps, let it disappear when you are done.",
    bg: hexToRgb("#1A120B"),
    ink: hexToRgb("#FFB35C"),
    accent: hexToRgb("#FFD98A"),
  },
];

/** Confession cards that float out of the loop in Act 4. */
export const LOOP_CARDS = [
  "Ghar wale career set chahte hain, par mera dil kuch aur...",
  "What if I am wasting my 20s?",
  "I smile all day and overthink at 2 AM.",
  "Bachpan ke dost ab stranger se lagte hain...",
  "Everyone my age seems so far ahead of me.",
  "I said yes when I meant no. Again.",
] as const;

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a || 1));
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Integer act (1..8) for a normalised progress value. */
export function actIndex(progress: number): ActId {
  const i = Math.min(ACT_COUNT - 1, Math.max(0, Math.floor(progress / ACT_SPAN)));
  return (i + 1) as ActId;
}

/** Continuous act position, e.g. 3.42 means 42% through act 4. */
export function actFloat(progress: number) {
  return clamp01(progress) * ACT_COUNT;
}

/** 0 -> 1 travel inside act `id`. */
export function actLocal(progress: number, id: ActId) {
  return clamp01((progress - (id - 1) * ACT_SPAN) / ACT_SPAN);
}

/**
 * How lit an act's DOM layer is: rises as it arrives, holds, falls away.
 * Act 1 starts fully lit so the first paint is never blank.
 */
export function actAlpha(progress: number, id: ActId) {
  const s = (id - 1) * ACT_SPAN;
  const e = id * ACT_SPAN;
  const rise = id === 1 ? 1 : smoothstep(s - ACT_SPAN * 0.42, s + ACT_SPAN * 0.16, progress);
  const fall = id === ACT_COUNT ? 1 : 1 - smoothstep(e - ACT_SPAN * 0.3, e + ACT_SPAN * 0.16, progress);
  return rise * fall;
}

/** Smoothly blended background colour across the whole score. */
export function backgroundAt(progress: number) {
  const f = actFloat(progress) - 0.5;
  const i = Math.floor(f);
  const a = ACTS[Math.min(ACT_COUNT - 1, Math.max(0, i))].bg;
  const b = ACTS[Math.min(ACT_COUNT - 1, Math.max(0, i + 1))].bg;
  const t = smoothstep(0, 1, clamp01(f - i));
  return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(
    lerp(a[2], b[2], t),
  )})`;
}
