/**
 * Dil Ki Baat — procedural sound design.
 *
 * No narration, no voices, no network audio. Everything here is synthesised
 * live with the native Web Audio API so the soundtrack is purely textural:
 *
 *   · a warm daylight pad for the opening                (`setDaylight`)
 *   · a rising stress tone while the visitor holds       (`startHold` / `stopHold`)
 *   · a layered glass fracture when the screen cracks    (`playCrack`)
 *   · a low emotional cello-ish bed for the night city   (`setCityBed`)
 *   · a bloom of harmonics when something new forms      (`playFormation`)
 *   · small tactile ticks, chimes and air movements
 *
 * Browsers require a gesture before audio can start, so the context is created
 * lazily inside `enableAudio()` and can be fully torn down again.
 */

type Voice = { osc: OscillatorNode; gain: GainNode; base: number };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let bedGain: GainNode | null = null;
let voices: Voice[] = [];
let noiseBuffer: AudioBuffer | null = null;
let enabled = false;

/* hold-charge nodes, alive only while the visitor presses the ring */
let holdOsc: OscillatorNode | null = null;
let holdGain: GainNode | null = null;
let holdNoise: AudioBufferSourceNode | null = null;
let holdNoiseFilter: BiquadFilterNode | null = null;
let holdNoiseGain: GainNode | null = null;

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

/** A second of pink-ish noise, looped and filtered for air, glass and embers. */
function makeNoiseBuffer(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 1.4);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5 + white * 0.4;
  }
  return buffer;
}

/** Start (or resume) the ambient bed. Must be called from a user gesture. */
export async function enableAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 2.2;
    filter.connect(master);

    bedGain = ctx.createGain();
    bedGain.gain.value = 0.55;
    bedGain.connect(filter);

    noiseBuffer = makeNoiseBuffer(ctx);

    // open, consonant daylight pad: root, fifth, octave, plus a breathing detune
    const specs: Array<{ type: OscillatorType; freq: number; gain: number }> = [
      { type: "sine", freq: 110, gain: 0.34 },
      { type: "sine", freq: 164.81, gain: 0.15 },
      { type: "triangle", freq: 220, gain: 0.09 },
      { type: "sine", freq: 110.6, gain: 0.11 },
    ];
    voices = specs.map(({ type, freq, gain }) => {
      const osc = ctx!.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx!.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(bedGain!);
      osc.start();
      return { osc, gain: g, base: freq };
    });
  }

  await ctx.resume();
  enabled = true;
  master?.gain.cancelScheduledValues(ctx.currentTime);
  master?.gain.setTargetAtTime(0.2, ctx.currentTime, 0.8);
  emit();
}

export function disableAudio() {
  enabled = false;
  stopHold();
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
  }
  emit();
}

export function toggleAudio() {
  return enabled ? (disableAudio(), Promise.resolve()) : enableAudio();
}

/* ------------------------------------------------------------------ beds */

/** Bright, airy, major daylight pad — the state the page opens in. */
export function setDaylight() {
  if (!ctx || !filter || !voices.length) return;
  const t = ctx.currentTime;
  const day = [110, 164.81, 220, 110.6];
  voices.forEach((v, i) => v.osc.frequency.setTargetAtTime(day[i], t, 0.9));
  filter.frequency.setTargetAtTime(900, t, 1.1);
}

/**
 * Drop the pad a minor third and choke the top end: the same city, but after
 * dark. Called once the screen has cracked.
 */
export function setCityBed() {
  if (!ctx || !filter || !voices.length) return;
  const t = ctx.currentTime;
  const night = [82.4, 98, 164.81, 82.9];
  voices.forEach((v, i) => v.osc.frequency.setTargetAtTime(night[i], t, 2.2));
  filter.frequency.setTargetAtTime(260, t, 2.4);
  playAir(6.5, 0.05);
}

/** Filter cutoff and sub weight ride the scroll through the city. */
export function setScrollProgress(p: number) {
  if (!ctx || !filter || !enabled) return;
  const t = Math.min(1, Math.max(0, p));
  filter.frequency.setTargetAtTime(240 + t * 620, ctx.currentTime, 0.35);
  master?.gain.setTargetAtTime(0.17 + t * 0.07, ctx.currentTime, 0.7);
}

