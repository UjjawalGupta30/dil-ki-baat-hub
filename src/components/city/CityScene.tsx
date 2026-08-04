import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildCity, seeded } from "@/lib/unspoken";
import { cityState } from "@/lib/city-state";

const NIGHT = new THREE.Color("#07090e");
const CRIMSON = new THREE.Color("#2a0406");
const WARM = new THREE.Color("#ffaa44");
const CYAN = new THREE.Color("#00e5ff");
const DIM = new THREE.Color("#c05a1e");
const DARK = new THREE.Color("#0a0c12");

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
/** progress ramp between two scroll marks */
function ramp(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}
function ease(x: number) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/* ------------------------------------------------------------------ camera */

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const PATH: Key[] = [
  { p: 0.0, pos: [0, 52, 46], look: [0, 8, -50] },
  { p: 0.15, pos: [0, 11, 16], look: [0, 13, -48] },
  { p: 0.4, pos: [0.6, 17, -34], look: [0, 20, -78] },
  { p: 0.7, pos: [-0.6, 21, -116], look: [0, 21, -164] },
  { p: 0.86, pos: [0, 15, -176], look: [0, 15, -212] },
  { p: 1.0, pos: [0, 12, -196], look: [0, 13, -226] },
];

function sample(p: number) {
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].p) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const t = ease(clamp01((p - a.p) / (b.p - a.p)));
  return {
    pos: new THREE.Vector3(
      lerp(a.pos[0], b.pos[0], t),
      lerp(a.pos[1], b.pos[1], t),
      lerp(a.pos[2], b.pos[2], t),
    ),
    look: new THREE.Vector3(
      lerp(a.look[0], b.look[0], t),
      lerp(a.look[1], b.look[1], t),
      lerp(a.look[2], b.look[2], t),
    ),
  };
}

function CameraRig() {
  const { camera, scene } = useThree();
  const target = useRef(new THREE.Vector3(0, 8, -50));

  useFrame((_, dt) => {
    const p = cityState.progress;
    const k = sample(p);
    const drift = 1 + Math.min(1, dt * 6);
    // pointer parallax, gentle so the fly-through stays cinematic
    k.pos.x += cityState.px * 2.4;
    k.pos.y += cityState.py * 1.6;
    camera.position.lerp(k.pos, Math.min(1, dt * 2.6 * drift));
    target.current.lerp(k.look, Math.min(1, dt * 2.6));
    camera.lookAt(target.current);

    // atmosphere turns crimson through the awakening
    const crimson = ramp(p, 0.66, 0.86);
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.color.copy(NIGHT).lerp(CRIMSON, crimson);
      fog.density = lerp(0.017, 0.0075, ramp(p, 0.05, 0.4)) + crimson * 0.006;
    }
  });
  return null;
}

/* --------------------------------------------------------------- buildings */

