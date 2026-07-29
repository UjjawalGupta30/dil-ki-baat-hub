import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import {
  ACTS,
  LOOP_CARDS,
  actAlpha,
  actLocal,
  clamp01,
  lerp,
  smoothstep,
} from "@/lib/narrative";

/* ------------------------------------------------------------------ *
 * A hand-written 2D vector engine.
 *
 * Everything on screen — the bird, the brain, the city, the loop, the
 * embers, the portal, the bridge and the campfire — is drawn procedurally
 * with Canvas2D paths on a fixed 1200x800 stage that is scaled to fit the
 * viewport. One GSAP ticker reads the scroll clock and repaints; nothing
 * ever mounts, unmounts or re-renders while the story runs.
 * ------------------------------------------------------------------ */

const W = 1200;
const H = 800;

const GOLD = "#FFB800";
const CREAM = "#F7F4EF";
const EMBER = "#E2C382";
const CYAN = "#00E5FF";
const MAGENTA = "#FF007F";
const ALARM = "#FF4D4D";

/** Deterministic hash-noise so the server and the client agree. */
function rnd(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

type Ctx = CanvasRenderingContext2D;

/** Soft radial bloom used everywhere a light source is implied. */
function glow(c: Ctx, x: number, y: number, r: number, color: string, a: number) {
  if (a <= 0.001 || r <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, withAlpha(color, 0.55 * a));
  g.addColorStop(0.45, withAlpha(color, 0.16 * a));
  g.addColorStop(1, withAlpha(color, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

/** The recurring little bird character. */
function bird(c: Ctx, x: number, y: number, s: number, a: number, tone = CREAM) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalAlpha = a;

  // body
  c.fillStyle = withAlpha(tone, 0.92);
  c.beginPath();
  c.ellipse(0, 10, 26, 30, 0, 0, Math.PI * 2);
  c.fill();
  // head
  c.beginPath();
  c.arc(0, -22, 19, 0, Math.PI * 2);
  c.fill();
  // beak
  c.fillStyle = withAlpha(GOLD, 0.95);
  c.beginPath();
  c.moveTo(17, -22);
  c.lineTo(31, -17);
  c.lineTo(17, -13);
  c.closePath();
  c.fill();
  // feet
  c.strokeStyle = withAlpha(GOLD, 0.85);
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-9, 38);
  c.lineTo(-9, 46);
  c.moveTo(9, 38);
  c.lineTo(9, 46);
  c.stroke();
  // eye
  c.fillStyle = "rgba(11,14,23,0.9)";
  c.beginPath();
  c.arc(7, -25, 3.4, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/** A seated silhouette used for tribes, windows and the campfire circle. */
function person(c: Ctx, x: number, y: number, s: number, color: string, a: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalAlpha = a;
  c.fillStyle = color;
  c.beginPath();
  c.arc(0, -22, 9, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(-13, 12);
  c.quadraticCurveTo(-11, -12, 0, -12);
  c.quadraticCurveTo(11, -12, 13, 12);
  c.closePath();
  c.fill();
  c.restore();
}

function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ----------------------------- ACT 1 ----------------------------- */
function actVoid(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.56;

  // spotlight beam
  const beam = c.createLinearGradient(cx, cy - 420, cx, cy + 60);
  beam.addColorStop(0, withAlpha(CREAM, 0.0));
  beam.addColorStop(0.35, withAlpha(CREAM, 0.055 * a));
  beam.addColorStop(1, withAlpha(CREAM, 0.005 * a));
  c.fillStyle = beam;
  c.beginPath();
  c.moveTo(cx - 34, cy - 430);
  c.lineTo(cx + 34, cy - 430);
  c.lineTo(cx + 210, cy + 54);
  c.lineTo(cx - 210, cy + 54);
  c.closePath();
  c.fill();

  // floor pool
  glow(c, cx, cy + 46, 190, CREAM, 0.35 * a);

  // wifi rings
  for (let i = 0; i < 5; i++) {
    const phase = (t * 0.28 + i / 5) % 1;
    const r = 70 + phase * 300;
    const alpha = a * (1 - phase) * 0.7;
    c.strokeStyle = withAlpha(i % 2 ? MAGENTA : CYAN, alpha);
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy - 18, r, Math.PI * 1.12, Math.PI * 1.88);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy - 18, r, Math.PI * 0.12, Math.PI * 0.88);
    c.stroke();
  }

  bird(c, cx, cy - 6, 1.15 + local * 0.06, a);

  // drifting bubbles and hearts
  for (let i = 0; i < 12; i++) {
    const x = cx + (rnd(i) - 0.5) * 900;
    const drift = ((t * 22 + rnd(i + 9) * 700) % 760);
    const y = H + 40 - drift;
    const s = 0.6 + rnd(i + 3) * 0.7;
    const wob = Math.sin(t * 1.4 + i) * 15;
    const alpha = a * 0.55 * Math.sin(clamp01(drift / 760) * Math.PI);
    c.save();
    c.translate(x + wob, y);
    c.scale(s, s);
    c.globalAlpha = alpha;
    if (i % 3 === 0) {
      // heart
      c.fillStyle = withAlpha(MAGENTA, 0.85);
      c.beginPath();
      c.moveTo(0, 8);
      c.bezierCurveTo(-14, -3, -9, -16, 0, -9);
      c.bezierCurveTo(9, -16, 14, -3, 0, 8);
      c.fill();
    } else {
      // chat bubble
      c.strokeStyle = withAlpha(i % 3 === 1 ? CYAN : CREAM, 0.75);
      c.lineWidth = 2;
      roundRect(c, -17, -13, 34, 24, 8);
      c.stroke();
      c.beginPath();
      c.moveTo(-4, 11);
      c.lineTo(-1, 19);
      c.lineTo(6, 11);
      c.stroke();
    }
    c.restore();
  }
}

/* ----------------------------- ACT 2 ----------------------------- */
function brainPath(c: Ctx, cx: number, cy: number, s: number) {
  c.beginPath();
  for (let i = 0; i <= 90; i++) {
    const th = (i / 90) * Math.PI * 2;
    const lobe = 1 + 0.11 * Math.sin(th * 7) + 0.07 * Math.sin(th * 3 + 1.2);
    const r = 118 * lobe * s;
    const x = cx + Math.cos(th) * r * 1.18;
    const y = cy + Math.sin(th) * r * 0.92;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}

function actBiology(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.48;
  const s = lerp(0.78, 1, smoothstep(0, 0.5, local));

  // alarm rings at ~1.2Hz
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 1.2 + i / 3) % 1);
    c.strokeStyle = withAlpha(ALARM, a * (1 - ph) * 0.8);
    c.lineWidth = 3 - ph * 2;
    c.beginPath();
    c.arc(cx, cy, 140 + ph * 240, 0, Math.PI * 2);
    c.stroke();
  }
  glow(c, cx, cy, 260, ALARM, 0.5 * a * (0.6 + 0.4 * Math.sin(t * 7.5)));

  // brain
  c.save();
  c.globalAlpha = a;
  brainPath(c, cx, cy, s);
  c.fillStyle = withAlpha("#C89BE8", 0.1);
  c.fill();
  c.strokeStyle = withAlpha("#E4C9F7", 0.9);
  c.lineWidth = 2.4;
  c.stroke();
  // folds
  c.strokeStyle = withAlpha("#E4C9F7", 0.45);
  c.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    const y = cy - 60 + i * 30;
    c.moveTo(cx - 110 * s, y);
    for (let x = -110; x <= 110; x += 10) {
      c.lineTo(cx + x * s, y + Math.sin((x + i * 40) * 0.06) * 12 * s);
    }
    c.stroke();
  }
  c.restore();

  // ancestral tribes + golden ties
  const tribeIn = smoothstep(0.15, 0.7, local);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = cx + side * (330 + i * 62) - side * (1 - tribeIn) * 220;
      const y = cy + 150 + Math.sin(t * 1.1 + i) * 5;
      person(c, x, y, 1.5, withAlpha(CREAM, 0.8), a * tribeIn);
      c.strokeStyle = withAlpha(GOLD, a * tribeIn * 0.4);
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(x, y - 24);
      c.quadraticCurveTo((x + cx) / 2, cy + 40, cx, cy + 110);
      c.stroke();
    }
  }
}

