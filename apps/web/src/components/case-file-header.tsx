import type { ReactNode } from "react";

interface CaseFileHeaderProps {
  title: string;
  caseNumber?: string;
  sourceDomain?: string;
  openedDate?: string;
  requestCount?: number;
  status?: "open" | "closed";
  actions?: ReactNode;
}

export function CaseFileHeader({
  title,
  caseNumber,
  sourceDomain,
  openedDate,
  requestCount,
  status,
  actions,
}: CaseFileHeaderProps) {
  const metaParts: string[] = [];
  if (caseNumber) metaParts.push(`CASE ${caseNumber}`);
  if (sourceDomain) metaParts.push(sourceDomain);
  if (openedDate) {
    try {
      const d = new Date(openedDate);
      metaParts.push(d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
    } catch {
      metaParts.push(openedDate);
    }
  }
  if (typeof requestCount === "number") {
    metaParts.push(`${requestCount.toLocaleString()} ${requestCount === 1 ? "EXHIBIT" : "EXHIBITS"}`);
  }

  return (
    <div className="border-b border-line pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-serif text-28 md:text-36 text-text tracking-tight font-normal leading-tight">
            {title}
          </h1>

          {metaParts.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-12 text-text-3">
              {metaParts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-3">
                  {idx > 0 && <span className="text-line-strong select-none">/</span>}
                  <span className="uppercase tracking-wider">{part}</span>
                </span>
              ))}

              {status && (
                <span className="flex items-center gap-1.5 ml-1">
                  <span
                    className={[
                      "inline-block h-2 w-2 rounded-full",
                      status === "open" ? "bg-accent" : "bg-text-3",
                    ].join(" ")}
                  />
                  <span className="uppercase tracking-wider text-text-2">{status}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
      </div>
    </div>
  );
}
