/**
 * The continuous field.
 *
 * One population of points lives for the whole story. Instead of eight
 * separate illustrations cutting into each other, the same points are
 * re-targeted act by act — scattered dust becomes a neural mass, becomes a
 * skyline, becomes a loop, shatters, re-forms as a portal, stretches into a
 * bridge, then settles as a campfire plume. Because the target is interpolated
 * on a continuous 0..1 clock, every in-between scroll position is its own
 * legible frame rather than a crossfade.
 */

export const FIELD_W = 1440;
export const FIELD_H = 900;
export const FIELD_COUNT = 260;

export type Pt = { x: number; y: number };

const CX = FIELD_W / 2;
const CY = 452;

function hash(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Target position for point `i` (of `n`) in act `act` (0-indexed). */
export function fieldTarget(act: number, i: number, n: number): Pt {
  const u = i / n;
  const a = u * Math.PI * 2;
  const r1 = hash(i);
  const r2 = hash(i + 101);
  const r3 = hash(i + 202);

  switch (act) {
    // 1 — the void: sparse, cold, drifting far apart
    case 0:
      return {
        x: CX + Math.cos(a * 3.1 + r1 * 6.3) * (300 + r2 * 420),
        y: CY + Math.sin(a * 2.3 + r2 * 6.3) * (200 + r3 * 300),
      };
    // 2 — biology: two lobes of a mind
    case 1: {
      const side = i % 2 === 0 ? -1 : 1;
      const t = (Math.floor(i / 2) / (n / 2)) * Math.PI * 2;
      const rr = 120 + r1 * 46;
      return {
        x: CX + side * (60 + Math.abs(Math.cos(t)) * rr * 1.15),
        y: CY - 10 + Math.sin(t) * rr * 1.25,
      };
    }
    // 3 — industrial: a lit skyline grid
    case 2: {
      const col = i % 13;
      const row = Math.floor(i / 13);
      const bh = 240 + hash(col + 7) * 420;
      return {
        x: 96 + col * 104 + (i % 2) * 40,
        y: FIELD_H - 40 - (row % 9) * (bh / 9) - hash(i) * 12,
      };
    }
    // 4 — the cycle: a closed, relentless loop
    case 3:
      return {
        x: CX + Math.cos(a) * (214 + (i % 3) * 30),
        y: CY + Math.sin(a) * (214 + (i % 3) * 30) * 0.86,
      };
    // 5 — the unburdening: outward shatter
    case 4: {
      const d = 260 + r1 * 520;
      const ang = r2 * Math.PI * 2;
      return { x: CX + Math.cos(ang) * d, y: CY + Math.sin(ang) * d * 0.62 };
    }
    // 6 — the portal: a breathing ring with an inner spiral
    case 5: {
      if (i % 3 === 0) {
        const t = u * Math.PI * 6;
        const rr = 40 + u * 250;
        return { x: CX + Math.cos(t) * rr, y: CY + Math.sin(t) * rr * 0.76 };
      }
      return { x: CX + Math.cos(a) * 322, y: CY + Math.sin(a) * 244 };
    }
    // 7 — the bridge: a horizontal span of light
    case 6: {
      const span = (u - 0.5) * 900;
      return {
        x: CX + span,
        y: 620 - Math.cos((u - 0.5) * Math.PI) * 56 + (r1 - 0.5) * 70,
      };
    }
    // 8 — sanctuary: a warm plume rising from the fire
    default: {
      const h = r1 * r1;
      return {
        x: CX + (r2 - 0.5) * (90 + h * 420),
        y: 620 - h * 480 - r3 * 40,
      };
    }
  }
}

/** Point colour per act, as [r,g,b]. */
export const FIELD_COLORS: [number, number, number][] = [
  [127, 166, 216],
  [200, 155, 232],
  [140, 143, 163],
  [224, 138, 106],
  [226, 195, 130],
  [216, 166, 240],
  [127, 227, 192],
  [255, 179, 92],
];

export function mixColor(a: number, b: number, k: number) {
  const A = FIELD_COLORS[Math.max(0, Math.min(7, a))];
  const B = FIELD_COLORS[Math.max(0, Math.min(7, b))];
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(
    A[1] + (B[1] - A[1]) * k,
  )},${Math.round(A[2] + (B[2] - A[2]) * k)})`;
}