/* ----------------------------- ACT 3 ----------------------------- */
function actCity(c: Ctx, a: number, local: number, t: number) {
  const scrollUp = (t * 130 + local * 900) % 220;
  c.save();
  c.globalAlpha = a;

  const towers = 9;
  for (let i = 0; i < towers; i++) {
    const bw = 84 + rnd(i) * 46;
    const x = W / 2 - (towers * 112) / 2 + i * 112 + 14;
    const top = 120 + rnd(i + 5) * 220 - local * 40;
    c.fillStyle = "rgba(16,18,30,0.92)";
    c.fillRect(x, top, bw, H - top);
    c.strokeStyle = withAlpha("#8C8FA3", 0.25);
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, top + 0.5, bw - 1, H - top);

    c.save();
    c.beginPath();
    c.rect(x, top, bw, H - top);
    c.clip();
    const cols = Math.max(2, Math.floor(bw / 30));
    for (let r = -1; r < 16; r++) {
      for (let k = 0; k < cols; k++) {
        const wx = x + 12 + k * ((bw - 20) / cols);
        const wy = top + 18 + r * 55 + scrollUp;
        const lit = rnd(i * 31 + r * 7 + k) > 0.72;
        c.fillStyle = lit ? "rgba(200,205,225,0.16)" : "rgba(140,143,163,0.07)";
        c.fillRect(wx, wy, 16, 22);
      }
    }
    c.restore();
  }
  c.restore();

  // the one warm window, fixed at centre
  const wx = W / 2 - 26;
  const wy = H * 0.44;
  glow(c, wx + 26, wy + 34, 170, GOLD, 0.85 * a);
  c.save();
  c.globalAlpha = a;
  c.fillStyle = withAlpha(GOLD, 0.85);
  c.fillRect(wx, wy, 52, 68);
  c.fillStyle = "rgba(23,10,15,0.85)";
  person(c, wx + 26, wy + 56, 1.05, "rgba(23,10,15,0.9)", 1);
  c.strokeStyle = withAlpha("#2A1A08", 0.6);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(wx + 26, wy);
  c.lineTo(wx + 26, wy + 68);
  c.moveTo(wx, wy + 34);
  c.lineTo(wx + 52, wy + 34);
  c.stroke();
  c.restore();
}

