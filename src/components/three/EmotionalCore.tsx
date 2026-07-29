import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";

const GOLD = new THREE.Color("#FFB800");
const SUNSET = new THREE.Color("#E59866");
const AURA = new THREE.Color("#8E24AA");

const FRAGMENTS = 220;
const DUST = 900;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * The emotional core. One instanced mesh of obsidian-gold shards that lives
 * through the whole page: a whole heart-ish form at the top, an exploded view
 * of glowing inner layers mid-page, an open portal ring at the form, and a
 * wide calm aura once a conversation begins.
 */
function Core() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.PointLight>(null);
  const group = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const spin = useRef(0);

  // three resting arrangements every shard blends between
  const layout = useMemo(() => {
    const closed: THREE.Vector3[] = [];
    const open: THREE.Vector3[] = [];
    const ring: THREE.Vector3[] = [];
    const seeds: number[] = [];
    const scales: number[] = [];

    for (let i = 0; i < FRAGMENTS; i++) {
      // closed: a heart-leaning sphere, slightly flattened and dimpled on top
      const y = 1 - (i / (FRAGMENTS - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963;
      const dimple = 1 - Math.pow(Math.max(0, y), 3) * 0.45;
      closed.push(
        new THREE.Vector3(
          Math.cos(theta) * r * 1.5 * dimple,
          y * 1.42 - Math.pow(Math.max(0, -y), 2) * 0.35,
          Math.sin(theta) * r * 1.32 * dimple,
        ),
      );

      // open: shards drift outward into loose space
      const a = Math.random() * Math.PI * 2;
      const rad = 2.6 + Math.random() * 2.9;
      const ph = Math.acos(2 * Math.random() - 1);
      open.push(
        new THREE.Vector3(
          Math.sin(ph) * Math.cos(a) * rad,
          Math.cos(ph) * rad * 0.72,
          Math.sin(ph) * Math.sin(a) * rad * 0.8,
        ),
      );

      // ring: an open portal the form sits inside
      const ra = (i / FRAGMENTS) * Math.PI * 2;
      const wobble = 0.9 + Math.random() * 0.22;
      ring.push(
        new THREE.Vector3(
          Math.cos(ra) * 3.35 * wobble,
          Math.sin(ra) * 3.35 * wobble * 0.86,
          (Math.random() - 0.5) * 0.7,
        ),
      );

      seeds.push(Math.random() * Math.PI * 2);
      scales.push(0.055 + Math.random() * 0.085);
    }
    return { closed, open, ring, seeds, scales };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;

    // narrative weights
    const explode = smoothstep(0.08, 0.34, p) * (1 - smoothstep(0.55, 0.72, p));
    const portal = smoothstep(0.58, 0.8, p) * (1 - smoothstep(0.9, 1, p) * 0.35);
    const aura = scrollState.connected ? 1 : smoothstep(0.88, 1, p);

    phase.current = damp(phase.current, explode, 5, dt);
    const ex = phase.current;

    if (!mesh.current) return;
    const inst = mesh.current;

    for (let i = 0; i < FRAGMENTS; i++) {
      const seed = layout.seeds[i];
      const breath = 1 + Math.pow(Math.max(0, Math.sin(t * 1.1 + seed * 0.02)), 12) * 0.05;

      tmp.copy(layout.closed[i]).multiplyScalar(breath);
      if (ex > 0.001) tmp.lerp(layout.open[i], ex);
      if (portal > 0.001) tmp.lerp(layout.ring[i], portal);

      // drifting life, strongest while the core is broken open
      const drift = 0.16 + ex * 0.4;
      tmp.x += Math.sin(t * 0.5 + seed) * drift * 0.5;
      tmp.y += Math.cos(t * 0.42 + seed * 1.3) * drift * 0.5;
      tmp.z += Math.sin(t * 0.37 + seed * 0.7) * drift * 0.4;

      const s = layout.scales[i] * (1 + ex * 0.55 + aura * 0.3);
      dummy.position.copy(tmp);
      dummy.rotation.set(t * 0.25 + seed, t * 0.19 + seed * 1.7, seed);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;

    // the whole assembly answers to pointer and scroll velocity
    if (group.current) {
      spin.current += dt * (0.09 + Math.abs(scrollState.velocity) * 0.5);
      group.current.rotation.y = spin.current + scrollState.px * 0.35;
      group.current.rotation.x = damp(
        group.current.rotation.x,
        -scrollState.py * 0.22 + Math.sin(t * 0.2) * 0.08,
        3,
        dt,
      );
      const target = 1 + aura * 0.65 - portal * 0.1;
      const sc = damp(group.current.scale.x, target, 3, dt);
      group.current.scale.setScalar(sc);
      group.current.position.y = damp(group.current.position.y, -p * 0.6, 2.5, dt);
    }

    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.1 + ex * 0.3 + aura * 0.2;
      const gs = 0.9 + ex * 0.7 + Math.sin(t * 0.9) * 0.04 + aura * 1.4;
      glow.current.scale.setScalar(gs);
    }

    if (rim.current) {
      rim.current.intensity = 8 + ex * 22 + aura * 26;
      rim.current.position.x = Math.sin(t * 0.3) * 4;
      rim.current.position.z = Math.cos(t * 0.3) * 4;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, FRAGMENTS]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={SUNSET}
          emissiveIntensity={0.55}
          metalness={1}
          roughness={0.22}
        />
      </instancedMesh>

      {/* inner light that only reads once the shell opens up */}
      <mesh ref={glow}>
        <sphereGeometry args={[1.25, 42, 42]} />
        <meshBasicMaterial
          color={SUNSET}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight ref={rim} color={AURA} intensity={10} distance={26} />
    </group>
  );
}

/** Ambient dust that answers to the pointer, to scroll speed, and to hover. */
function Dust() {
  const points = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const { positions, home, seeds } = useMemo(() => {
    const positions = new Float32Array(DUST * 3);
    const home = new Float32Array(DUST * 3);
    const seeds = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 9 - 1;
      home[i * 3] = x;
      home[i * 3 + 1] = y;
      home[i * 3 + 2] = z;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, home, seeds };
  }, []);

  useFrame((state, delta) => {
    const el = points.current;
    if (!el) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const attr = el.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    const fx = scrollState.focusX * viewport.width * 0.5;
    const fy = scrollState.focusY * viewport.height * 0.5;
    const pull = scrollState.focusActive ? 1 : 0;

    for (let i = 0; i < DUST; i++) {
      const i3 = i * 3;
      const s = seeds[i];
      let tx = home[i3] + Math.sin(t * 0.22 + s) * 0.55 + scrollState.px * 0.6;
      let ty =
        home[i3 + 1] + Math.cos(t * 0.19 + s) * 0.5 - scrollState.velocity * 2.2 + scrollState.py * 0.4;
      const tz = home[i3 + 2] + Math.sin(t * 0.16 + s * 1.4) * 0.4;

      if (pull) {
        const w = 0.55 * (0.35 + 0.65 * Math.abs(Math.sin(s)));
        tx = THREE.MathUtils.lerp(tx, fx + Math.cos(s + t * 0.6) * 1.6, w);
        ty = THREE.MathUtils.lerp(ty, fy + Math.sin(s + t * 0.6) * 1.1, w);
      }

      arr[i3] = damp(arr[i3], tx, 1.8, dt);
      arr[i3 + 1] = damp(arr[i3 + 1], ty, 1.8, dt);
      arr[i3 + 2] = damp(arr[i3 + 2], tz, 1.2, dt);
    }
    attr.needsUpdate = true;
    el.rotation.z = Math.sin(t * 0.05) * 0.05;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color={GOLD}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Camera pushes gently through Z as the story advances. */
function Rig() {
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const z = 9.4 - Math.sin(p * Math.PI) * 1.9;
    camera.position.z = damp(camera.position.z, z, 2, dt);
    camera.position.x = damp(camera.position.x, scrollState.px * 0.5, 2, dt);
    camera.position.y = damp(camera.position.y, scrollState.py * 0.35, 2, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function EmotionalCore() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9.4], fov: 42 }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={26} color="#FFB800" />
      <pointLight position={[-5, -2, 2]} intensity={14} color="#E59866" />
      <Core />
      <Dust />
      <Rig />
    </Canvas>
  );
}
