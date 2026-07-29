import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";
import { ACTS, ACT_COUNT, actFloat, clamp01, smoothstep } from "@/lib/narrative";

/**
 * The narrative canvas.
 *
 * A single cloud of points is the only object on stage for the whole story.
 * It is re-targeted eight times: a scattered void, a brain, a night city, a
 * closed loop, an explosion, an input portal, a bridge between two people and
 * finally a campfire. Because it is always the same particles, the story
 * reads as one continuous organism transforming, never as scenes swapping.
 */

const COUNT = 5200;
const CAMERA_Z = 12;

type Shape = Float32Array; // COUNT * 3

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** ACT 1 — a scattered field of distant, unconnected dots. */
function voidField(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const lonely = i % 11 === 0;
    const r = seeded(i, 1);
    const t = seeded(i, 2) * Math.PI * 2;
    if (lonely) {
      // one small huddled figure near the centre of an enormous empty room
      const rad = Math.sqrt(seeded(i, 3)) * 0.9;
      a.set([Math.cos(t) * rad * 0.7, Math.sin(t) * rad - 0.6, seeded(i, 4) * 1.2 - 0.6], i * 3);
    } else {
      a.set(
        [
          (seeded(i, 5) - 0.5) * 22,
          (seeded(i, 6) - 0.5) * 12,
          (r - 0.5) * 10 - 2,
        ],
        i * 3,
      );
    }
  }
  return a;
}

/** ACT 2 — a folded brain: two lobes with a rippling cortex. */
function brain(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const u = seeded(i, 7);
    const v = seeded(i, 8);
    const phi = Math.acos(2 * u - 1);
    const theta = v * Math.PI * 2;
    const fold = 1 + Math.sin(phi * 9) * 0.055 + Math.sin(theta * 11) * 0.05;
    const side = theta > Math.PI ? 1 : -1;
    const rad = 2.5 * fold;
    a.set(
      [
        Math.sin(phi) * Math.cos(theta) * rad * 0.92 + side * 0.34,
        Math.cos(phi) * rad * 0.78 + 0.1,
        Math.sin(phi) * Math.sin(theta) * rad * 0.8,
      ],
      i * 3,
    );
  }
  return a;
}

/** ACT 3 — a cold skyline of lit windows. */
function city(): Shape {
  const a = new Float32Array(COUNT * 3);
  const towers = 17;
  for (let i = 0; i < COUNT; i++) {
    const b = i % towers;
    const h = 2 + seeded(b, 9) * 6.4;
    const w = 0.42 + seeded(b, 10) * 0.5;
    const x = (b / (towers - 1) - 0.5) * 17 + (seeded(b, 11) - 0.5) * 0.4;
    const z = (seeded(b, 12) - 0.5) * 7;
    const col = Math.round(seeded(i, 13) * 3) / 3 - 0.5;
    const row = Math.floor(seeded(i, 14) * 14) / 14;
    a.set([x + col * w * 1.7, -4.6 + row * h, z], i * 3);
  }
  return a;
}

/** ACT 4 — the overthinking loop: a closed torus that eats its own tail. */
function loop(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const u = (i / COUNT) * Math.PI * 2;
    const v = seeded(i, 15) * Math.PI * 2;
    const R = 3.3;
    const r = 0.62 + seeded(i, 16) * 0.2;
    a.set(
      [
        (R + r * Math.cos(v)) * Math.cos(u),
        (R + r * Math.cos(v)) * Math.sin(u) * 0.85,
        r * Math.sin(v) * 1.6,
      ],
      i * 3,
    );
  }
  return a;
}

/** ACT 5 — the loop shatters outward into free-floating light. */
function shatter(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const u = seeded(i, 17);
    const v = seeded(i, 18);
    const phi = Math.acos(2 * u - 1);
    const theta = v * Math.PI * 2;
    const rad = 4.4 + seeded(i, 19) * 4.2;
    a.set(
      [
        Math.sin(phi) * Math.cos(theta) * rad,
        Math.cos(phi) * rad * 0.72,
        Math.sin(phi) * Math.sin(theta) * rad * 0.8,
      ],
      i * 3,
    );
  }
  return a;
}

