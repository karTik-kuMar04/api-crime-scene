import { AppShell } from "@/components/app-shell";
import { CompareIcon, SearchIcon } from "@/components/icons";

export default function ComparePage() {
  return (
    <AppShell
      title="Compare Sessions"
      description="Review request deltas, timing regressions, and status changes between two HAR captures side-by-side."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--muted)]">
            <SearchIcon size={14} className="text-[var(--accent)]" />
            <select className="w-full bg-transparent text-[var(--foreground)] outline-none" defaultValue="">
              <option value="" disabled>
                Select baseline session
              </option>
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--muted)]">
            <CompareIcon size={14} className="text-[var(--accent)]" />
            <select className="w-full bg-transparent text-[var(--foreground)] outline-none" defaultValue="">
              <option value="" disabled>
                Select comparison session
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <CompareIcon size={22} />
          </div>
          <div>
            <p className="text-xl font-semibold text-[var(--foreground)]">Select two investigation sessions</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Comparison summaries for added requests, removed calls, status regressions, and duration deltas will appear here once two HAR captures are available.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