/* ----------------------------- ACT 4 ----------------------------- */
function loopRing(c: Ctx, cx: number, cy: number, r: number, spin: number, a: number) {
  c.save();
  c.translate(cx, cy);
  c.rotate(spin);
  c.globalAlpha = a;
  for (let seg = 0; seg < 2; seg++) {
    const color = seg ? ALARM : GOLD;
    const from = seg * Math.PI + 0.22;
    const to = from + Math.PI - 0.44;
    c.strokeStyle = withAlpha(color, 0.9);
    c.lineWidth = 8;
    c.lineCap = "round";
    c.beginPath();
    c.arc(0, 0, r, from, to);
    c.stroke();
    // arrow head
    const ax = Math.cos(to) * r;
    const ay = Math.sin(to) * r;
    c.save();
    c.translate(ax, ay);
    c.rotate(to + Math.PI / 2);
    c.fillStyle = withAlpha(color, 0.95);
    c.beginPath();
    c.moveTo(0, -18);
    c.lineTo(15, 12);
    c.lineTo(-15, 12);
    c.closePath();
    c.fill();
    c.restore();
  }
  c.restore();
}

function actLoop(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.5;
  glow(c, cx, cy, 300, "#FF6B4D", 0.4 * a);
  loopRing(c, cx, cy, 150, t * 0.9, a);

  // confession cards flying toward the viewer
  c.save();
  c.globalAlpha = a;
  c.textAlign = "center";
  for (let i = 0; i < LOOP_CARDS.length; i++) {
    const z = ((t * 0.16 + i / LOOP_CARDS.length + local * 0.35) % 1);
    const s = 0.2 + z * 0.72;
    const ang = rnd(i) * Math.PI * 2;
    const spread = z * 430;
    const x = cx + Math.cos(ang) * spread;
    const y = cy + Math.sin(ang) * spread * 0.52;
    const alpha = a * Math.sin(clamp01(z) * Math.PI) * 0.95;
    if (alpha <= 0.02) continue;
    c.save();
    c.translate(x, y);
    c.rotate((rnd(i + 4) - 0.5) * 0.25);
    c.scale(s, s);
    c.globalAlpha = alpha;
    c.font = "500 26px 'Nunito Sans', system-ui, sans-serif";
    // wrap first, then grow the card to fit — text can never spill out
    const words = LOOP_CARDS[i].split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      if ((line + w).length > 26) {
        lines.push(line.trim());
        line = "";
      }
      line += w + " ";
    }
    lines.push(line.trim());
    const rows = lines.length;
    const height = rows * 34 + 30;
    c.fillStyle = "rgba(247,244,239,0.94)";
    roundRect(c, -180, -height / 2, 360, height, 18);
    c.fill();
    c.fillStyle = "rgba(26,10,10,0.86)";
    lines.forEach((l, k) => c.fillText(l, 0, -height / 2 + 24 + k * 34));

    c.restore();
  }
  c.restore();
}