/** ACT 6 — a soft-edged portal: an oval opening with an orbiting halo. */
function portal(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const orbit = i % 4 === 0;
    const t = (i / COUNT) * Math.PI * 2 * (orbit ? 1 : 3);
    if (orbit) {
      const rad = 6.2 + seeded(i, 20) * 0.7;
      a.set([Math.cos(t) * rad, Math.sin(t) * rad * 0.62, (seeded(i, 21) - 0.5) * 3], i * 3);
    } else {
      // squircle rim: |x/a|^n + |y/b|^n = 1
      const n = 4;
      const ct = Math.cos(t);
      const st = Math.sin(t);
      const rx = 5.6;
      const ry = 3.1;
      const k = Math.pow(Math.pow(Math.abs(ct), n) + Math.pow(Math.abs(st), n), -1 / n);
      const jitter = 1 + (seeded(i, 22) - 0.5) * 0.05;
      a.set([ct * k * rx * jitter, st * k * ry * jitter, (seeded(i, 23) - 0.5) * 0.9], i * 3);
    }
  }
  return a;
}

/** ACT 7 — two people, and an arc of light built between them. */
function bridge(): Shape {
  const a = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const m = i % 5;
    if (m < 2) {
      const side = m === 0 ? -1 : 1;
      const u = seeded(i, 24);
      const v = seeded(i, 25);
      const phi = Math.acos(2 * u - 1);
      const theta = v * Math.PI * 2;
      const rad = 1.25 * Math.cbrt(seeded(i, 26));
      a.set(
        [
          side * 5.4 + Math.sin(phi) * Math.cos(theta) * rad,
          Math.cos(phi) * rad,
          Math.sin(phi) * Math.sin(theta) * rad,
        ],
        i * 3,
      );
    } else {
      const t = seeded(i, 27);
      const x = (t - 0.5) * 10.8;
      const y = Math.sin(t * Math.PI) * 2.1 - 0.2 + (seeded(i, 28) - 0.5) * 0.28;
      a.set([x, y, (seeded(i, 29) - 0.5) * 0.7], i * 3);
    }
  }
  return a;
}

/** ACT 8 — a fire, and a circle of people sitting around it. */
function campfire(): Shape {
  const a = new Float32Array(COUNT * 3);
  const seats = 9;
  for (let i = 0; i < COUNT; i++) {
    if (i % 3 === 0) {
      const s = i % seats;
      const ang = (s / seats) * Math.PI * 2;
      const rad = 4.4;
      const u = seeded(i, 30);
      const v = seeded(i, 31);
      const blob = 0.85 * Math.cbrt(seeded(i, 32));
      a.set(
        [
          Math.cos(ang) * rad + (u - 0.5) * blob * 2,
          -1.9 + Math.sin(ang) * 0.9 + (v - 0.5) * blob * 2,
          Math.sin(ang) * rad * 0.6,
        ],
        i * 3,
      );
    } else {
      const h = Math.pow(seeded(i, 33), 1.5);
      const spread = (1 - h) * 1.5 + 0.12;
      const ang = seeded(i, 34) * Math.PI * 2;
      a.set(
        [
          Math.cos(ang) * spread + Math.sin(h * 6) * 0.25,
          -2.4 + h * 6.2,
          Math.sin(ang) * spread * 0.7,
        ],
        i * 3,
      );
    }
  }
  return a;
}

