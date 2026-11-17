import Link from "next/link";
import {
  BadgeCheckIcon,
  FolderIcon,
  NetworkIcon,
  PlusIcon,
  ShieldIcon,
  SparkIcon,
  UploadIcon
} from "@/components/icons";
import { AppShell } from "@/components/app-shell";

const metrics = [
  { label: "Total investigations", value: "0", description: "No HAR sessions yet" },
  { label: "Requests analyzed", value: "0", description: "Awaiting import" },
  { label: "Failed requests", value: "0", description: "No errors detected" },
  { label: "Potential issues", value: "0", description: "No findings yet" }
];

const gettingStarted = [
  {
    title: "Export a HAR",
    text: "Capture browser traffic with DevTools and save a HAR record. Keep the session scoped to the investigation you need.",
    icon: NetworkIcon
  },
  {
    title: "Import locally",
    text: "Bring the file into API Crime Scene and validate the payload before processing or comparison.",
    icon: UploadIcon
  },
  {
    title: "Inspect requests",
    text: "Review methods, timing, status codes, and headers to isolate suspicious or failing network activity.",
    icon: FolderIcon
  },
  {
    title: "Compare and report",
    text: "Measure regressions across sessions, summarize issues, and prepare a privacy-safe record for handoff.",
    icon: ShieldIcon
  }
];

export default function OverviewPage() {
  return (
    <AppShell
      title="Network investigations"
      description="High-signal inspection for browser traffic, request anomalies, and session comparisons. Import a HAR to begin a new forensics workflow."
    >
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_16px_30px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Workspace</p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Investigate every request trail.</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/new-investigation"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:opacity-95"
            >
              <PlusIcon size={16} />
              New investigation
            </Link>
            <Link
              href="/new-investigation"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            >
              <UploadIcon size={16} />
              Import HAR
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{metric.value}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{metric.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Investigations</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Recent investigations</h3>
              </div>
              <Link href="/investigations" className="text-sm font-medium text-[var(--accent)]">
                View all
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
                <thead className="bg-[var(--surface-strong)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Investigation</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Requests</th>
                    <th className="px-4 py-3 font-medium">Issues</th>
                    <th className="px-4 py-3 font-medium">Modified</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--accent)]">
                          <BadgeCheckIcon size={19} />
                        </div>
                        <div>
                          <p className="text-base font-medium text-[var(--foreground)]">No investigations yet</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">Import a HAR or create a new investigation to begin tracking network activity.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <SparkIcon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Getting started</p>
                <h3 className="mt-1 text-xl font-semibold text-[var(--foreground)]">Import a HAR</h3>
              </div>
            </div>

            <div className="space-y-3">
              {gettingStarted.map(({ title, text, icon: Icon }) => (
                <div key={title} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--accent)]">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