function City() {
  const group = useRef<THREE.Group>(null);
  const windows = useRef<THREE.InstancedMesh>(null);
  const buildings = useMemo(() => buildCity(), []);

  /** every window in the city, precomputed once */
  const win = useMemo(() => {
    const rnd = seeded(99117);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1.05, 1.35, 1);
    const mats: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const lit: boolean[] = [];

    buildings.forEach((b) => {
      const floors = Math.max(3, Math.floor(b.h / 3.1));
      const cols = Math.max(2, Math.floor(b.w / 1.7));
      for (let f = 0; f < floors; f++) {
        for (let c = 0; c < cols; c++) {
          const y = 2.4 + f * 3.1;
          if (y > b.h - 1.2) continue;
          const inward = b.x < 0 ? 1 : -1;
          const x = b.x + inward * (b.d / 2 + 0.05);
          const z = b.z - b.w / 2 + 0.9 + (c * (b.w - 1.6)) / Math.max(1, cols - 1);
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), inward > 0 ? Math.PI / 2 : -Math.PI / 2);
          m.compose(new THREE.Vector3(x, y, z), q, s);
          mats.push(m.clone());
          const roll = rnd();
          const isLit = roll > 0.2;
          lit.push(isLit);
          colors.push(
            !isLit ? DARK : roll > 0.86 ? CYAN : roll > 0.62 ? DIM : WARM,
          );
        }
      }
    });
    return { mats, colors, lit };
  }, [buildings]);

  // seed instances once
  const seededOnce = useRef(false);
  useFrame(({ clock }, dt) => {
    const p = cityState.progress;
    const mesh = windows.current;
    if (mesh && !seededOnce.current) {
      win.mats.forEach((mm, i) => mesh.setMatrixAt(i, mm));
      win.colors.forEach((c, i) => mesh.setColorAt(i, c));
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      seededOnce.current = true;
    }

    // buildings rise out of the ground grid
    if (group.current) {
      const rise = ease(ramp(p, 0.1, 0.42));
      group.current.position.y = lerp(-46, 0, rise);
    }

    // flicker: nudge a rotating slice of lit windows every frame
    if (mesh && mesh.instanceColor && win.mats.length) {
      const t = clock.elapsedTime;
      const n = win.mats.length;
      const start = Math.floor(t * 240) % n;
      const c = new THREE.Color();
      for (let k = 0; k < 90; k++) {
        const i = (start + k) % n;
        if (!win.lit[i]) continue;
        const pulse = 0.62 + 0.38 * Math.abs(Math.sin(t * 1.4 + i * 0.7));
        c.copy(win.colors[i]).multiplyScalar(pulse);
        mesh.setColorAt(i, c);
      }
      mesh.instanceColor.needsUpdate = true;
    }
    void dt;
  });

  return (
    <group ref={group}>
      {/* street plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -110]} receiveShadow>
        <planeGeometry args={[400, 420]} />
        <meshStandardMaterial color="#05070b" roughness={0.85} metalness={0.15} />
      </mesh>

      {buildings.map((b, i) => {
        const inward = b.x < 0 ? 1 : -1;
        // real towers are stepped: a wider podium, a shaft, then a setback crown
        const podium = Math.min(6, b.h * 0.22);
        const crown = b.h * 0.16;
        const shaft = b.h - podium - crown;
        return (
          <group key={i} position={[b.x, 0, b.z]}>
            {/* podium */}
            <mesh position={[0, podium / 2, 0]}>
              <boxGeometry args={[b.d * 1.16, podium, b.w * 1.08]} />
              <meshStandardMaterial color="#101521" roughness={0.74} metalness={0.24} />
            </mesh>
            {/* shaft */}
            <mesh position={[0, podium + shaft / 2, 0]}>
              <boxGeometry args={[b.d, shaft, b.w]} />
              <meshStandardMaterial color="#141a26" roughness={0.68} metalness={0.3} />
            </mesh>
            {/* setback crown */}
            <mesh position={[0, podium + shaft + crown / 2, 0]}>
              <boxGeometry args={[b.d * 0.82, crown, b.w * 0.84]} />
              <meshStandardMaterial color="#171d2b" roughness={0.62} metalness={0.34} />
            </mesh>
            {/* parapet lip so roofs read as concrete, not cut boxes */}
            <mesh position={[0, b.h + 0.22, 0]}>
              <boxGeometry args={[b.d * 0.9, 0.44, b.w * 0.92]} />
              <meshStandardMaterial color="#0d121c" roughness={0.8} />
            </mesh>
            {/* stair block + water tank + antenna clutter on the roof */}
            <mesh position={[b.d * 0.18, b.h + 1.3, b.w * 0.16]}>
              <boxGeometry args={[b.d * 0.3, 2.2, b.w * 0.26]} />
              <meshStandardMaterial color="#121722" roughness={0.75} />
            </mesh>
            {b.tank && (
              <group position={[-b.d * 0.2, b.h + 1.9, -b.w * 0.18]}>
                <mesh>
                  <cylinderGeometry args={[0.7, 0.7, 1.6, 12]} />
                  <meshStandardMaterial color="#141822" roughness={0.6} />
                </mesh>
                {[0, 1, 2, 3].map((k) => (
                  <mesh
                    key={k}
                    position={[
                      Math.cos((k / 4) * Math.PI * 2) * 0.55,
                      -1.3,
                      Math.sin((k / 4) * Math.PI * 2) * 0.55,
                    ]}
                  >
                    <cylinderGeometry args={[0.06, 0.06, 1.1, 6]} />
                    <meshStandardMaterial color="#0f131c" roughness={0.8} />
                  </mesh>
                ))}
              </group>
            )}
            {i % 5 === 0 && (
              <mesh position={[0, b.h + 4.4, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 8, 5]} />
                <meshStandardMaterial
                  color="#2a1116"
                  emissive="#ff2f3a"
                  emissiveIntensity={0.7}
                  roughness={0.5}
                />
              </mesh>
            )}
            {/* horizontal floor bands: the strongest real-city cue at distance */}
            {Array.from({ length: Math.max(2, Math.floor(b.h / 9)) }).map((_, k) => (
              <mesh
                key={`band${k}`}
                position={[inward * (b.d / 2 + 0.06), podium + ((k + 1) * shaft) / (Math.floor(b.h / 9) + 1), 0]}
              >
                <boxGeometry args={[0.12, 0.3, b.w * 0.98]} />
                <meshStandardMaterial color="#0b0f18" roughness={0.85} />
              </mesh>
            ))}
            {/* balcony slabs with railings, facing the alley */}
            {Array.from({ length: b.balconies }).map((_, k) => (
              <group
                key={k}
                position={[
                  inward * (b.d / 2 + 0.42),
                  4 + ((k + 1) * b.h) / (b.balconies + 1),
                  0,
                ]}
              >
                <mesh>
                  <boxGeometry args={[0.85, 0.14, b.w * 0.72]} />
                  <meshStandardMaterial color="#171b24" roughness={0.7} />
                </mesh>
                <mesh position={[inward * 0.4, 0.42, 0]}>
                  <boxGeometry args={[0.06, 0.72, b.w * 0.72]} />
                  <meshStandardMaterial
                    color="#1d222d"
                    roughness={0.55}
                    metalness={0.5}
                    transparent
                    opacity={0.75}
                  />
                </mesh>
              </group>
            ))}
            {/* a warm sodium pool of light at street level */}
            {i % 3 === 0 && (
              <pointLight
                position={[inward * 2.6, 3.2, 0]}
                color="#ff9b3d"
                intensity={12}
                distance={16}
              />
            )}
          </group>
        );
      })}


      <instancedMesh
        ref={windows}
        args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, win.mats.length]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