function Cloud() {
  const points = useRef<THREE.Points>(null);
  const spin = useRef(0);

  const { shapes, positions, colors, palette } = useMemo(() => {
    const shapes: Shape[] = [
      voidField(),
      brain(),
      city(),
      loop(),
      shatter(),
      portal(),
      bridge(),
      campfire(),
    ];
    const positions = new Float32Array(shapes[0]);
    const colors = new Float32Array(COUNT * 3);
    const palette = ACTS.map((act) => ({
      ink: new THREE.Color(`rgb(${act.ink.join(",")})`),
      accent: new THREE.Color(`rgb(${act.accent.join(",")})`),
    }));
    return { shapes, positions, colors, palette };
  }, []);

  const cA = useMemo(() => new THREE.Color(), []);
  const cB = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const el = points.current;
    if (!el) return;
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const p = clamp01(scrollState.progress);

    // Morph window: each act holds its silhouette, then dissolves into the next.
    const f = actFloat(p) - 0.5;
    const i = Math.max(0, Math.min(ACT_COUNT - 1, Math.floor(f)));
    const j = Math.max(0, Math.min(ACT_COUNT - 1, i + 1));
    const t = smoothstep(0.12, 0.88, clamp01(f - Math.floor(f)));

    const from = shapes[i];
    const to = shapes[j];
    const pos = el.geometry.attributes.position as THREE.BufferAttribute;
    const col = el.geometry.attributes.color as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const carr = col.array as Float32Array;

    // Breathing amplitude: the loop pulses anxiously, the fire flickers.
    const anxiety = smoothstep(0.34, 0.5, p) * (1 - smoothstep(0.5, 0.62, p));
    const fire = smoothstep(0.86, 1, p);
    const wobble = 0.06 + anxiety * 0.16 + fire * 0.2 + Math.abs(scrollState.velocity) * 0.25;

    for (let k = 0; k < COUNT; k++) {
      const k3 = k * 3;
      const s = seeded(k, 44) * Math.PI * 2;
      const tx = from[k3] + (to[k3] - from[k3]) * t + Math.sin(time * 0.6 + s) * wobble;
      const ty =
        from[k3 + 1] +
        (to[k3 + 1] - from[k3 + 1]) * t +
        Math.cos(time * 0.52 + s * 1.3) * wobble +
        fire * (((time * 1.2 + s) % 4) - 2) * 0.34;
      const tz = from[k3 + 2] + (to[k3 + 2] - from[k3 + 2]) * t + Math.sin(time * 0.4 + s) * wobble;

      const lambda = 6;
      const e = 1 - Math.exp(-lambda * dt);
      arr[k3] += (tx - arr[k3]) * e;
      arr[k3 + 1] += (ty - arr[k3 + 1]) * e;
      arr[k3 + 2] += (tz - arr[k3 + 2]) * e;
    }
    pos.needsUpdate = true;

    // Colour is mixed once per frame, then written per particle.
    const accentEvery = 7;
    cA.copy(palette[i].ink).lerp(palette[j].ink, t);
    cB.copy(palette[i].accent).lerp(palette[j].accent, t);
    for (let k = 0; k < COUNT; k++) {
      const k3 = k * 3;
      const c = k % accentEvery === 0 ? cB : cA;
      carr[k3] = c.r;
      carr[k3 + 1] = c.g;
      carr[k3 + 2] = c.b;
    }
    col.needsUpdate = true;

    // Whole-cloud choreography.
    spin.current += dt * (0.05 + anxiety * 0.55);
    el.rotation.y =
      spin.current * (1 - smoothstep(0.62, 0.78, p)) + scrollState.px * 0.28;
    el.rotation.x = -scrollState.py * 0.16 + Math.sin(time * 0.18) * 0.05;
    el.rotation.z = anxiety * Math.sin(time * 0.9) * 0.06;

    const mat = el.material as THREE.PointsMaterial;
    mat.size = 0.032 + fire * 0.028 + anxiety * 0.01;
    mat.opacity = 0.62 + smoothstep(0.4, 0.62, p) * 0.28;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.034}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** The camera pushes in and pulls back with the emotional pressure. */
function Rig() {
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = clamp01(scrollState.progress);
    const e = 1 - Math.exp(-2.2 * dt);
    const z =
      CAMERA_Z -
      smoothstep(0.12, 0.3, p) * 2.2 +
      smoothstep(0.34, 0.5, p) * 1.6 -
      smoothstep(0.62, 0.8, p) * 1.4;
    camera.position.z += (z - camera.position.z) * e;
    camera.position.x += (scrollState.px * 0.7 - camera.position.x) * e;
    camera.position.y += (scrollState.py * 0.45 - camera.position.y) * e;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function NarrativeCanvas() {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, CAMERA_Z], fov: 45 }}
    >
      <Rig />
      <Cloud />
      <mesh><boxGeometry args={[2,2,2]} /><meshBasicMaterial color="red" /></mesh>
    </Canvas>
  );
}
