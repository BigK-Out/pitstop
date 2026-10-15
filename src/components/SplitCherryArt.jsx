// Static final frame of the Pit Stop: shown before the 3D scene loads, without WebGL,
// if the scene fails, and as the 3D fallback for reduced motion.
// `whole` draws the opening frame instead: one uncut cherry, used while the pinned scene loads.
export default function SplitCherryArt({ className, whole = false }) {
  if (whole) {
    return (
      <svg
        className={className}
        viewBox="0 0 400 400"
        role="img"
        aria-label="A whole cherry on its stem"
      >
        <circle cx="200" cy="250" r="100" fill="#4f0814" />
        <path
          d="M140 210 A70 70 0 0 1 170 178"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 152 C 204 100, 230 70, 260 52"
          stroke="#6f7a3a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      role="img"
      aria-label="A cherry split in half with its pit lifted out"
    >
      <g transform="rotate(-14 130 250)">
        <path d="M130 150 A100 100 0 0 0 130 350 Z" fill="#4f0814" />
        <ellipse cx="130" cy="250" rx="34" ry="100" fill="#8a1426" />
        <ellipse cx="130" cy="250" rx="16" ry="44" fill="#3a0610" />
        <path
          d="M70 210 A70 70 0 0 1 100 178"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 152 C 124 100, 150 70, 180 52"
          stroke="#6f7a3a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g transform="rotate(14 270 250)">
        <path d="M270 150 A100 100 0 0 1 270 350 Z" fill="#4f0814" />
        <ellipse cx="270" cy="250" rx="34" ry="100" fill="#8a1426" />
        <ellipse cx="270" cy="250" rx="16" ry="44" fill="#3a0610" />
      </g>
      <ellipse cx="200" cy="112" rx="24" ry="32" fill="#a8804f" />
      <ellipse cx="192" cy="102" rx="6" ry="9" fill="#fff" opacity="0.3" />
    </svg>
  );
}
