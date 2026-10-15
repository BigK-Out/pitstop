const SUGAR = [
  [64, 146],
  [86, 120],
  [92, 152],
  [124, 128],
  [146, 154],
  [140, 122],
  [110, 162],
];

// Product line illustration. Drawn in currentColor so each plate sets its own ink.
export default function CherryArt({ variant, label }) {
  return (
    <svg
      className="cherry-art"
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M78 108 C 84 72, 104 48, 124 34 M134 114 C 132 82, 128 58, 124 34" />
      <path d="M124 34 C 140 18, 164 22, 172 34 C 156 46, 136 44, 124 34 Z" />
      <path d="M128 34 C 144 31, 158 31, 168 34" opacity="0.6" />
      {variant === "mixed" && <circle cx="104" cy="156" r="18" />}
      <circle cx="78" cy="136" r="28" />
      <circle cx="134" cy="140" r="26" />
      <path d="M64 128 a 15 15 0 0 1 11 -9" opacity="0.7" />
      <path d="M121 132 a 14 14 0 0 1 10 -8" opacity="0.7" />
      {variant === "choc" && (
        <g fill="currentColor" stroke="none" opacity="0.85">
          <path d="M50 136 a28 28 0 0 0 56 0 Z" />
          <path d="M108 140 a26 26 0 0 0 52 0 Z" />
        </g>
      )}
      {variant === "sour" && (
        <g fill="currentColor" stroke="none">
          {SUGAR.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
          ))}
        </g>
      )}
    </svg>
  );
}
