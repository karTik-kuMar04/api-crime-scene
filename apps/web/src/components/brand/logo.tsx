import type { IconProps } from "../icons";

/**
 * Evidence marker mark — a tent-shaped numbered placard
 * containing three waterfall-chart bars of different lengths.
 * Works at 16px, one colour (currentColor), both themes.
 */
export function Logo({ size = 24, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* Tent-shaped evidence placard */}
      <path
        d="M12 2L5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10L12 2Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Three horizontal bars — waterfall lengths */}
      <line x1="8.5" y1="13" x2="15.5" y2="13" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="8.5" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="8.5" y1="19" x2="11" y2="19" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
