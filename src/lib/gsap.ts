import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

/** Register once, client side only. Safe to import from anywhere. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, TextPlugin);
}

/** House easing: butter smooth, never bouncy. */
export const EASE = "power3.out";
export const EASE_IO = "power2.inOut";

export { gsap, useGSAP, ScrollTrigger, SplitText, TextPlugin };
