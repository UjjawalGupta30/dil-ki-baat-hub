import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";
import { ACTS, actLocal, clamp01, smoothstep } from "@/lib/story";

const GOLD = new THREE.Color("#E2C382");
const AMBER = new THREE.Color("#FFB800");
const SUNSET = new THREE.Color("#E59866");
const AURA = new THREE.Color("#8E24AA");

const SHARDS = 120;
const DUST = 800;

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Squashes a unit sphere into a heart-leaning monolith silhouette. */
function heartify(v: THREE.Vector3) {
  const dimple = 1 - Math.pow(Math.max(0, v.y), 3) * 0.5;
  return new THREE.Vector3(
    v.x * 1.5 * dimple,
    v.y * 1.4 - Math.pow(Math.max(0, -v.y), 2) * 0.4,
    v.z * 1.28 * dimple,
  );
}

/**
 * ACT 1 — the monolith. A dark, high-gloss metal mass gently boiling under a
 * GLSL vertex-noise displacement. It dissolves the instant the shards take
 * over, so the shatter reads as one continuous object breaking.
 */
function Monolith({ visible }: { visible: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useRef({ uTime: { value: 0 }, uAmp: { value: 1 } });

  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 32);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const h = heartify(v.normalize());
      pos.setXYZ(i, h.x, h.y, h.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.current.uTime.value = state.clock.elapsedTime;
    const m = mesh.current;
    if (!m) return;
    const target = visible.current;
    const mat = m.material as THREE.MeshPhysicalMaterial;
    mat.opacity = damp(mat.opacity, target * 0.92, 6, dt);
    uniforms.current.uAmp.value = 0.1 + (1 - target) * 0.55;
    m.visible = mat.opacity > 0.01;
    m.rotation.y += dt * 0.12;
    m.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 - scrollState.py * 0.12;
    const s = damp(m.scale.x, 0.5 + target * 0.28, 4, dt);
    m.scale.setScalar(s);
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshPhysicalMaterial
        color="#2A0A08"
        metalness={0.92}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.15}
        emissive={SUNSET}
        emissiveIntensity={0.16}
        transparent
        opacity={1}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = uniforms.current.uTime;
          shader.uniforms.uAmp = uniforms.current.uAmp;
          shader.vertexShader = shader.vertexShader
            .replace(
              "#include <common>",
              `#include <common>
               uniform float uTime;
               uniform float uAmp;
               float wave(vec3 p, float t){
                 return sin(p.x * 3.1 + t) * sin(p.y * 2.7 - t * 0.8) * sin(p.z * 3.4 + t * 0.6);
               }`,
            )
            .replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
               float n = wave(position, uTime * 0.7) * 0.5 + wave(position * 2.3, uTime * 1.1) * 0.25;
               transformed += normal * n * uAmp;`,
            );
        }}
      />
    </mesh>
  );
}

/**
 * ACTS 2-4 — 120 instanced shards. They start welded to the monolith surface,
 * explode outward, drift through the echoes, then converge into the portal
 * ring that frames the venting interface.
 */
function Shards({ monolith }: { monolith: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const layout = useMemo(() => {
    const skin: THREE.Vector3[] = [];
    const open: THREE.Vector3[] = [];
    const ring: THREE.Vector3[] = [];
    const seeds: number[] = [];
    const scales: number[] = [];

    for (let i = 0; i < SHARDS; i++) {
      const y = 1 - (i / (SHARDS - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963;
      skin.push(
        heartify(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r)).multiplyScalar(
          1.02,
        ),
      );

      const a = Math.random() * Math.PI * 2;
      const rad = 2.8 + Math.random() * 3.1;
      const ph = Math.acos(2 * Math.random() - 1);
      open.push(
        new THREE.Vector3(
          Math.sin(ph) * Math.cos(a) * rad,
          Math.cos(ph) * rad * 0.78,
          Math.sin(ph) * Math.sin(a) * rad * 0.85,
        ),
      );

      const ra = (i / SHARDS) * Math.PI * 2;
      const wobble = 0.92 + Math.random() * 0.18;
      ring.push(
        new THREE.Vector3(
          Math.cos(ra) * 4.8 * wobble,
          Math.sin(ra) * 4.8 * wobble * 0.82,
          (Math.random() - 0.5) * 0.6,
        ),
      );

      seeds.push(Math.random() * Math.PI * 2);
      scales.push(0.04 + Math.random() * 0.04);
    }
    return { skin, open, ring, seeds, scales };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;

    const shatter = smoothstep(ACTS.shatter[0] + 0.02, ACTS.shatter[1], p);
    const portal = smoothstep(ACTS.assembly[0] - 0.03, ACTS.assembly[0] + 0.06, p);
    const embers = Math.max(smoothstep(0.86, 1, p), scrollState.released);
    monolith.current = 1 - smoothstep(ACTS.monolith[1], ACTS.shatter[0] + 0.04, p);

    const inst = mesh.current;
    if (!inst) return;

    for (let i = 0; i < SHARDS; i++) {
      const seed = layout.seeds[i];
      const breath = 1 + Math.pow(Math.max(0, Math.sin(t * 1.1 + seed * 0.02)), 12) * 0.05;

      tmp.copy(layout.skin[i]).multiplyScalar(breath);
      if (shatter > 0.001) tmp.lerp(layout.open[i], shatter);
      if (portal > 0.001) tmp.lerp(layout.ring[i], portal);

      const drift = 0.14 + shatter * (1 - portal) * 0.5;
      tmp.x += Math.sin(t * 0.5 + seed) * drift * 0.5;
      tmp.y += Math.cos(t * 0.42 + seed * 1.3) * drift * 0.5 + embers * ((seed % 1) * 4 + 1.5);
      tmp.z += Math.sin(t * 0.37 + seed * 0.7) * drift * 0.4;

      const s =
        layout.scales[i] *
        (0.55 + shatter * 0.7 - portal * 0.32) *
        (1 - embers * 0.75) *
        (1 - monolith.current * 0.35);

      dummy.position.copy(tmp);
      dummy.rotation.set(
        t * (0.25 + shatter * 0.6) + seed,
        t * 0.19 + seed * 1.7,
        seed + embers * t,
      );
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;

    const mat = inst.material as THREE.MeshPhysicalMaterial;
    mat.emissiveIntensity = 0.5 + shatter * 1.1 + embers * 1.8;
    mat.opacity = damp(mat.opacity, 0.85 - portal * 0.6, 3, dt);
    mat.color.lerpColors(GOLD, AMBER, clamp01(shatter * 0.6 + embers));

    if (group.current) {
      spin.current += dt * (0.08 + Math.abs(scrollState.velocity) * 0.55) * (1 - portal);
      // the ring squares up to camera as the portal assembles
      const yaw = spin.current * (1 - portal) + scrollState.px * 0.32 * (1 - portal * 0.6);
      group.current.rotation.y = damp(group.current.rotation.y, yaw, 4, dt);
      group.current.rotation.x = damp(
        group.current.rotation.x,
        -scrollState.py * 0.2 + Math.sin(t * 0.2) * 0.07,
        3,
        dt,
      );
      group.current.position.y = damp(group.current.position.y, -p * 0.5, 2.5, dt);
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, SHARDS]} frustumCulled={false}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color={GOLD}
          emissive={SUNSET}
          emissiveIntensity={0.4}
          metalness={0.95}
          roughness={0.14}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </instancedMesh>
      <Monolith visible={monolith} />
    </group>
  );
}

/** Ambient dust: answers to the pointer, to scroll speed and to hovered text. */
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
      home.set([x, y, z], i * 3);
      positions.set([x, y, z], i * 3);
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
    const rise = Math.max(smoothstep(0.86, 1, scrollState.progress), scrollState.released);

    for (let i = 0; i < DUST; i++) {
      const i3 = i * 3;
      const s = seeds[i];
      let tx = home[i3] + Math.sin(t * 0.22 + s) * 0.55 + scrollState.px * 0.6;
      let ty =
        home[i3 + 1] +
        Math.cos(t * 0.19 + s) * 0.5 -
        scrollState.velocity * 2.2 +
        scrollState.py * 0.4 +
        rise * (((t * 0.6 + s) % 6) - 3) * 1.4;
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

    const mat = el.material as THREE.PointsMaterial;
    mat.color.lerpColors(GOLD, AMBER, rise);
    mat.size = 0.026 + rise * 0.03;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.026}
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

/** Camera and lighting are scrubbed straight off the scroll timeline. */
function Rig() {
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const t = clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;

    const z = 9.6 - Math.sin(p * Math.PI) * 2.4 - smoothstep(0.4, 0.6, p) * 1.2;
    cam.position.z = damp(cam.position.z, z, 2, dt);
    cam.position.x = damp(cam.position.x, scrollState.px * 0.6 + Math.sin(p * 6.28) * 0.4, 2, dt);
    cam.position.y = damp(cam.position.y, scrollState.py * 0.35, 2, dt);
    cam.rotation.z = damp(cam.rotation.z, Math.sin(p * Math.PI * 2) * 0.05, 2, dt);
    const fov = 42 + smoothstep(0.2, 0.45, p) * 12 - smoothstep(0.6, 0.85, p) * 8;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = damp(cam.fov, fov, 2, dt);
      cam.updateProjectionMatrix();
    }
    cam.lookAt(0, 0, 0);

    const warm = Math.max(smoothstep(0.78, 1, p), scrollState.connected ? 1 : 0);
    if (key.current) {
      key.current.intensity = 20 + warm * 26;
      key.current.color.lerpColors(AMBER, SUNSET, warm * 0.6 + scrollState.mood * 0.2);
    }
    if (rim.current) {
      rim.current.intensity = 10 + smoothstep(0.2, 0.5, p) * 20 + warm * 22;
      rim.current.position.x = Math.sin(t * 0.3) * 4;
      rim.current.position.z = Math.cos(t * 0.3) * 4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight ref={key} position={[4, 3, 5]} intensity={22} color={AMBER} />
      <pointLight ref={rim} color={AURA} intensity={12} distance={28} />
      <pointLight position={[-5, -2, 2]} intensity={12} color={SUNSET} />
    </>
  );
}

function Scene() {
  const monolith = useRef(1);
  return (
    <>
      <Rig />
      <Shards monolith={monolith} />
      <Dust />
    </>
  );
}

/** Unused helper kept explicit so acts stay readable elsewhere. */
export const actProgress = actLocal;

export default function StoryEngine() {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9.6], fov: 42 }}
    >
      <Scene />
    </Canvas>
  );
}
