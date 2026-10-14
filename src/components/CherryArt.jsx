const BACKGROUNDS = {
  classic: "#ffe3d6",
  sour: "#fff1c9",
  choc: "#f3dfd2",
  mixed: "#ffd9e0",
};

const STEMS = "M80 98 C 86 62, 104 38, 120 26 M130 102 C 128 70, 123 46, 120 26";

function Cherry({ cx, cy, r, fill }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.22} fill="#fff" opacity="0.4" />
    </g>
  );
}

// Product illustration: two (or three) cherries on a stem, varied per product.
export default function CherryArt({ variant, label }) {
  return (
    <svg className="cherry-art" viewBox="0 0 200 150" role="img" aria-label={label}>
      <rect width="200" height="150" fill={BACKGROUNDS[variant]} />
      <path d={STEMS} stroke="#3f7d20" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M120 26 C 138 10, 160 14, 166 24 C 150 34, 134 34, 120 26 Z" fill="#5aa12e" />
      {variant === "mixed" && <Cherry cx={104} cy={128} r={17} fill="#e0485f" />}
      <Cherry cx={80} cy={108} r={26} fill={variant === "sour" ? "#d81e3a" : "#a3102a"} />
      <Cherry cx={130} cy={112} r={24} fill={variant === "mixed" ? "#7a0b1f" : "#b3132b"} />
      {variant === "choc" && (
        <g fill="#4a2617">
          <path d="M54 108 a26 26 0 0 0 52 0 Z" />
          <path d="M106 112 a24 24 0 0 0 48 0 Z" />
        </g>
      )}
      {variant === "sour" && (
        <g fill="#fff" opacity="0.85">
          <circle cx="70" cy="118" r="2" />
          <circle cx="88" cy="96" r="1.6" />
          <circle cx="94" cy="120" r="2" />
          <circle cx="122" cy="104" r="1.8" />
          <circle cx="140" cy="122" r="2" />
          <circle cx="134" cy="98" r="1.5" />
        </g>
      )}
    </svg>
  );
}
