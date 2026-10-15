import { useState } from "react";

// Read once on mount, like the scene tier.
export function useReducedMotion() {
  const [reduced] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  return reduced;
}
