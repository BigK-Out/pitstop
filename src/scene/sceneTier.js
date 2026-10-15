import { useState } from "react";
import { isSoftwareRenderer } from "./webgl";

export function pickTier({ width, cores, reducedMotion, software }) {
  if (software) return { floaters: 12, dpr: [1, 1], animate: false };
  const light = width < 768 || (cores ?? 8) <= 4;
  return {
    floaters: light ? 12 : 24,
    dpr: light ? [1, 1.5] : [1, 1.75],
    animate: !reducedMotion,
  };
}

// Chosen once on mount; resizing does not rebuild the scene.
export function useSceneTier() {
  const [tier] = useState(() =>
    pickTier({
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
      software: isSoftwareRenderer(),
    }),
  );
  return tier;
}