/* ----------------------------- ACT 5 ----------------------------- */
function actShatter(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.5;
  const burst = smoothstep(0.05, 0.55, local);

  // the ring survives a moment, then breaks into shards
  loopRing(c, cx, cy, 150 + burst * 40, t * 0.9, a * (1 - burst));

  for (let i = 0; i < 60; i++) {
    const ang = rnd(i) * Math.PI * 2;
    const d = burst * (140 + rnd(i + 2) * 420);
    const x = cx + Math.cos(ang) * d;
    const y = cy + Math.sin(ang) * d * 0.8 - burst * 90;
    const s = (1 - burst) * 16 + 4;
    c.save();
    c.globalAlpha = a * (1 - burst) * 0.9;
    c.translate(x, y);
    c.rotate(ang + t * 1.4);
    c.fillStyle = withAlpha(EMBER, 0.9);
    c.beginPath();
    c.moveTo(0, -s);
    c.lineTo(s * 0.8, s * 0.6);
    c.lineTo(-s * 0.9, s * 0.5);
    c.closePath();
    c.fill();
    c.restore();
  }

  // embers rising
  for (let i = 0; i < 180; i++) {
    const seed = rnd(i);
    const rise = ((t * 0.11 + seed) % 1);
    const x = cx + (rnd(i + 11) - 0.5) * 900 * (0.25 + rise);
    const y = cy + 120 - rise * 720;
    const r = 1.4 + rnd(i + 7) * 2.6;
    const alpha = a * burst * Math.sin(rise * Math.PI) * 0.9;
    if (alpha <= 0.01) continue;
    c.fillStyle = withAlpha(EMBER, alpha);
    c.beginPath();
    c.arc(x + Math.sin(t * 1.6 + i) * 14, y, r, 0, Math.PI * 2);
    c.fill();
  }
  glow(c, cx, cy + 60, 380, "#FF9900", 0.4 * a * burst);
}

/* ----------------------------- ACT 6 ----------------------------- */
const TAGS = ["Career", "Love", "Family", "Identity"];