/* ------------------------------------------------------------- hold + crack */

/** Rising, tightening tone while the visitor presses and holds the ring. */
export function startHold() {
  if (!ctx || !enabled || !master || !noiseBuffer || holdOsc) return;
  const now = ctx.currentTime;

  holdOsc = ctx.createOscillator();
  holdOsc.type = "sawtooth";
  holdOsc.frequency.setValueAtTime(70, now);
  holdOsc.frequency.exponentialRampToValueAtTime(320, now + 1.8);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, now);
  lp.frequency.exponentialRampToValueAtTime(3200, now + 1.8);
  lp.Q.value = 5;

  holdGain = ctx.createGain();
  holdGain.gain.setValueAtTime(0.0001, now);
  holdGain.gain.exponentialRampToValueAtTime(0.13, now + 1.7);
  holdOsc.connect(lp).connect(holdGain).connect(master);
  holdOsc.start(now);

  // stress: fine grinding noise that gets brighter as the hold completes
  holdNoise = ctx.createBufferSource();
  holdNoise.buffer = noiseBuffer;
  holdNoise.loop = true;
  holdNoiseFilter = ctx.createBiquadFilter();
  holdNoiseFilter.type = "bandpass";
  holdNoiseFilter.Q.value = 1.1;
  holdNoiseFilter.frequency.setValueAtTime(600, now);
  holdNoiseFilter.frequency.exponentialRampToValueAtTime(5200, now + 1.8);
  holdNoiseGain = ctx.createGain();
  holdNoiseGain.gain.setValueAtTime(0.0001, now);
  holdNoiseGain.gain.exponentialRampToValueAtTime(0.07, now + 1.75);
  holdNoise.connect(holdNoiseFilter).connect(holdNoiseGain).connect(master);
  holdNoise.start(now);
}

/** Release the hold tone. Instant when the hold completed into a crack. */
export function stopHold(hard = false) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const tail = hard ? 0.03 : 0.22;
  holdGain?.gain.cancelScheduledValues(now);
  holdGain?.gain.setTargetAtTime(0.0001, now, tail);
  holdNoiseGain?.gain.cancelScheduledValues(now);
  holdNoiseGain?.gain.setTargetAtTime(0.0001, now, tail);
  const osc = holdOsc;
  const src = holdNoise;
  holdOsc = null;
  holdNoise = null;
  holdGain = null;
  holdNoiseFilter = null;
  holdNoiseGain = null;
  try {
    osc?.stop(now + tail * 5 + 0.05);
    src?.stop(now + tail * 5 + 0.05);
  } catch {
    /* already stopped */
  }
}

/**
 * The screen fracturing: one deep body impact, a spray of high glass shards
 * over half a second, then a long dusty tail. This is the loudest cue on the
 * page by design — it is the hinge of the whole story.
 */
export function playCrack() {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;

  // body: sub thud
  const thud = ctx.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(140, now);
  thud.frequency.exponentialRampToValueAtTime(32, now + 0.55);
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.0001, now);
  tg.gain.exponentialRampToValueAtTime(0.4, now + 0.012);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  thud.connect(tg).connect(master);
  thud.start(now);
  thud.stop(now + 0.75);

  // shards: 14 short bandpassed noise slivers, scattered in time and pitch
  for (let i = 0; i < 14; i++) {
    const t = now + 0.005 + Math.random() * 0.5 * (i / 14 + 0.25);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 1.4 + Math.random() * 2.4;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 10 + Math.random() * 12;
    const f = 2400 + Math.random() * 5200;
    bp.frequency.setValueAtTime(f, t);
    bp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 0.25), t + 0.35);
    const g = ctx.createGain();
    const peak = 0.1 + Math.random() * 0.14;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 + Math.random() * 0.4);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.7);
  }

  // dusty tail falling away into the night
  playAir(2.6, 0.09, false);
}

/* ------------------------------------------------------------ moments */

