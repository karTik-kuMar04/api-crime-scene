import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function IconBase({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {children}
    </svg>
  );
}

export function OverviewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 12.5 12 4l8.5 8.5" />
      <path d="M5 10.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8.5" />
      <path d="M9 20v-6h6v6" />
    </IconBase>
  );
}

export function InvestigationsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3.5h7l5 5V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
      <path d="M14 3.5v5h5" />
      <path d="M8.5 12h7" />
      <path d="M8.5 15.5h5" />
    </IconBase>
  );
}

export function CompareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4v16" />
      <path d="M16 4v16" />
      <path d="M4 8h8" />
      <path d="M12 16h8" />
      <path d="M4 16h4" />
      <path d="M16 8h4" />
    </IconBase>
  );
}

export function RequestExplorerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M8 9.5h8" />
      <path d="M8 13h8" />
      <path d="M8 16.5h5" />
      <path d="M3.5 8.5h2" />
      <path d="M3.5 15.5h2" />
    </IconBase>
  );
}

export function ReportsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3.5h8l4 4V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
      <path d="M15 3.5v5h5" />
      <path d="M8 12h8" />
      <path d="M8 15.5h6" />
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5v2.2" />
      <path d="M12 18.3v2.2" />
      <path d="M4.9 7.1l1.5 1.5" />
      <path d="M17.6 17.6l1.5 1.5" />
      <path d="M3.5 12h2.2" />
      <path d="M18.3 12h2.2" />
      <path d="M4.9 16.9l1.5-1.5" />
      <path d="M17.6 6.4l1.5-1.5" />
      <circle cx="12" cy="12" r="3.25" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6.5h16" />
      <path d="M7.5 12h9" />
      <path d="M10 17.5h4" />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 15.5V5" />
      <path d="m8.5 8.5 3.5-3.5 3.5 3.5" />
      <path d="M5.5 17.5v1.25A1.25 1.25 0 0 0 6.75 20h10.5A1.25 1.25 0 0 0 18.5 18.75V17.5" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 6-6 6 6 6" />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.5 1.5" />
      <path d="m17.6 17.6 1.5 1.5" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.5-1.5" />
      <path d="m17.6 6.4 1.5-1.5" />
    </IconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
    </IconBase>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="11" rx="1.8" />
      <path d="M9 19.5h6" />
      <path d="M12 15.5v4" />
    </IconBase>
  );
}

export function BadgeCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 12.5 10 15l6.5-7" />
      <circle cx="12" cy="12" r="8.5" />
    </IconBase>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.5 20 18a1.5 1.5 0 0 1-1.25 2.25H5.25A1.5 1.5 0 0 1 4 18l8-13.5Z" />
      <path d="M12 9v4.5" />
      <path d="M12 16.5h.01" />
    </IconBase>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3l1.4 2h7.1A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-7Z" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </IconBase>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="6.5" cy="7.5" r="2.5" />
      <circle cx="17.5" cy="7.5" r="2.5" />
      <circle cx="12" cy="16.5" r="2.5" />
      <path d="M8.5 9l2.3 4.3" />
      <path d="M15.5 9l-2.3 4.3" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5 18 5.8v5.4c0 4.4-2.8 7.9-6 9.3-3.2-1.4-6-4.9-6-9.3V5.8l6-2.3Z" />
      <path d="m9.3 12.2 1.6 1.6 3.8-4.3" />
    </IconBase>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 2.5 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5Z" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7.5h16" />
      <path d="M4 12h16" />
      <path d="M4 16.5h16" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}
