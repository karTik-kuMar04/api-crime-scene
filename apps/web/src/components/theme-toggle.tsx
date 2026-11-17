"use client";

import { MoonIcon, MonitorIcon, SunIcon } from "./icons";
import { useTheme, type ThemeMode } from "./theme-provider";

const options: Array<{ value: ThemeMode; label: string; icon: typeof SunIcon }> = [
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "system", label: "System", icon: MonitorIcon }
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] p-1 text-[11px] font-medium text-[var(--muted)] shadow-[0_0_0_1px_rgba(148,163,184,0.03)]">
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={`Set theme to ${label}`}
            aria-pressed={isActive}
            onClick={() => setTheme(value)}
            className={[
              "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors duration-200",
              isActive ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            ].join(" ")}
          >
            <Icon size={12} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
