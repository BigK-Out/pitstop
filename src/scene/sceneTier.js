import { useState } from "react";

export function pickTier({ width, cores, reducedMotion }) {
  const light = width < 768 || (cores ?? 8) <= 4;
  return { count: light ? 40 : 100, depthOfField: !light, animate: !reducedMotion };
}

// Chosen once on mount; resizing does not rebuild the scene.
export function useSceneTier() {
  const [tier] = useState(() =>
    pickTier({
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    }),
  );
  return tier;
}