/* -------------------------------------------------------------------- dust */

function Dust({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const rnd = seeded(4242);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - 0.5) * 90;
      positions[i * 3 + 1] = rnd() * 70;
      positions[i * 3 + 2] = -rnd() * 240 + 30;
      seeds[i] = rnd() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.elapsedTime;
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i += 3) {
      attr.setY(i, ((positions[i * 3 + 1] + t * 0.5 + seeds[i] * 3) % 70));
    }
    attr.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(t * 0.7) * 0.08;
    mat.color.copy(WARM).lerp(new THREE.Color("#ff3344"), ramp(cityState.progress, 0.68, 0.9));
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------- crimson reaching figure */

function CrimsonHand() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const p = cityState.progress;
    // swells through the awakening, then recedes so the release panel can breathe
    const on = ramp(p, 0.64, 0.8) * (1 - ramp(p, 0.86, 0.95) * 0.72);
    const t = clock.elapsedTime;
    g.current.visible = on > 0.01;
    g.current.scale.setScalar(0.35 + on * 0.75);
    g.current.position.set(0, 16 + Math.sin(t * 0.6) * 0.7, -224 + on * 5);
    g.current.rotation.y = t * 0.22;
    g.current.rotation.x = Math.sin(t * 0.4) * 0.18;
    g.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "opacity" in m) m.opacity = on;
    });
  });

  return (
    <group ref={g}>
      {/* stylised metallic lotus / orb reaching for the viewer */}
      <mesh>
        <icosahedronGeometry args={[2.4, 1]} />
        <meshStandardMaterial
          color="#3a0509"
          emissive="#ff2400"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.24}
          transparent
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2.4, 0, (i / 6) * Math.PI * 2]}
          position={[0, 0, 0]}
        >
          <torusGeometry args={[3.4 + i * 0.16, 0.045, 8, 90]} />
          <meshStandardMaterial
            color="#8b0000"
            emissive="#ff3344"
            emissiveIntensity={2.2}
            transparent
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
      <pointLight color="#ff2400" intensity={90} distance={70} />
    </group>
  );
}

/* --------------------------------------------------------- release burst */

function ReleaseBurst() {
  const ref = useRef<THREE.Points>(null);
  const fired = useRef(0);
  const clockRef = useRef(0);
  const count = 900;

  const { positions, dirs } = useMemo(() => {
    const rnd = seeded(777);
    const positions = new Float32Array(count * 3);
    const dirs = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      const sp = 0.5 + rnd() * 2.4;
      dirs[i * 3] = Math.sin(b) * Math.cos(a) * sp;
      dirs[i * 3 + 1] = Math.abs(Math.cos(b)) * sp * 1.5;
      dirs[i * 3 + 2] = Math.sin(b) * Math.sin(a) * sp;
    }
    return { positions, dirs };
  }, []);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    if (cityState.burst !== fired.current) {
      fired.current = cityState.burst;
      clockRef.current = 0;
    }
    const life = 3.6;
    if (clockRef.current > life) {
      pts.visible = false;
      return;
    }
    pts.visible = true;
    clockRef.current += dt;
    const t = clockRef.current;
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      attr.setXYZ(
        i,
        dirs[i * 3] * t * 3.2,
        dirs[i * 3 + 1] * t * 3.2 - t * t * 0.6,
        dirs[i * 3 + 2] * t * 3.2,
      );
    }
    attr.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - t / life);
  });

  return (
    <points ref={ref} position={[0, 14, -206]} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#ffaa44"
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Everything inside the WebGL canvas. */
export default function CityScene() {
  return (
    <>
      <fogExp2 attach="fog" args={["#07090e", 0.017]} />
      <ambientLight intensity={0.75} color="#5b6a8c" />
      <hemisphereLight args={["#26324a", "#06080d", 0.9]} />
      <pointLight position={[0, 30, 10]} intensity={220} distance={140} color="#ffaa44" />
      <pointLight position={[0, 24, -90]} intensity={180} distance={150} color="#00e5ff" />
      <CameraRig />
      <City />
      <Dust />
      <CrimsonHand />
      <ReleaseBurst />
    </>
  );
}
