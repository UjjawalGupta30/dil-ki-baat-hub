import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const EmotionalCore = lazy(() => import("@/components/three/EmotionalCore"));

/**
 * One WebGL layer for the whole page. It sits fixed behind everything and is
 * driven purely by scroll progress, so the geometry never remounts and the
 * story reads as one continuous take.
 */
export function CoreCanvas() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-80 sm:opacity-100"
    >
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <EmotionalCore />
        </Suspense>
      </ClientOnly>
      {/* depth of field: the scene softens toward the page edges */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,transparent_0%,var(--core-veil)_100%)]" />
    </div>
  );
}
