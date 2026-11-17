import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
}

function Icon({ size = 16, title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export function OverviewIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Gauge/dashboard: arc with needle */}
      <path d="M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 12l3-5" />
      <path d="M8 16h8" />
    </Icon>
  );
}

export function InvestigationsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Case folder with tab */}
      <path d="M4 7h4l2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path d="M7 12h10" />
      <path d="M7 15h6" />
    </Icon>
  );
}

export function CompareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Two offset panes with delta mark */}
      <rect x="3" y="4" width="8" height="14" rx="1" />
      <rect x="13" y="6" width="8" height="14" rx="1" />
      <path d="M15 13l2-3 2 3" strokeWidth={1.5} />
    </Icon>
  );
}

export function RequestExplorerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* List rows with probe dot */}
      <path d="M4 7h16" />
      <path d="M4 12h12" />
      <path d="M4 17h8" />
      <circle cx="19" cy="15" r="2.5" />
      <path d="M21 17l1.5 1.5" />
    </Icon>
  );
}

export function ReportsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Page with seal */}
      <path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v4h4" />
      <circle cx="12" cy="14" r="2.5" />
      <path d="M12 16.5V19" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Gear: hexagonal with centre circle */}
      <path d="M10.3 3h3.4l.5 2.3a7 7 0 0 1 1.7 1l2.2-.7 1.7 2.9-1.6 1.6a7 7 0 0 1 0 2l1.6 1.6-1.7 2.9-2.2-.7a7 7 0 0 1-1.7 1L13.7 21h-3.4l-.5-2.3a7 7 0 0 1-1.7-1l-2.2.7-1.7-2.9 1.6-1.6a7 7 0 0 1 0-2L4.2 10.3l1.7-2.9 2.2.7a7 7 0 0 1 1.7-1L10.3 3Z" />
      <circle cx="12" cy="12" r="2.5" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export function ImportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v12" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  );
}

export function ExportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </Icon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Icon>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4v16" />
      <path d="M4 13l3 3 3-3" />
      <path d="M17 20V4" />
      <path d="M14 7l3-3 3 3" />
    </Icon>
  );
}

export function ExpandIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 14v6h6" />
      <path d="M20 10V4h-6" />
      <path d="M4 20l7-7" />
      <path d="M20 4l-7 7" />
    </Icon>
  );
}

export function CollapseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4v6h6" />
      <path d="M4 14h6v6" />
      <path d="M20 4l-6 6" />
      <path d="M4 20l6-6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 15l6-6 6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12l5 5L20 7" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3L2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l7 3v5c0 5-3 9-7 10-4-1-7-5-7-10V6l7-3Z" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17.9 17.9A10.5 10.5 0 0 1 12 19c-6 0-10-7-10-7a17.5 17.5 0 0 1 4.1-4.9" />
      <path d="M9.9 4.2A8 8 0 0 1 12 4c6 0 10 7 10 7a17.5 17.5 0 0 1-2 2.6" />
      <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <path d="M3 3l18 18" />
    </Icon>
  );
}

export function DomainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
      <path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" />
    </Icon>
  );
}

export function RequestIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Arrow out from node */}
      <circle cx="6" cy="12" r="2" />
      <path d="M8 12h12" />
      <path d="M17 9l3 3-3 3" />
    </Icon>
  );
}

export function ResponseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Arrow in to node */}
      <circle cx="18" cy="12" r="2" />
      <path d="M4 12h12" />
      <path d="M7 9l-3 3 3 3" />
    </Icon>
  );
}

export function PacketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Small node with trace lines */}
      <circle cx="12" cy="12" r="3" />
      <path d="M4 12h5" />
      <path d="M15 12h5" />
      <path d="M12 4v5" />
      <path d="M12 15v5" />
    </Icon>
  );
}

export function DurationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function WaterfallIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Staggered horizontal bars like a waterfall chart */}
      <path d="M4 6h8" strokeWidth={2} />
      <path d="M6 10h10" strokeWidth={2} />
      <path d="M5 14h6" strokeWidth={2} />
      <path d="M8 18h12" strokeWidth={2} />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

export function ThemeLightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M5.6 5.6l1.4 1.4" />
      <path d="M17 17l1.4 1.4" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M5.6 18.4l1.4-1.4" />
      <path d="M17 7l1.4-1.4" />
    </Icon>
  );
}

export function ThemeDarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12.5A8.5 8.5 0 0 1 11.5 4 8.5 8.5 0 1 0 20 12.5Z" />
    </Icon>
  );
}

export function ThemeSystemIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </Icon>
  );
}

export function CommandIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 4.5a3.5 3.5 0 0 1 0 7h-6V8A3.5 3.5 0 0 1 15 4.5Z" />
      <path d="M9 11.5h6v4.5a3.5 3.5 0 0 1-6 0V11.5Z" />
      <path d="M15 11.5a3.5 3.5 0 0 1 0 7" />
      <path d="M9 11.5a3.5 3.5 0 0 1 0-7" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </Icon>
  );
}

export function FileHarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* File with 'HAR' waterfall bars inside */}
      <path d="M6 3h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v4h4" />
      <path d="M8 13h6" strokeWidth={2} />
      <path d="M8 16h4" strokeWidth={2} />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </Icon>
  );
}
