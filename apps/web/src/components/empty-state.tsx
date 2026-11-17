import type { ReactNode } from "react";
import { SignalField } from "./brand/signal-field";

interface EmptyStateProps {
  headline: string;
  description: string;
  actions?: ReactNode;
  icon?: ReactNode;
  showSignalField?: boolean;
  className?: string;
}

export function EmptyState({
  headline,
  description,
  actions,
  icon,
  showSignalField = true,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "relative flex flex-col items-center justify-center text-center p-8 md:p-12 border border-line rounded-panel bg-surface-1/40 overflow-hidden",
        className,
      ].join(" ")}
    >
      {showSignalField && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
          <SignalField width={160} height={100} />
        </div>
      )}

      <div className="relative z-10 max-w-md flex flex-col items-center">
        {icon && <div className="mb-4 text-text-3">{icon}</div>}

        <h3 className="font-serif text-20 md:text-28 text-text tracking-tight font-normal leading-snug">
          {headline}
        </h3>

        <p className="mt-2 text-14 text-text-3 leading-relaxed">
          {description}
        </p>

        {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
