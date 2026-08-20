// The MusicNest logo: three overlapping curved "branches" forming a nest,
// with a music note resting in the middle like an egg.
// It's one SVG so it scales cleanly at any size.
export default function Logo({ size = 34 }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 40c4-14 16-24 24-24s20 10 24 24"
        stroke="url(#nestGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M12 45c5-10 14-16 20-16s15 6 20 16"
        stroke="url(#nestGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M17 49c4-7 10-11 15-11s11 4 15 11"
        stroke="url(#nestGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* music note "egg" sitting in the nest */}
      <circle cx="25" cy="39" r="4.5" fill="#ef6b5b" />
      <rect x="28.5" y="16" width="3" height="24" rx="1.5" fill="#ef6b5b" />
      <path d="M28.5 16c4-2 9-1 9 3.5s-5 5.5-9 3.5" fill="#ef6b5b" />

      <defs>
        <linearGradient id="nestGradient" x1="8" y1="16" x2="56" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8a13c" />
          <stop offset="1" stopColor="#ef6b5b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
