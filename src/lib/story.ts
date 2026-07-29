/**
 * The five-act scroll score. Every act owns a slice of the normalised
 * document progress (0 -> 1) and both the WebGL engine and the DOM overlay
 * read from this single source so picture, type and sound stay locked.
 */
export const ACTS = {
  monolith: [0.0, 0.2],
  shatter: [0.2, 0.4],
  echoes: [0.4, 0.6],
  assembly: [0.6, 0.8],
  sanctuary: [0.8, 1.0],
} as const;

/** Scroll positions where a tactile sound fires. */
export const MILESTONES = [0.22, 0.45, 0.75];

/** Real human scripts that drift through Act 3 at different Z depths. */
export const ECHOES = [
  {
    text: "Sab bolte hain package accha hai... par andar se main roz marr raha hoon.",
    depth: 0,
    lane: -0.34,
    speed: 420,
    chime: 440,
  },
  {
    text: "I spent 4 years studying what my parents wanted. Now I don't even know what I want.",
    depth: 1,
    lane: 0.3,
    speed: 300,
    chime: 494,
  },
  {
    text: "Ghar walo ki ummeedon ka weight itna zyada hai ki mera apna koi sapna baaki nahi raha.",
    depth: 2,
    lane: -0.22,
    speed: 640,
    chime: 554,
  },
  {
    text: "I have 1,200 followers, 4 active WhatsApp group chats, and no one I can call at 2 AM.",
    depth: 0,
    lane: 0.36,
    speed: 500,
    chime: 659,
  },
  {
    text: "Everyone thinks I'm thriving because of my Instagram stories. I haven't left my room in 3 days.",
    depth: 1,
    lane: -0.3,
    speed: 360,
    chime: 740,
  },
  {
    text: "We live in the same house, sleep in the same bed, but we haven't actually spoken in months.",
    depth: 2,
    lane: 0.24,
    speed: 700,
    chime: 880,
  },
  {
    text: "Pyaar tha ya sirf akelapan door karne ka ek bahana? Mujhe khud nahi pata.",
    depth: 1,
    lane: -0.02,
    speed: 250,
    chime: 988,
  },
] as const;

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a || 1));
  return t * t * (3 - 2 * t);
}

/** How lit an act is at a given progress: rises in, holds, falls away. */
export function actAlpha(progress: number, range: readonly [number, number]) {
  const [s, e] = range;
  const rise = s <= 0 ? 1 : smoothstep(s - 0.08, s + 0.02, progress);
  const fall = e >= 1 ? 1 : 1 - smoothstep(e - 0.04, e + 0.05, progress);
  return rise * fall;
}

/** 0 -> 1 travel inside an act. */
export function actLocal(progress: number, range: readonly [number, number]) {
  return clamp01((progress - range[0]) / (range[1] - range[0]));
}
