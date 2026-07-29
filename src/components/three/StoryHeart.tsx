import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = "#c9a25e";
const ROSE = "#d9a09a";
const EMBER = "#d0684a";

/**
 * The story the scene tells, on a loop:
 *   scattered  ->  gathering  ->  it becomes a heart (and beats)  ->  it is released
 * Every stage is timed so a first-time visitor reads the whole idea in one breath:
 * loose thoughts find a shape, the shape is held, then it is let go.
 */
const CYCLE = 17;
const T_GATHER = 4.2;
const T_HELD = 7.6;
const T_RELEASE = 13.4;

function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

/** Points sampled on a heart, given a little depth so it reads as a solid form. */
function heartPoint(i: number, n: number) {
  const t = (i / n) * Math.PI * 2;
  const jitter = 0.82 + Math.random() * 0.18;
  const x = (16 * Math.pow(Math.sin(t), 3)) / 16;
  const y =
    (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
  const r = Math.pow(Math.random(), 0.6);
  const depth = (Math.random() - 0.5) * 0.9 * (1 - r * 0.4);
  return new THREE.Vector3(x * 1.75 * jitter * r, y * 1.75 * jitter * r + 0.15, depth);
}

function Thoughts({ count = 2600 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors, target, scatter, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const palette = [new THREE.Color(GOLD), new THREE.Color(ROSE), new THREE.Color(EMBER)];

    for (let i = 0; i < count; i++) {
      const p = heartPoint(i, count);
      target[i * 3] = p.x;
      target[i * 3 + 1] = p.y;
      target[i * 3 + 2] = p.z;

      const a = Math.random() * Math.PI * 2;
      const rad = 3.4 + Math.random() * 3.6;
      scatter[i * 3] = Math.cos(a) * rad;
      scatter[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      scatter[i * 3 + 2] = Math.sin(a) * rad * 0.55 - 1;

      positions[i * 3] = scatter[i * 3];
      positions[i * 3 + 1] = scatter[i * 3 + 1];
      positions[i * 3 + 2] = scatter[i * 3 + 2];

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, target, scatter, seeds };
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!points.current) return;
    const time = clock.getElapsedTime();
    const t = time % CYCLE;

    // how "formed" the heart is, 0 loose .. 1 whole
    let form = 0;
    if (t < T_GATHER) form = 0;
    else if (t < T_HELD) form = easeInOut(clamp01((t - T_GATHER) / (T_HELD - T_GATHER)));
    else if (t < T_RELEASE) form = 1;
    else form = 1 - easeInOut(clamp01((t - T_RELEASE) / (CYCLE - T_RELEASE)));

    // a double thump while the heart is whole
    const beatPhase = Math.max(0, Math.sin(time * 1.25));
    const beat =
      1 + form * (Math.pow(beatPhase, 14) * 0.06 + Math.pow(Math.max(0, Math.sin(time * 1.25 - 0.5)), 16) * 0.035);

    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const drift = Math.sin(time * 0.34 + seeds[i]) * (1 - form) * 0.5;
      const sway = Math.cos(time * 0.27 + seeds[i]) * (1 - form) * 0.4;
      const tx = target[i3] * beat;
      const ty = target[i3 + 1] * beat;
      const tz = target[i3 + 2] * beat;
      arr[i3] = scatter[i3] * (1 - form) + tx * form + sway;
      arr[i3 + 1] = scatter[i3 + 1] * (1 - form) + ty * form + drift;
      arr[i3 + 2] = scatter[i3 + 2] * (1 - form) + tz * form;
      positions[i3] = arr[i3];
    }
    pos.needsUpdate = true;

    points.current.rotation.y += (pointer.x * 0.28 - points.current.rotation.y) * 0.02;
    points.current.rotation.x += (-pointer.y * 0.18 - points.current.rotation.x) * 0.02;

    const mat = points.current.material as THREE.PointsMaterial;
    mat.size = 0.026 + form * 0.016;
    mat.opacity = 0.42 + form * 0.34;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.03}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** The moment of being heard: a soft ring of light leaves the heart once per cycle. */
function Echo() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % CYCLE;
    const ring = (m: THREE.Mesh | null, offset: number) => {
      if (!m) return;
      const local = clamp01((t - (T_RELEASE - 1.4 + offset)) / 3.2);
      const s = 0.4 + local * 3.6;
      m.scale.setScalar(s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = local > 0 && local < 1 ? Math.sin(local * Math.PI) * 0.4 : 0;
    };
    ring(a.current, 0);
    ring(b.current, 0.7);
  });

  return (
    <group>
      <mesh ref={a}>
        <ringGeometry args={[1, 1.012, 128]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={b}>
        <ringGeometry args={[1, 1.008, 128]} />
        <meshBasicMaterial color={ROSE} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Quiet orbits that keep the frame alive between stages. */
function Orbits() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime();
    g.current.rotation.z = t * 0.04;
    g.current.rotation.x = Math.sin(t * 0.16) * 0.28;
  });
  return (
    <group ref={g}>
      <mesh>
        <torusGeometry args={[2.9, 0.0035, 8, 200]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[1.1, 0.3, 0]}>
        <torusGeometry args={[3.6, 0.003, 8, 200]} />
        <meshBasicMaterial color={ROSE} transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function StoryHeart() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <Thoughts />
      <Echo />
      <Orbits />
    </Canvas>
  );
}
