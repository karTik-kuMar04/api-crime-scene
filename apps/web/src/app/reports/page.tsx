import { AppShell } from "@/components/app-shell";
import { ReportsIcon } from "@/components/icons";

const reports = [
  { name: "Authentication review", date: "Not generated", summary: "No report available yet" },
  { name: "Session delta summary", date: "Awaiting comparison", summary: "Two investigations are required" }
];

export default function ReportsPage() {
  return (
    <AppShell
      title="Reports"
      description="Create concise, privacy-aware summaries of incident findings, request anomalies, and investigation outcomes."
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Reports</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">Generated summaries</h3>
          </div>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.name} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                  <ReportsIcon size={16} />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">{report.name}</p>
                  <p className="text-sm text-[var(--muted)]">{report.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{report.date}</span>
                <button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--foreground)] opacity-60">
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
