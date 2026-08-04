import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { THOUGHTS, type Thought } from "@/lib/unspoken";
import { cityState } from "@/lib/city-state";

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function Node({
  thought,
  active,
  open,
  onOpen,
}: {
  thought: Thought;
  active: boolean;
  open: boolean;
  onOpen: (id: string | null) => void;
}) {
  const g = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const card = useRef<HTMLDivElement>(null);

  useFrame(({ clock }) => {
    const p = cityState.progress;
    // nodes live through the map act, and fade with distance to the camera
    const band = clamp01((p - 0.33) / 0.06) * (1 - clamp01((p - 0.68) / 0.05));
    const vis = active ? band : band * 0.14;
    const t = clock.elapsedTime;
    // the spatial card is DOM, so it has to be faded by style, not group.visible
    if (card.current) {
      card.current.style.opacity = String(vis);
      card.current.style.pointerEvents = vis > 0.35 ? "auto" : "none";
      card.current.style.transform = `translateY(${(1 - vis) * 14}px)`;
    }
    if (g.current) {
      g.current.visible = vis > 0.02;
      g.current.position.y = thought.pos[1] + Math.sin(t * 0.7 + thought.pos[2]) * 0.35;
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = vis * (0.35 + 0.35 * Math.abs(Math.sin(t * 1.6 + thought.pos[2])));
      ring.current.scale.setScalar(1 + Math.sin(t * 1.2 + thought.pos[2]) * 0.08);
      ring.current.lookAt(0, thought.pos[1], thought.pos[2] + 40);
    }
  });

  const inward = thought.pos[0] < 0 ? 1 : -1;

  return (
    <group ref={g} position={[thought.pos[0], thought.pos[1], thought.pos[2]]}>
      {/* glowing aura ring on the window itself */}
      <mesh ref={ring} position={[inward * 0.3, 0, 0]}>
        <ringGeometry args={[1.1, 1.32, 48]} />
        <meshBasicMaterial
          color={active ? "#ffaa44" : "#00e5ff"}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <Html
        position={[inward * 2.4, 0.6, 0]}
        center
        distanceFactor={26}
        occlude={false}
        zIndexRange={[20, 0]}
      >
        <div ref={card} style={{ opacity: 0, transition: "opacity 320ms ease" }}>
        <button
          type="button"
          onClick={() => onOpen(open ? null : thought.id)}
          className={`glass-node text-left transition-all duration-500 ${
            open ? "w-[19rem] scale-100" : "w-[14rem] hover:scale-[1.04]"
          } ${active ? "opacity-100" : "opacity-40"}`}
        >
          <span className="block text-[0.5rem] uppercase tracking-[0.3em] text-primary/90">
            {thought.label}
          </span>
          <span
            className={`mt-1.5 block font-display leading-snug text-cream ${
              open ? "text-[0.78rem]" : "line-clamp-2 text-[0.72rem]"
            }`}
          >
            {thought.text}
          </span>
          {open && (
            <span className="mt-2 block text-[0.5rem] uppercase tracking-[0.28em] text-muted-foreground">
              Anonymous · window {Math.abs(Math.round(thought.pos[2]))}
            </span>
          )}
        </button>
        </div>
      </Html>
    </group>
  );
}

export function ThoughtNodes({
  filter,
  openId,
  onOpen,
}: {
  filter: string;
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  return (
    <group>
      {THOUGHTS.map((t) => (
        <Node
          key={t.id}
          thought={t}
          active={filter === "All" || t.category === filter}
          open={openId === t.id}
          onOpen={onOpen}
        />
      ))}
    </group>
  );
}