function actPortal(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.5;
  const open = smoothstep(0, 0.45, local);
  const rx = 330 * (0.7 + open * 0.3);
  const ry = 250 * (0.7 + open * 0.3);

  glow(c, cx, cy, 420, EMBER, 0.45 * a);

  for (let i = 0; i < 4; i++) {
    c.save();
    c.globalAlpha = a * (0.75 - i * 0.15);
    c.strokeStyle = withAlpha(i % 2 ? "#D8A6F0" : EMBER, 0.9);
    c.lineWidth = 2.4 - i * 0.4;
    c.beginPath();
    c.ellipse(cx, cy, rx + i * 16 + Math.sin(t * 1.1 + i) * 6, ry + i * 12, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  // ember dust still feeding the portal rim
  for (let i = 0; i < 90; i++) {
    const th = rnd(i) * Math.PI * 2 + t * 0.25;
    const x = cx + Math.cos(th) * (rx + Math.sin(t + i) * 12);
    const y = cy + Math.sin(th) * (ry + Math.cos(t + i) * 10);
    c.fillStyle = withAlpha(EMBER, a * 0.7);
    c.beginPath();
    c.arc(x, y, 1.6, 0, Math.PI * 2);
    c.fill();
  }

  // orbiting category pills
  c.save();
  c.globalAlpha = a * open;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = "500 22px 'Nunito Sans', system-ui, sans-serif";
  TAGS.forEach((tag, i) => {
    const th = t * 0.35 + (i / TAGS.length) * Math.PI * 2;
    const x = cx + Math.cos(th) * (rx + 130);
    const y = cy + Math.sin(th) * (ry + 96);
    const w = c.measureText(tag).width + 46;
    c.fillStyle = "rgba(247,244,239,0.07)";
    roundRect(c, x - w / 2, y - 20, w, 40, 20);
    c.fill();
    c.strokeStyle = withAlpha(EMBER, 0.55);
    c.lineWidth = 1.2;
    c.stroke();
    c.fillStyle = withAlpha(CREAM, 0.85);
    c.fillText(`( ${tag} )`, x, y + 1);
  });
  c.restore();
}

/* ----------------------------- ACT 7 ----------------------------- */
function actBridge(c: Ctx, a: number, local: number, t: number) {
  const cy = H * 0.46;
  const inn = smoothstep(0, 0.55, local);
  const lx = lerp(-140, W * 0.28, inn);
  const rx = lerp(W + 140, W * 0.72, inn);

  const beam = c.createLinearGradient(lx, cy, rx, cy);
  beam.addColorStop(0, withAlpha("#FFE9A8", 0));
  beam.addColorStop(0.5, withAlpha("#FFE9A8", 0.6 * a * inn));
  beam.addColorStop(1, withAlpha("#FFE9A8", 0));
  c.fillStyle = beam;
  c.fillRect(lx, cy - 5 + Math.sin(t) * 3, rx - lx, 10);
  glow(c, (lx + rx) / 2, cy, 300, "#7FE3C0", 0.35 * a * inn);

  for (let i = 0; i < 26; i++) {
    const p = ((t * 0.3 + i / 26) % 1);
    const x = lerp(lx, rx, p);
    const y = cy + Math.sin(p * Math.PI * 2 + t * 2) * 26;
    c.fillStyle = withAlpha("#FFE9A8", a * inn * (1 - Math.abs(p - 0.5) * 1.4));
    c.beginPath();
    c.arc(x, y, 3, 0, Math.PI * 2);
    c.fill();
  }

  bird(c, lx, cy - 40 + Math.sin(t * 1.3) * 10, 1.1, a, CREAM);
  bird(c, rx, cy - 40 + Math.sin(t * 1.3 + 1.6) * 10, 1.1, a, "#7FE3C0");
}

/* ----------------------------- ACT 8 ----------------------------- */
function actSanctuary(c: Ctx, a: number, local: number, t: number) {
  const cx = W / 2;
  const cy = H * 0.62;
  const flick = 0.78 + Math.sin(t * 9.3) * 0.1 + Math.sin(t * 21.7) * 0.06;

  glow(c, cx, cy - 30, 430 * flick, "#FF9900", 0.75 * a);

  // logs
  c.save();
  c.globalAlpha = a;
  c.strokeStyle = "rgba(90,52,28,0.95)";
  c.lineWidth = 16;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(cx - 66, cy + 22);
  c.lineTo(cx + 66, cy + 6);
  c.moveTo(cx - 62, cy + 4);
  c.lineTo(cx + 62, cy + 24);
  c.stroke();

  // flame
  const fh = 120 * flick;
  const g = c.createLinearGradient(cx, cy - fh, cx, cy + 10);
  g.addColorStop(0, "rgba(255,232,150,0.95)");
  g.addColorStop(0.5, "rgba(255,153,0,0.9)");
  g.addColorStop(1, "rgba(255,77,77,0.25)");
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(cx - 40, cy + 6);
  c.quadraticCurveTo(cx - 26, cy - fh * 0.5, cx - 6, cy - fh);
  c.quadraticCurveTo(cx + 6, cy - fh * 0.62, cx + 16, cy - fh * 0.86);
  c.quadraticCurveTo(cx + 44, cy - fh * 0.34, cx + 40, cy + 6);
  c.closePath();
  c.fill();
  c.restore();

  // sparks
  for (let i = 0; i < 46; i++) {
    const p = ((t * 0.34 + rnd(i)) % 1);
    const x = cx + Math.sin(t * 1.5 + i) * 60 * p;
    const y = cy - 40 - p * 420;
    c.fillStyle = withAlpha("#FFD98A", a * (1 - p) * 0.8);
    c.beginPath();
    c.arc(x, y, 1.8 + rnd(i + 3) * 1.6, 0, Math.PI * 2);
    c.fill();
  }

  // people around the fire
  const seats = 6;
  const inn = smoothstep(0, 0.5, local);
  for (let i = 0; i < seats; i++) {
    const th = Math.PI * 0.16 + (i / (seats - 1)) * Math.PI * 0.68;
    const x = cx + Math.cos(th + Math.PI) * (260 + i * 4) * (0.8 + inn * 0.2);
    const y = cy + 4 + Math.sin(th) * 74;
    person(c, x, y, 1.8, "rgba(30,14,8,0.92)", a * inn);
  }
}

/* ------------------------------------------------------------------ */

export function KurzgesagtCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = () => {
      const t = (performance.now() - start) / 1000;
      const p = scrollState.progress;

      c.clearRect(0, 0, w, h);
      c.save();
      // fit the 1200x800 stage into the viewport, biased slightly upward
      const scale = Math.min(w / W, h / H) * 1.12;
      c.translate(w / 2 + scrollState.px * 14, h / 2 + scrollState.py * -10);
      c.scale(scale, scale);
      c.translate(-W / 2, -H / 2);

      const painters = [
        actVoid,
        actBiology,
        actCity,
        actLoop,
        actShatter,
        actPortal,
        actBridge,
        actSanctuary,
      ];

      painters.forEach((paint, i) => {
        const id = (i + 1) as 1;
        // a sharper curve keeps two scenes from muddling into each other
        const a = Math.pow(actAlpha(p, id), 2.2);
        if (a <= 0.012) return;
        const local = actLocal(p, id);
        c.save();
        // depth entry: each scene arrives from behind and leaves forward
        const z = lerp(0.9, 1.06, smoothstep(0, 1, local));
        c.translate(W / 2, H / 2);
        c.scale(z, z);
        c.translate(-W / 2, -H / 2);
        paint(c, a, local, t);
        c.restore();
      });

      c.restore();
    };

    draw();
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      id="kurzgesagt-canvas"
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-full"
    />
  );
}

export const CANVAS_ACTS = ACTS;
