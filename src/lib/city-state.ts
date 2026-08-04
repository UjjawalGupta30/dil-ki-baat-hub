/**
 * Shared mutable state between the DOM overlay and the WebGL city. Kept out of
 * React state on purpose: the scene samples it every frame.
 */
export const cityState = {
  /** 0 at the top of the scroll track, 1 at the bottom. */
  progress: 0,
  /** pointer in normalised device coords */
  px: 0,
  py: 0,
  /** bumped each time a thought is released, triggering the 3D particle burst */
  burst: 0,
};
