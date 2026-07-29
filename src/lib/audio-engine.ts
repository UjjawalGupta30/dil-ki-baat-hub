/**
 * A tiny procedural synthesiser built on the native Web Audio API.
 *
 * One continuous low drone whose filter opens up as the visitor travels down
 * the story, plus short tactile events: milestone clicks, hover chimes and a
 * warm harmonic chord on release. Nothing is loaded from the network.
 *
 * Browsers require a user gesture before audio can start, so the context is
 * created lazily on the first `enable()` call and can be fully torn down.
 */

type Voice = { osc: OscillatorNode; gain: GainNode };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let voices: Voice[] = [];
let noiseBuffer: AudioBuffer | null = null;
let enabled = false;

const listeners = new Set<(on: boolean) => void>();

export function subscribeAudio(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((l) => l(enabled));
}

export function isAudioEnabled() {
  return enabled;
}

function makeNoiseBuffer(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 0.12);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  return buffer;
}

/** Start (or resume) the ambient bed. Must be called from a user gesture. */
export async function enableAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 120;
    filter.Q.value = 6;
    filter.connect(master);

    noiseBuffer = makeNoiseBuffer(ctx);

    // 55 Hz base drone plus a detuned saw fifth for warmth
    const specs: Array<{ type: OscillatorType; freq: number; gain: number }> = [
      { type: "sine", freq: 55, gain: 0.5 },
      { type: "sine", freq: 55 * 2, gain: 0.16 },
      { type: "sawtooth", freq: 82.4, gain: 0.07 },
    ];
    voices = specs.map(({ type, freq, gain }) => {
      const osc = ctx!.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx!.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(filter!);
      osc.start();
      return { osc, gain: g };
    });
  }

  await ctx.resume();
  enabled = true;
  master?.gain.cancelScheduledValues(ctx.currentTime);
  master?.gain.setTargetAtTime(0.16, ctx.currentTime, 0.9);
  emit();
}

/** Fade the bed out and suspend the context (keeps nodes for a fast restart). */
export function disableAudio() {
  enabled = false;
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
  }
  emit();
}

export function toggleAudio() {
  return enabled ? (disableAudio(), Promise.resolve()) : enableAudio();
}

/** Filter cutoff rides the scroll: 120 Hz at the top, 800 Hz at the end. */
export function setScrollProgress(p: number) {
  if (!ctx || !filter || !enabled) return;
  const target = 120 + Math.min(1, Math.max(0, p)) * 680;
  filter.frequency.setTargetAtTime(target, ctx.currentTime, 0.25);
}

/** Short resonant burst used for scroll milestones. */
export function playClick(intensity = 1) {
  if (!ctx || !filter || !enabled || !noiseBuffer) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1400;
  bp.Q.value = 14;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.22 * intensity, ctx.currentTime + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);
  src.connect(bp).connect(g).connect(master!);
  src.start();
  src.stop(ctx.currentTime + 0.15);
}

/** Soft bell used when a sentiment is focused. */
export function playChime(freq = 880) {
  if (!ctx || !enabled || !master) return;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.075, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
  osc.connect(g).connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

/** Warm major chord for the moment a confession is released. */
export function playRelease() {
  if (!ctx || !enabled || !master) return;
  [220, 277.18, 329.63, 440].forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = ctx!.createGain();
    const t = ctx!.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 2.8);
  });
}

/** Full teardown, called from React cleanup. */
export function destroyAudio() {
  voices.forEach(({ osc }) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* already stopped */
    }
  });
  voices = [];
  filter?.disconnect();
  master?.disconnect();
  ctx?.close().catch(() => undefined);
  ctx = null;
  master = null;
  filter = null;
  noiseBuffer = null;
  enabled = false;
  emit();
}
