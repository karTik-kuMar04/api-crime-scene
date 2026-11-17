"use client";

/**
 * Signal field — 7 smooth flowing contour lines like topography
 * or packet traces. 1px strokes in accent and abstract at low opacity.
 * Purely decorative. Never animated.
 */
export function SignalField({
  width = 320,
  height = 200,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 200"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Accent lines */}
      <path
        d="M10 180 C60 170, 100 130, 160 125 S260 110, 310 100"
        stroke="var(--accent)"
        strokeWidth={1}
        opacity="var(--signal-opacity-1, 0.10)"
      />
      <path
        d="M10 160 C50 145, 110 120, 170 110 S250 95, 310 80"
        stroke="var(--accent)"
        strokeWidth={1}
        opacity="var(--signal-opacity-2, 0.12)"
      />
      <path
        d="M10 140 C70 125, 120 95, 180 90 S260 75, 310 60"
        stroke="var(--accent)"
        strokeWidth={1}
        opacity="var(--signal-opacity-3, 0.08)"
      />
      {/* Abstract lines */}
      <path
        d="M10 120 C55 110, 90 85, 155 78 S245 65, 310 48"
        stroke="var(--abstract)"
        strokeWidth={1}
        opacity="var(--signal-opacity-1, 0.10)"
      />
      <path
        d="M10 100 C65 88, 115 65, 175 58 S250 45, 310 32"
        stroke="var(--abstract)"
        strokeWidth={1}
        opacity="var(--signal-opacity-3, 0.08)"
      />
      <path
        d="M10 78 C50 68, 100 50, 165 42 S255 30, 310 18"
        stroke="var(--accent)"
        strokeWidth={1}
        opacity="var(--signal-opacity-4, 0.14)"
      />
      <path
        d="M10 55 C60 48, 120 32, 180 28 S260 18, 310 8"
        stroke="var(--abstract)"
        strokeWidth={1}
        opacity="var(--signal-opacity-1, 0.10)"
      />
    </svg>
  );
}