/** Long filtered air movement. Direction `up` opens, `down` closes. */
export function playAir(length = 2, level = 0.06, up = true) {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  src.playbackRate.value = 0.6;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(up ? 240 : 3600, now);
  bp.frequency.exponentialRampToValueAtTime(up ? 3200 : 200, now + length);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(level, now + length * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, now + length);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + length + 0.1);
}

/** Legacy name kept for the scroll engine. */
export function playWhoosh(up = true) {
  playAir(1.1, 0.055, up);
}

/**
 * "Something new has formed." A soft sub bloom under a rising stack of
 * harmonics — used for the WHO CARES reveal and the portal forming.
 */
export function playFormation() {
  if (!ctx || !enabled || !master) return;
  const now = ctx.currentTime;
  // sub bloom
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(48, now);
  sub.frequency.linearRampToValueAtTime(58, now + 2.4);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, now);
  sg.gain.exponentialRampToValueAtTime(0.22, now + 0.5);
  sg.gain.exponentialRampToValueAtTime(0.0001, now + 3);
  sub.connect(sg).connect(master);
  sub.start(now);
  sub.stop(now + 3.1);

  // rising harmonic stack, each partial a touch later — reads as "forming"
  [196, 293.66, 392, 587.33, 784].forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = i > 2 ? "sine" : "triangle";
    const t = now + 0.1 + i * 0.14;
    osc.frequency.setValueAtTime(f * 0.985, t);
    osc.frequency.linearRampToValueAtTime(f, t + 0.7);
    const g = ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.055 / (i * 0.5 + 1), t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 2.8);
  });
  playAir(2.2, 0.045, true);
}

/** Small tactile tick for UI and scroll milestones. */
export function playClick(intensity = 1) {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 2.4;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 12;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.09 * intensity, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.14);
}

/** Soft bell, used when a lit window is opened. */
export function playChime(freq = 440) {
  if (!ctx || !enabled || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.05, now + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.55);
}

/** Irregular ember pops, used sparingly deep in the city. */
export function playCrackle() {
  if (!ctx || !enabled || !master || !noiseBuffer) return;
  const now = ctx.currentTime;
  for (let i = 0; i < 9; i++) {
    const t = now + Math.random() * 1.8;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 1.8 + Math.random() * 2.2;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 7;
    bp.frequency.value = 900 + Math.random() * 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04 + Math.random() * 0.04, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.17);
  }
}

/** Slow double thud — the city's heartbeat under the deepest act. */
export function playHeartbeat() {
  if (!ctx || !enabled || !master) return;
  const now = ctx.currentTime;
  [0, 0.34].forEach((offset, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    const t = now + offset;
    osc.frequency.setValueAtTime(92, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.24);
    const g = ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(i === 0 ? 0.22 : 0.14, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 0.38);
  });
}

/** Warm resolving chord for the moment a thought is released. */
export function playRelease() {
  if (!ctx || !enabled || !master) return;
  [220, 277.18, 329.63, 440].forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = ctx!.createGain();
    const t = ctx!.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.14);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    osc.connect(g).connect(master!);
    osc.start(t);
    osc.stop(t + 3);
  });
  playAir(1.6, 0.04, true);
}

/**
 * One signature texture per chapter of the flight, so the ear always knows
 * where the eye is. Purely atmospheric — there is no narration anywhere.
 */
export function playActCue(act: number) {
  switch (act) {
    case 2:
      playAir(3, 0.05, false);
      break;
    case 3:
      playHeartbeat();
      break;
    case 4:
      playChime(392);
      break;
    case 5:
      playChime(523.25);
      playAir(2, 0.04, true);
      break;
    case 6:
      playHeartbeat();
      playAir(2.4, 0.05, false);
      break;
    case 7:
      playFormation();
      break;
    case 8:
      playCrackle();
      break;
    default:
      playAir(1.6, 0.04, true);
  }
}

/** Full teardown, called from React cleanup. */
export function destroyAudio() {
  stopHold(true);
  voices.forEach(({ osc }) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* already stopped */
    }
  });
  voices = [];
  bedGain?.disconnect();
  filter?.disconnect();
  master?.disconnect();
  ctx?.close().catch(() => undefined);
  ctx = null;
  master = null;
  filter = null;
  bedGain = null;
  noiseBuffer = null;
  enabled = false;
  emit();
}
