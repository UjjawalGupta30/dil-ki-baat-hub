import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function heartGeometry() {
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x, y + 0.6);
  shape.bezierCurveTo(x, y + 0.95, x - 0.55, y + 1.35, x - 1.05, y + 0.95);
  shape.bezierCurveTo(x - 1.75, y + 0.4, x - 1.35, y - 0.55, x - 0.7, y - 1.05);
  shape.bezierCurveTo(x - 0.35, y - 1.35, x - 0.1, y - 1.6, x, y - 1.85);
  shape.bezierCurveTo(x + 0.1, y - 1.6, x + 0.35, y - 1.35, x + 0.7, y - 1.05);
  shape.bezierCurveTo(x + 1.35, y - 0.55, x + 1.75, y + 0.4, x + 1.05, y + 0.95);
  shape.bezierCurveTo(x + 0.55, y + 1.35, x, y + 0.95, x, y + 0.6);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.16,
    bevelThickness: 0.16,
    curveSegments: 22,
  });
  geo.center();
  return geo;
}

function Heart() {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => heartGeometry(), []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.25;
    group.current.rotation.z = Math.PI;
    group.current.position.y = Math.sin(t * 0.6) * 0.14;
    const pulse = 0.42 * (1 + Math.sin(t * 1.6) * 0.02);
    group.current.scale.setScalar(pulse);
  });

  return (
    <group ref={group}>
      <lineSegments>
        <wireframeGeometry args={[geo]} />
        <lineBasicMaterial color="#D4AF37" transparent opacity={0.5} />
      </lineSegments>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#7a2018" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Particles({ count = 420 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    points.current.rotation.y = t * 0.03;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const base = positions[i * 3 + 1];
      pos.setY(i, base + Math.sin(t * 0.4 + i) * 0.18);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#E8C97A" size={0.035} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function HeartScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <Heart />
      <Particles />
    </Canvas>
  );
}
