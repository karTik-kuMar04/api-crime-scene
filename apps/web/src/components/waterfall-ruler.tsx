import type { HarTimings } from "@/lib/types";

interface WaterfallRulerProps {
  timings: HarTimings;
  totalTime: number; // in ms
  className?: string;
}

export function WaterfallRuler({
  timings,
  totalTime,
  className = "",
}: WaterfallRulerProps) {
  const safeTotal = Math.max(totalTime, 1);

  // Normalize timing phases (HAR specs allows -1 for inactive phases)
  const phases = [
    { key: "blocked", label: "Queue / Blocked", ms: Math.max(0, timings.blocked || 0), color: "var(--text-3)" },
    { key: "dns", label: "DNS Resolution", ms: Math.max(0, timings.dns || 0), color: "var(--calm)" },
    { key: "connect", label: "TCP Connect", ms: Math.max(0, timings.connect || 0), color: "var(--calm)" },
    { key: "ssl", label: "TLS Handshake", ms: Math.max(0, timings.ssl || 0), color: "var(--abstract)" },
    { key: "send", label: "Request Sent", ms: Math.max(0, timings.send || 0), color: "var(--accent)" },
    { key: "wait", label: "Waiting (TTFB)", ms: Math.max(0, timings.wait || 0), color: "var(--warning)" },
    { key: "receive", label: "Content Download", ms: Math.max(0, timings.receive || 0), color: "var(--success)" },
  ].filter((p) => p.ms > 0);

  // Calculate tick marks for ruler (0%, 25%, 50%, 75%, 100%)
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tick-mark ruler */}
      <div>
        <div className="relative h-6 border-b border-line flex items-end">
          {ticks.map((t, idx) => {
            const msValue = Math.round(t * safeTotal);
            const isLeft = idx === 0;
            const isRight = idx === ticks.length - 1;

            return (
              <div
                key={t}
                className="absolute flex flex-col items-center"
                style={{
                  left: isLeft ? "0%" : isRight ? "100%" : `${t * 100}%`,
                  transform: isLeft ? "none" : isRight ? "translateX(-100%)" : "translateX(-50%)",
                }}
              >
                <span className="font-mono text-11 text-text-3 tabular-nums select-none pb-1">
                  {msValue}ms
                </span>
                <span className="h-1.5 w-[1px] bg-line-strong" aria-hidden />
              </div>
            );
          })}
        </div>

        {/* Phase-coloured segmented bar */}
        <div className="mt-2 h-4 w-full bg-surface-2 border border-line rounded-control flex overflow-hidden">
          {phases.map((phase) => {
            const widthPct = Math.max((phase.ms / safeTotal) * 100, 1);
            return (
              <div
                key={phase.key}
                className="h-full relative group transition-opacity hover:opacity-90"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: phase.color,
                }}
                title={`${phase.label}: ${Math.round(phase.ms)}ms (${((phase.ms / safeTotal) * 100).toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Phase breakdown table */}
      <div className="border border-line rounded-panel overflow-hidden">
        <table className="w-full text-left font-mono text-12">
          <thead>
            <tr className="border-b border-line bg-surface-1 text-text-3 text-11 uppercase tracking-wider">
              <th className="py-2 px-3 font-normal">Timing Phase</th>
              <th className="py-2 px-3 font-normal text-right">Duration</th>
              <th className="py-2 px-3 font-normal text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-1/40">
            {phases.map((phase) => {
              const pct = ((phase.ms / safeTotal) * 100).toFixed(1);
              return (
                <tr key={phase.key} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-2 px-3 flex items-center gap-2 text-text">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: phase.color }}
                      aria-hidden
                    />
                    <span>{phase.label}</span>
                  </td>
                  <td className="py-2 px-3 text-right text-text tabular-nums">
                    {Math.round(phase.ms)}ms
                  </td>
                  <td className="py-2 px-3 text-right text-text-3 tabular-nums">
                    {pct}%
                  </td>
                </tr>
              );
            })}
            <tr className="bg-surface-2 font-medium">
              <td className="py-2 px-3 text-text">Total Duration</td>
              <td className="py-2 px-3 text-right text-accent tabular-nums">
                {Math.round(safeTotal)}ms
              </td>
              <td className="py-2 px-3 text-right text-text-3 tabular-nums">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
