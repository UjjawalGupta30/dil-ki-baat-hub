import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = "#c9a25e";
const ROSE = "#d9a09a";
const EMBER = "#d0684a";
const PLUM = "#6d2a4d";

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
    depth: 0.55,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.18,
    bevelThickness: 0.18,
    curveSegments: 26,
  });
  geo.center();
  return geo;
}

function Heart() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const geo = useMemo(() => heartGeometry(), []);
  const { viewport } = useThree();
  const scaleBase = Math.min(1, Math.max(0.52, viewport.width / 9));

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      // gentle mouse parallax — feels alive, never jerky
      group.current.rotation.x += (pointer.y * 0.22 - group.current.rotation.x) * 0.03;
      group.current.position.x += (pointer.x * 0.5 - group.current.position.x) * 0.03;
      group.current.position.y += (Math.sin(t * 0.5) * 0.16 - group.current.position.y) * 0.05;
    }
    if (inner.current) {
      inner.current.rotation.y = t * 0.22;
      inner.current.rotation.z = Math.PI;
      // heartbeat: a double-thump, not a sine pulse
      const beat = Math.pow(Math.max(0, Math.sin(t * 1.15)), 12) * 0.05;
      const beat2 = Math.pow(Math.max(0, Math.sin(t * 1.15 - 0.45)), 14) * 0.03;
      inner.current.scale.setScalar(scaleBase * (0.44 + beat + beat2));
    }
  });

  return (
    <group ref={group}>
      <group ref={inner}>
        <lineSegments>
          <wireframeGeometry args={[geo]} />
          <lineBasicMaterial color={GOLD} transparent opacity={0.42} />
        </lineSegments>
        <lineSegments scale={1.055}>
          <wireframeGeometry args={[geo]} />
          <lineBasicMaterial color={ROSE} transparent opacity={0.16} />
        </lineSegments>
        <mesh geometry={geo}>
          <meshBasicMaterial color={PLUM} transparent opacity={0.22} />
        </mesh>
        <mesh geometry={geo} scale={0.72}>
          <meshBasicMaterial color={EMBER} transparent opacity={0.12} />
        </mesh>
      </group>
    </group>
  );
}

function Dust({ count = 500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const palette = [new THREE.Color(GOLD), new THREE.Color(ROSE), new THREE.Color(EMBER)];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, seeds };
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    points.current.rotation.y = t * 0.022 + pointer.x * 0.06;
    points.current.rotation.x += (pointer.y * 0.05 - points.current.rotation.x) * 0.02;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.setY(i, positions[i * 3 + 1] + Math.sin(t * 0.32 + seeds[i]) * 0.22);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.038}
        transparent
        opacity={0.62}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rings() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime();
    g.current.rotation.z = t * 0.05;
    g.current.rotation.x = Math.sin(t * 0.18) * 0.25;
  });
  return (
    <group ref={g}>
      <mesh>
        <torusGeometry args={[2.5, 0.004, 8, 160]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0.7, 0.3, 0]}>
        <torusGeometry args={[3.15, 0.003, 8, 160]} />
        <meshBasicMaterial color={ROSE} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function HeartScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.6} />
      <Heart />
      <Rings />
      <Dust />
    </Canvas>
  );
}
