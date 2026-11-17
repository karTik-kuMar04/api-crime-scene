import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FilterIcon, PlusIcon, SearchIcon } from "@/components/icons";

export default function InvestigationsPage() {
  return (
    <AppShell
      title="Investigations"
      description="Manage and review imported HAR recordings, inspection notes, and browser session evidence from a single workspace."
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)]">
            <SearchIcon size={14} className="text-[var(--accent)]" />
            <input
              aria-label="Search investigations"
              placeholder="Search investigations"
              className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)]"
            >
              <FilterIcon size={14} />
              Filter
            </button>
            <Link
              href="/new-investigation"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-sm font-medium text-slate-950"
            >
              <PlusIcon size={14} />
              New investigation
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
            <thead className="bg-[var(--surface-strong)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Investigation</th>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Requests</th>
                <th className="px-4 py-3 font-medium">Issues</th>
                <th className="px-4 py-3 font-medium">Last modified</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[var(--muted)]">
                  <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--accent)]">
                      <FilterIcon size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-[var(--foreground)]">No sessions captured yet</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Your imported HAR sessions will appear here with domain data, request counts, issue summaries, and file metadata.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
