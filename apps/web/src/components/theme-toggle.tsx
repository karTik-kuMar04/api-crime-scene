"use client";

import { ThemeDarkIcon, ThemeLightIcon, ThemeSystemIcon } from "./icons";
import { useTheme, type ThemeMode } from "./theme-provider";

const options: Array<{ value: ThemeMode; label: string; icon: typeof ThemeDarkIcon }> = [
  { value: "dark", label: "Dark", icon: ThemeDarkIcon },
  { value: "light", label: "Light", icon: ThemeLightIcon },
  { value: "system", label: "System", icon: ThemeSystemIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex items-center gap-[2px] rounded-control border border-line bg-surface-1 p-[2px]"
      role="radiogroup"
      aria-label="Colour theme"
    >
      {options.map(({ value, label, icon: IconCmp }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={[
              "flex items-center gap-[4px] rounded-control px-[8px] py-[4px] text-11 font-medium transition-colors duration-150 ease-out",
              active
                ? "bg-surface-3 text-text"
                : "text-text-3 hover:text-text-2",
            ].join(" ")}
          >
            <IconCmp size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
