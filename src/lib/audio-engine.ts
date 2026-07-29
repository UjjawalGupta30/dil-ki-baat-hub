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
  stopVoice();
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
  }
  emit();
}

export function toggleAudio() {
  return enabled ? (disableAudio(), Promise.resolve()) : enableAudio();
}

/** Filter cutoff rides the scroll: 100 Hz at the top, 800 Hz at the end. */
export function setScrollProgress(p: number) {
  if (!ctx || !filter || !enabled) return;
  const t = Math.min(1, Math.max(0, p));
  filter.frequency.setTargetAtTime(100 + t * 700, ctx.currentTime, 0.25);
  // the sub-bass swells slightly as the story deepens
  master?.gain.setTargetAtTime(0.13 + t * 0.06, ctx.currentTime, 0.6);
}

/** Glass-crack burst for the moment the monolith shatters. */
export function playShatter() {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 0.8 + Math.random() * 1.6;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 9;
    const t = now + i * 0.035;
    bp.frequency.setValueAtTime(3200 + Math.random() * 2200, t);
    bp.frequency.exponentialRampToValueAtTime(700, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.55);
  }
}

/** Act 5 — the dark hum resolves into a warm major triad (A4, C#5, E5). */
export function setWarmth(on: boolean) {
  if (!ctx || !voices.length) return;
  const t = ctx.currentTime;
  const dark = [55, 110, 82.4];
  const warm = [55, 220, 110];
  voices.forEach((v, i) => {
    v.osc.frequency.setTargetAtTime(on ? warm[i] : dark[i], t, 1.2);
  });
  if (on) playTriad([440, 554.37, 659.25], 3.4, 0.055);
}

function playTriad(freqs: number[], length: number, level: number) {
  if (!ctx || !enabled || !master) return;
  freqs.forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = ctx!.createGain();
    const t = ctx!.currentTime + i * 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + length + 0.1);
  });
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

/** Short pentatonic bell used when a floating script is focused. */
export function playChime(freq = 440) {
  if (!ctx || !enabled || !master) return;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.34);
  osc.connect(g).connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
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

/* ------------------------------------------------------------------ *
 * Act threshold cues for the eight-act narrative.
 * ------------------------------------------------------------------ */

/** Airy sweep used when the story crosses into a new act. */
export function playWhoosh(up = true) {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  src.playbackRate.value = 0.35;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(up ? 300 : 2400, now);
  bp.frequency.exponentialRampToValueAtTime(up ? 2600 : 260, now + 0.85);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.075, now + 0.22);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 1);
}

/** Irregular ember pops for the campfire sanctuary. */
export function playCrackle() {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  for (let i = 0; i < 9; i++) {
    const t = now + Math.random() * 1.6;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 1.6 + Math.random() * 2.4;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 6;
    bp.frequency.value = 900 + Math.random() * 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.16);
  }
}

/** Slow heartbeat thud used when the story reaches the biology of pain. */
export function playHeartbeat() {
  if (!ctx || !enabled || !master) return;
  const now = ctx.currentTime;
  [0, 0.34].forEach((offset, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    const t = now + offset;
    osc.frequency.setValueAtTime(96, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);
    const g = ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(i === 0 ? 0.26 : 0.17, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 0.36);
  });
}

/**
 * One signature sound per act boundary, so the ear always knows which
 * chapter of the story the eye is looking at.
 */
export function playActCue(act: number) {
  speakAct(act);
  switch (act) {
    case 2:
      playHeartbeat();
      break;
    case 3:
      playWhoosh(true);
      break;
    case 4:
      playClick(1);
      playWhoosh(false);
      break;
    case 5:
      playShatter();
      break;
    case 6:
      playChime(587.33);
      playWhoosh(true);
      break;
    case 7:
      playChime(659.25);
      playChime(880);
      break;
    case 8:
      playCrackle();
      setWarmth(true);
      break;
    default:
      playWhoosh(false);
  }
}


/* ------------------------------------------------------------------ *
 * Voiceover. Rendered with the browser's own speech engine so the
 * narration ships with zero network audio and always matches the act.
 * ------------------------------------------------------------------ */

export const VOICE_LINES: Record<number, string> = {
  1: "We live in the most connected time in human history, yet millions of us feel isolated.",
  2: "Loneliness is a biological warning, just like hunger.",
  3: "We traded tribes for cities and screens, and ended up overthinking alone at 2 A M.",
  4: "Isolation creates a vicious loop. We overthink, assume the worst, and pull away.",
  5: "The loop breaks the moment you say it out loud.",
  6: "No names. No accounts. Write it exactly the way it sits in your chest.",
  7: "Your truth gives someone else permission to speak.",
  8: "A fire, and people around it. Stay as long as it helps.",
};

let lastSpoken = 0;

/** Speak the act's narration line, if audio is on and TTS is available. */
export function speakAct(act: number) {
  if (!enabled || typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  const line = VOICE_LINES[act];
  if (!synth || !line || lastSpoken === act) return;
  lastSpoken = act;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(line);
  u.rate = 0.9;
  u.pitch = 0.95;
  u.volume = 0.85;
  synth.speak(u);
}

/** Stop any narration in flight (used when the visitor mutes). */
export function stopVoice() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  lastSpoken = 0;
}
