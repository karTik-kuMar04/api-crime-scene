"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SignalField } from "@/components/brand/signal-field";
import { ChainOfCustody, type ChainStep } from "@/components/chain-of-custody";
import { EmptyState } from "@/components/empty-state";
import { RedactionBar } from "@/components/redaction-bar";
import {
  PlusIcon,
  ImportIcon,
  InvestigationsIcon,
  ShieldIcon,
  LockIcon,
  ChevronRightIcon,
  AlertIcon,
} from "@/components/icons";
import { getInvestigations, getStorageMetrics } from "@/lib/storage";
import type { Investigation } from "@/lib/types";

const HOW_IT_WORKS_STEPS: ChainStep[] = [
  {
    number: 1,
    title: "Export a HAR file",
    description: "Open browser DevTools Network tab, reproduce the workflow, and save network traffic as a HTTP Archive (.har).",
    tag: "In your browser DevTools",
  },
  {
    number: 2,
    title: "Import locally",
    description: "Drop your HAR file onto the Evidence Desk. Validation and decompression occur strictly within your browser process.",
    tag: "Stays on this device",
  },
  {
    number: 3,
    title: "Inspect requests",
    description: "Probe individual exhibits with sanitized headers, decoded payloads, and millisecond-accurate waterfall rulers.",
    tag: "Processed in-memory",
  },
  {
    number: 4,
    title: "Compare sessions and report",
    description: "Diff two sessions side by side to catch newly introduced endpoints, latency regressions, or status code drifts.",
    tag: "Local comparison",
  },
];

