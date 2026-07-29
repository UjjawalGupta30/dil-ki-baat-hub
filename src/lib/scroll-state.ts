/**
 * A single mutable object shared between the DOM layer and the WebGL scene.
 * Deliberately outside React state: the 3D core reads it every frame, so
 * re-rendering components on scroll would destroy the frame budget.
 */
export const scrollState = {
  /** 0 at the top of the document, 1 at the very bottom. */
  progress: 0,
  /** Signed scroll velocity, normalised to roughly -1..1. */
  velocity: 0,
  /** Pointer in normalised device coords (-1..1). */
  px: 0,
  py: 0,
  /** A sentiment the visitor is hovering: particles gather around it. */
  focusActive: false,
  focusX: 0,
  focusY: 0,
  /** True once the chat panel is open, so the core becomes a calm aura. */
  connected: false,
};

export function setFocus(clientX: number, clientY: number) {
  if (typeof window === "undefined") return;
  scrollState.focusActive = true;
  scrollState.focusX = (clientX / window.innerWidth) * 2 - 1;
  scrollState.focusY = -((clientY / window.innerHeight) * 2 - 1);
}

export function clearFocus() {
  scrollState.focusActive = false;
}
