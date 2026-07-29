import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PALETTE = ["#c9a25e", "#d9a09a", "#d0684a"];

/**
 * A very light three.js layer used behind ordinary sections: slow drifting
 * motes plus one lazy wire form. Cheap enough to sit on the page more than once.
 */
function Motes({ count, spread }: { count: number; spread: number }) {
  const points = useRef<THREE.Points>(null);
  const { positions, colors, seeds, base } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const palette = PALETTE.map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.62;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, seeds, base: Float32Array.from(positions) };
  }, [count, spread]);

  useFrame(({ clock, pointer }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.setY(i, base[i * 3 + 1] + Math.sin(t * 0.26 + seeds[i]) * 0.34);
      pos.setX(i, base[i * 3] + Math.cos(t * 0.18 + seeds[i]) * 0.22);
    }
    pos.needsUpdate = true;
    points.current.rotation.y = t * 0.015 + pointer.x * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.032}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function WireForm({ shape }: { shape: "icosa" | "torus" | "octa" }) {
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    if (shape === "torus") return new THREE.TorusKnotGeometry(1.35, 0.28, 90, 8);
    if (shape === "octa") return new THREE.OctahedronGeometry(1.7, 1);
    return new THREE.IcosahedronGeometry(1.7, 1);
  }, [shape]);

  useFrame(({ clock, pointer }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime();
    g.current.rotation.y = t * 0.09 + pointer.x * 0.15;
    g.current.rotation.x = Math.sin(t * 0.2) * 0.35 - pointer.y * 0.1;
    g.current.position.y = Math.sin(t * 0.4) * 0.22;
  });

  return (
    <group ref={g}>
      <lineSegments>
        <wireframeGeometry args={[geo]} />
        <lineBasicMaterial color="#c9a25e" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}

export default function AmbientField({
  count = 320,
  spread = 14,
  shape = "icosa",
  showForm = true,
}: {
  count?: number;
  spread?: number;
  shape?: "icosa" | "torus" | "octa";
  showForm?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop="always"
    >
      <Motes count={count} spread={spread} />
      {showForm && <WireForm shape={shape} />}
    </Canvas>
  );
}
