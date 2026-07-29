import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const AmbientField = lazy(() => import("./three/AmbientField"));

/**
 * Drops a soft three.js field behind any section. Purely decorative,
 * never blocks clicks, and only renders on the client.
 */
export function SceneLayer({
  className = "",
  count,
  spread,
  shape,
  showForm,
}: {
  className?: string;
  count?: number;
  spread?: number;
  shape?: "icosa" | "torus" | "octa";
  showForm?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-45 sm:opacity-70 ${className}`}
    >
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <AmbientField count={count} spread={spread} shape={shape} showForm={showForm} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
