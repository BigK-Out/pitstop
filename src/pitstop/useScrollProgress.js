import { useEffect, useRef } from "react";
import { progressFor } from "./progress";
import { pitStopTimeline } from "./timeline";

// Tracks scroll progress through the section in `ref` without re-rendering React.
// The returned ref feeds the 3D scene; CSS custom properties feed the HTML layers.
// When `enabled` is false the section is pinned to its final frame (p = 1).
export function useScrollProgress(ref, enabled) {
  const progress = useRef(enabled ? 0 : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (p) => {
      progress.current = p;
      const t = pitStopTimeline(p);
      el.style.setProperty("--intro-opacity", String(t.introOpacity));
      el.style.setProperty("--intro-shift", `${t.introShift}px`);
      el.style.setProperty("--reveal-opacity", String(t.revealOpacity));
      el.toggleAttribute("data-revealed", t.revealVisible);
      el.toggleAttribute("data-intro-gone", t.introOpacity === 0);
    };

    if (!enabled) {
      apply(1);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      apply(progressFor(rect.top, rect.height, window.innerHeight));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, enabled]);

  return progress;
}
