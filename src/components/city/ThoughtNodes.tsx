import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { THOUGHTS, type Thought } from "@/lib/unspoken";
import { cityState } from "@/lib/city-state";
import { playChime } from "@/lib/audio-engine";

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
  const halo = useRef<THREE.Mesh>(null);
  const card = useRef<HTMLDivElement>(null);

  useFrame(({ clock }) => {
    const p = cityState.progress;
    // nodes live through the windows act, and fade with distance to the camera
    const band = clamp01((p - 0.33) / 0.06) * (1 - clamp01((p - 0.68) / 0.05));
    const vis = active ? band : band * 0.12;
    const t = clock.elapsedTime;
    // the spatial card is DOM, so it has to be faded by style, not group.visible
    if (card.current) {
      card.current.style.opacity = String(vis);
      card.current.style.pointerEvents = vis > 0.35 ? "auto" : "none";
      card.current.style.transform = `translateY(${(1 - vis) * 26}px) scale(${0.9 + vis * 0.1})`;
    }
    if (g.current) {
      g.current.visible = vis > 0.02;
      g.current.position.y = thought.pos[1] + Math.sin(t * 0.7 + thought.pos[2]) * 0.35;
    }
    if (ring.current) {
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = vis * (0.4 + 0.35 * Math.abs(Math.sin(t * 1.6 + thought.pos[2])));
      ring.current.scale.setScalar(1 + Math.sin(t * 1.2 + thought.pos[2]) * 0.1);
      ring.current.lookAt(0, thought.pos[1], thought.pos[2] + 40);
    }
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      m.opacity = vis * 0.16 * (open ? 2.2 : 1);
      halo.current.scale.setScalar(2.4 + Math.sin(t * 0.9 + thought.pos[2]) * 0.3 + (open ? 1.2 : 0));
      halo.current.lookAt(0, thought.pos[1], thought.pos[2] + 40);
    }
  });

  const inward = thought.pos[0] < 0 ? 1 : -1;

  return (
    <group ref={g} position={[thought.pos[0], thought.pos[1], thought.pos[2]]}>
      {/* soft bloom bleeding out of the window */}
      <mesh ref={halo} position={[inward * 0.3, 0, 0]}>
        <circleGeometry args={[1.4, 32]} />
        <meshBasicMaterial
          color={active ? "#ffb257" : "#3fd8ff"}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

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
        position={[inward * 3.4, 1.4, 0]}
        center
        distanceFactor={17}
        occlude={false}
        zIndexRange={[20, 0]}
      >
        <div ref={card} style={{ opacity: 0, transition: "opacity 380ms ease, transform 520ms cubic-bezier(.16,1,.3,1)" }}>
          <button
            type="button"
            onClick={() => {
              playChime(open ? 392 : 587.33);
              onOpen(open ? null : thought.id);
            }}
            className={`glass-node text-left transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
              open ? "w-[26rem] scale-[1.02]" : "w-[19rem] hover:scale-[1.05]"
            } ${active ? "opacity-100" : "opacity-40"}`}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.28em] text-primary/90">
                {thought.label}
              </span>
            </span>
            <span
              className={`mt-2.5 block font-display leading-snug text-cream ${
                open ? "text-[1.15rem]" : "line-clamp-3 text-[1.02rem]"
              }`}
            >
              &ldquo;{thought.text}&rdquo;
            </span>
            <span className="mt-3 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.24em] text-muted-foreground">
              <span>anonymous · window {Math.abs(Math.round(thought.pos[2]))}</span>
              <span className="text-primary/80">{open ? "close" : "read"}</span>
            </span>
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
