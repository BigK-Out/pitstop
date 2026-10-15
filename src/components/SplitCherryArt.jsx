// Static final frame of the Pit Stop: shown before the 3D scene loads, without WebGL,
// if the scene fails, and as the 3D fallback for reduced motion.
export default function SplitCherryArt({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      role="img"
      aria-label="A cherry split in half with its pit lifted out"
    >
      <g transform="rotate(-14 130 250)">
        <path d="M130 150 A100 100 0 0 0 130 350 Z" fill="#c3142f" />
        <ellipse cx="130" cy="250" rx="34" ry="100" fill="#7a0b1f" />
        <ellipse cx="130" cy="250" rx="16" ry="44" fill="#4a0a14" />
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
          stroke="#6b8f3a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M180 52 C 200 30, 236 34, 244 50 C 222 64, 198 64, 180 52 Z" fill="#7cb553" />
      </g>
      <g transform="rotate(14 270 250)">
        <path d="M270 150 A100 100 0 0 1 270 350 Z" fill="#c3142f" />
        <ellipse cx="270" cy="250" rx="34" ry="100" fill="#7a0b1f" />
        <ellipse cx="270" cy="250" rx="16" ry="44" fill="#4a0a14" />
      </g>
      <ellipse cx="200" cy="112" rx="24" ry="32" fill="#c9a777" />
      <ellipse cx="192" cy="102" rx="6" ry="9" fill="#fff" opacity="0.3" />
    </svg>
  );
}