export default function OverviewPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [metrics, setMetrics] = useState({
    investigationsCount: 0,
    requestsCount: 0,
    failedRequestsCount: 0,
    potentialIssuesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [invs, mets] = await Promise.all([
          getInvestigations(),
          getStorageMetrics(),
        ]);
        setInvestigations(invs);
        setMetrics(mets);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* 1. Header Band with Aura and Signal Field */}
        <section className="relative border border-line rounded-panel bg-surface-1 p-6 md:p-8 overflow-hidden">
          {/* Soft radial aura: teal fading into dusk violet */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full pointer-events-none opacity-10 dark:opacity-12"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, var(--abstract) 50%, transparent 70%)",
            }}
            aria-hidden
          />

          {/* Signal field illustration on the right side */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-80">
            <SignalField width={320} height={180} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
              Forensic Desk
            </span>

            <h1 className="mt-2 font-serif text-28 md:text-36 text-text font-normal tracking-tight leading-tight">
              Network investigations
            </h1>

            <p className="mt-3 text-14 text-text-2 leading-relaxed">
              API Crime Scene transforms raw browser HAR recordings into structured, searchable evidence. Inspect failure cascades, timing bottlenecks, and endpoint regressions entirely inside your browser.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/new-investigation"
                className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors duration-150"
              >
                <PlusIcon size={15} />
                <span>New investigation</span>
              </Link>

              <Link
                href="/new-investigation"
                className="inline-flex items-center gap-2 rounded-control border border-line bg-surface-2 text-text-2 hover:text-text hover:border-line-strong px-4 py-2 text-13 font-medium transition-colors duration-150"
              >
                <ImportIcon size={15} />
                <span>Import HAR file</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Status Strip: One Segmented Bar (not 4 cards) */}
        <section aria-label="Investigation metrics">
          <div className="border border-line rounded-panel bg-surface-1 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-line">
            {/* Metric 1 */}
            <div
              className="p-4 group hover:bg-surface-2/60 transition-colors duration-150"
              title="Number of distinct HAR captures stored locally"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Investigations
                </span>
                <InvestigationsIcon size={14} className="text-text-3 group-hover:text-text transition-colors" />
              </div>
              <p className="mt-2 font-mono text-28 text-text font-normal tabular-nums">
                {metrics.investigationsCount.toLocaleString()}
              </p>
              <p className="mt-1 text-12 text-text-3 truncate">
                {metrics.investigationsCount === 0 ? "No active case files" : "Stored in browser"}
              </p>
            </div>

            {/* Metric 2 */}
            <div
              className="p-4 group hover:bg-surface-2/60 transition-colors duration-150"
              title="Total HTTP request/response exhibits parsed across all investigations"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Requests Analysed
                </span>
                <span className="h-2 w-2 rounded-full bg-calm" />
              </div>
              <p className="mt-2 font-mono text-28 text-text font-normal tabular-nums">
                {metrics.requestsCount.toLocaleString()}
              </p>
              <p className="mt-1 text-12 text-text-3 truncate">
                {metrics.requestsCount === 0 ? "Awaiting first import" : "Indexed in memory"}
              </p>
            </div>

            {/* Metric 3 */}
            <div
              className="p-4 group hover:bg-surface-2/60 transition-colors duration-150"
              title="Requests with HTTP 4xx, 5xx, or network failure status"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Failed Requests
                </span>
                <span className="h-2 w-2 rounded-full bg-danger" />
              </div>
              <p className="mt-2 font-mono text-28 text-text font-normal tabular-nums">
                {metrics.failedRequestsCount.toLocaleString()}
              </p>
              <p className="mt-1 text-12 text-text-3 truncate">
                {metrics.failedRequestsCount === 0 ? "Zero failures detected" : "4xx / 5xx anomalies"}
              </p>
            </div>

            {/* Metric 4 */}
            <div
              className="p-4 group hover:bg-surface-2/60 transition-colors duration-150"
              title="Analysis rules arrive in a later release"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Potential Issues
                </span>
                <AlertIcon size={14} className="text-text-3" />
              </div>
              <p className="mt-2 font-mono text-28 text-text-3 font-normal tabular-nums">
                —
              </p>
              <p className="mt-1 text-12 text-text-3 truncate" title="Analysis rules arrive in a later release">
                Analysis rules arrive in a later release
              </p>
            </div>
          </div>
        </section>

        {/* 3. How It Works: Chain-of-Custody Line */}
        <section className="border border-line rounded-panel bg-surface-1 p-6 md:p-8">
          <div className="mb-6 border-b border-line pb-4 flex items-baseline justify-between">
            <div>
              <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
                Methodology
              </span>
              <h2 className="mt-1 font-serif text-20 md:text-28 text-text font-normal">
                Chain of custody
              </h2>
            </div>
            <span className="font-mono text-12 text-text-3">
              4 verifiable stages
            </span>
          </div>

          <ChainOfCustody steps={HOW_IT_WORKS_STEPS} />
        </section>

        {/* 4. Recent Investigations */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <div>
              <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
                Archive
              </span>
              <h2 className="mt-1 font-serif text-20 md:text-28 text-text font-normal">
                Recent investigations
              </h2>
            </div>

            {investigations.length > 0 && (
              <Link
                href="/investigations"
                className="font-mono text-12 text-accent hover:underline flex items-center gap-1"
              >
                <span>View all ({investigations.length})</span>
                <ChevronRightIcon size={12} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-12 text-text-3 border border-line rounded-panel bg-surface-1">
              Loading local case archive…
            </div>
          ) : investigations.length === 0 ? (
            <EmptyState
              headline="No case files opened yet"
              description="Import a browser HAR recording to begin your first investigation. All session logs remain strictly local to this machine."
              actions={
                <div className="flex items-center gap-3">
                  <Link
                    href="/new-investigation"
                    className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
                  >
                    <PlusIcon size={14} />
                    <span>New investigation</span>
                  </Link>
                  <Link
                    href="/new-investigation"
                    className="inline-flex items-center gap-2 rounded-control border border-line bg-surface-2 text-text-2 hover:text-text px-4 py-2 text-13 font-medium transition-colors"
                  >
                    <ImportIcon size={14} />
                    <span>Import HAR</span>
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="border border-line rounded-panel overflow-hidden bg-surface-1">
              <table className="w-full text-left font-sans text-13">
                <thead>
                  <tr className="border-b border-line bg-surface-2 text-text-3 font-mono text-11 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-normal">Investigation</th>
                    <th className="py-2.5 px-4 font-normal">Source Domain</th>
                    <th className="py-2.5 px-4 font-normal text-right">Exhibits</th>
                    <th className="py-2.5 px-4 font-normal text-right">Issues</th>
                    <th className="py-2.5 px-4 font-normal">Last Modified</th>
                    <th className="py-2.5 px-4 font-normal">Status</th>
                    <th className="py-2.5 px-4 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {investigations.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-text">
                        <Link
                          href={`/request-explorer?id=${inv.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {inv.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-12 text-text-2 truncate max-w-xs">
                        {inv.source}
                      </td>
                      <td className="py-3 px-4 font-mono text-12 text-text text-right tabular-nums">
                        {inv.entryCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-12 text-text-3 text-right">
                        —
                      </td>
                      <td className="py-3 px-4 font-mono text-12 text-text-3">
                        {new Date(inv.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-11 uppercase tracking-wider text-text-2">
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              inv.status === "open" ? "bg-accent" : "bg-text-3",
                            ].join(" ")}
                          />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/request-explorer?id=${inv.id}`}
                          className="font-mono text-11 uppercase tracking-wider text-accent hover:underline"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 5. Privacy by Design Panel */}
        <section className="border border-line rounded-panel bg-surface-1 p-6 md:p-8">
          <div className="flex items-center gap-3 text-text">
            <ShieldIcon size={20} className="text-accent shrink-0" />
            <div>
              <h3 className="font-serif text-20 text-text font-normal">
                Privacy by design
              </h3>
              <p className="mt-0.5 text-13 text-text-3">
                Network forensics without data liability. Your traffic stays on your machine.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-line">
            <div>
              <div className="flex items-center gap-2 text-text">
                <LockIcon size={14} className="text-accent" />
                <h4 className="text-13 font-medium uppercase tracking-wider font-mono">
                  100% Local Ingestion
                </h4>
              </div>
              <p className="mt-2 text-13 text-text-3 leading-relaxed">
                HAR files are parsed in your browser using standard Web APIs. No payload, cookie, or URL is ever transferred to a remote server.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-text">
                <span className="h-2 w-2 rounded-full bg-warning" />
                <h4 className="text-13 font-medium uppercase tracking-wider font-mono">
                  Default Redaction
                </h4>
              </div>
              <p className="mt-2 text-13 text-text-3 leading-relaxed">
                Tokens, session cookies, and Authorization headers are masked behind solid redaction bars on display. Values require manual reveal.
              </p>
              <div className="mt-3">
                <RedactionBar value="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." isSensitive />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-text">
                <span className="h-2 w-2 rounded-full bg-text-3" />
                <h4 className="text-13 font-medium uppercase tracking-wider font-mono">
                  Controlled Retention
                </h4>
              </div>
              <p className="mt-2 text-13 text-text-3 leading-relaxed">
                Case files are stored in your browser&apos;s IndexedDB sandbox. You can audit, export, or permanently purge all records at any time.
              </p>
              <div className="mt-3">
                <Link
                  href="/settings"
                  className="font-mono text-12 text-accent hover:underline flex items-center gap-1"
                >
                  <span>Data handling settings</span>
                  <ChevronRightIcon size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
