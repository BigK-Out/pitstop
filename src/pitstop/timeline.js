const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Position of p inside [a, b], clamped to 0..1.
export const seg = (p, a, b) => clamp01((p - a) / (b - a));

export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Every animated value of the Pit Stop hero for scroll progress p (0..1).
// Single source of truth for both the 3D scene and the HTML layers.
export function pitStopTimeline(p) {
  const intro = seg(p, 0.08, 0.28);
  const approach = easeInOutCubic(seg(p, 0, 0.3));
  return {
    introOpacity: 1 - intro,
    introShift: 40 * intro,
    travel: approach,
    turn: 0.6 * (1 - approach),
    scale: 1 + 0.15 * approach,
    split: easeInOutCubic(seg(p, 0.3, 0.65)),
    pitLift: easeInOutCubic(seg(p, 0.45, 0.75)),
    revealOpacity: seg(p, 0.7, 0.85),
    revealVisible: p >= 0.7,
  };
}
