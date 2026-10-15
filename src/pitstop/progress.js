// How far the page has scrolled through a pinned section: 0 at its top, 1 when its end
// reaches the bottom of the viewport.
export function progressFor(rectTop, sectionHeight, viewportHeight) {
  const range = sectionHeight - viewportHeight;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, -rectTop / range));
}
