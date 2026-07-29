import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = new THREE.Color("#D4AF37");
const EMBER = new THREE.Color("#C4643F");

/** Organic breathing displacement so the sphere feels alive, not mechanical. */
function displace(v: THREE.Vector3, t: number, amp: number) {
  const n =
    Math.sin(v.x * 2.1 + t * 0.9) * Math.cos(v.y * 1.7 - t * 0.7) +
    Math.sin(v.z * 2.4 + t * 1.1) * 0.6;
  return 1 + n * amp;
}

function Orb() {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.55, 6), []);
  const base = useMemo(() => geo.attributes.position.array.slice() as Float32Array, [geo]);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    // gentle double thump, like a resting heartbeat
    const beat = 1 + Math.pow(Math.max(0, Math.sin(t * 1.15)), 12) * 0.05;

    for (let i = 0; i < pos.count; i++) {
      v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
      const s = displace(v.clone().normalize(), t, 0.055) * beat;
      pos.setXYZ(i, v.x * s, v.y * s, v.z * s);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    if (mesh.current) {
      mesh.current.rotation.y = t * 0.11;
      mesh.current.rotation.x = Math.sin(t * 0.18) * 0.12 + pointer.y * 0.08;
      mesh.current.rotation.z = pointer.x * 0.06;
    }
    if (halo.current) {
      const s = 1 + Math.sin(t * 0.8) * 0.03;
      halo.current.scale.setScalar(s);
      halo.current.rotation.y = -t * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geo}>
        <meshStandardMaterial
          color={GOLD}
          wireframe
          transparent
          opacity={0.42}
          emissive={GOLD}
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh ref={halo}>
        <sphereGeometry args={[1.34, 48, 48]} />
        <meshBasicMaterial
          color={EMBER}
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Motes({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.1 + Math.random() * 2.6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.75;
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.045;
    ref.current.rotation.x = Math.sin(t * 0.12) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        color={GOLD}
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Glowing organic pulse sphere that floats behind the hero copy. */
export default function PulseSphere() {
  return (
    <Canvas
      dpr={[1, 1.7]}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 2, 4]} intensity={22} color="#E2C382" />
      <pointLight position={[-4, -2, 2]} intensity={12} color="#C4643F" />
      <Orb />
      <Motes />
    </Canvas>
  );
}
