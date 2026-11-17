import type { ReactNode } from "react";

export interface ChainStep {
  number: number;
  title: string;
  description?: string;
  tag?: string;
  status?: "pending" | "current" | "complete";
}

interface ChainOfCustodyProps {
  steps: ChainStep[];
  activeStep?: number;
  className?: string;
  variant?: "horizontal" | "vertical" | "responsive";
}

export function ChainOfCustody({
  steps,
  activeStep,
  className = "",
  variant = "responsive",
}: ChainOfCustodyProps) {
  const isVertical = variant === "vertical";
  const isResponsive = variant === "responsive";

  return (
    <div
      className={[
        "relative",
        isVertical
          ? "flex flex-col gap-6"
          : isResponsive
          ? "grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4"
          : "grid grid-cols-4 gap-4",
        className,
      ].join(" ")}
    >
      {steps.map((step, idx) => {
        const isCurrent = activeStep !== undefined ? step.number === activeStep : step.status === "current";
        const isComplete = activeStep !== undefined ? step.number < activeStep : step.status === "complete";
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.number} className="relative flex flex-col">
            {/* Top row with step number and connecting line */}
            <div className="flex items-center gap-3">
              <div
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-control font-mono text-12 font-medium transition-colors duration-150",
                  isComplete
                    ? "bg-accent text-accent-ink font-semibold"
                    : isCurrent
                    ? "bg-surface-3 border border-accent text-accent font-semibold"
                    : "bg-surface-2 border border-line text-text-3",
                ].join(" ")}
              >
                {String(step.number).padStart(2, "0")}
              </div>

              {/* Connecting line to next step */}
              {!isLast && (
                <div
                  className={[
                    "hidden md:block h-[1px] flex-1 transition-colors duration-150",
                    isComplete ? "bg-accent" : "bg-line",
                  ].join(" ")}
                  aria-hidden
                />
              )}
            </div>

            {/* Step content */}
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3
                  className={[
                    "text-14 font-medium",
                    isCurrent ? "text-accent" : isComplete ? "text-text" : "text-text-2",
                  ].join(" ")}
                >
                  {step.title}
                </h3>
              </div>

              {step.tag && (
                <span className="mt-1 inline-block font-mono text-11 uppercase tracking-wider text-text-3">
                  {step.tag}
                </span>
              )}

              {step.description && (
                <p className="mt-1.5 text-13 text-text-3 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
