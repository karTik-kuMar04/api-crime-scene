import { AppShell } from "@/components/app-shell";
import { FilterIcon, RequestExplorerIcon, SearchIcon } from "@/components/icons";

const requests = [
  { method: "GET", url: "https://api.example.com/v1/session", status: 200, duration: 144, size: "1.6 KB", type: "XHR" },
  { method: "POST", url: "https://api.example.com/v1/auth", status: 401, duration: 380, size: "2.1 KB", type: "Fetch" },
  { method: "GET", url: "https://cdn.example.com/assets/app.js", status: 304, duration: 58, size: "96 KB", type: "Script" }
];

export default function RequestExplorerPage() {
  return (
    <AppShell
      title="Request Explorer"
      description="Inspect individual network requests, payload metadata, status transitions, and timing data from a selected HAR session."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)]">
              <SearchIcon size={14} className="text-[var(--accent)]" />
              <input
                aria-label="Search requests"
                placeholder="Search requests"
                className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)]"
            >
              <FilterIcon size={14} />
              Filters
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
              <thead className="bg-[var(--surface-strong)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests.map((request) => (
                  <tr key={`${request.method}-${request.url}`} className="hover:bg-[var(--surface-strong)]/70">
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]">
                        {request.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-[var(--foreground)]">{request.url}</td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          request.status >= 400 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                        ].join(" ")}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-[var(--muted)]">{request.duration} ms</td>
                    <td className="px-4 py-3 align-middle text-[var(--muted)]">{request.size}</td>
                    <td className="px-4 py-3 align-middle text-[var(--muted)]">{request.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <RequestExplorerIcon size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Selected request</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">_current_selection</h3>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span>Tabs</span>
              <span>Ready</span>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {"Overview Headers Request Response Timing".split(" ").map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={[
                    "rounded-full border px-2 py-1.5 font-medium",
                    tab === "Overview" ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]"
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--muted)]">
              Request details, headers, timing traces, and payload previews will render here once a HAR record is imported and a request is selected.
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
