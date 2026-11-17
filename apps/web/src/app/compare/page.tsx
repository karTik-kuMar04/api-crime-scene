"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CaseFileHeader } from "@/components/case-file-header";
import { EmptyState } from "@/components/empty-state";
import {
  CompareIcon,
  PlusIcon,
  ChevronRightIcon,
  AlertIcon,
  CheckIcon,
} from "@/components/icons";
import { getInvestigations, getInvestigation } from "@/lib/storage";
import { compareHarSessions, type SessionComparisonResult } from "@/lib/har-diff";
import { formatBytes } from "@/lib/har-parser";
import type { Investigation } from "@/lib/types";

type DiffSection = "all" | "regressions" | "status" | "added" | "removed" | "size";

export default function CompareSessionsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected IDs
  const [sessionAId, setSessionAId] = useState<string>("");
  const [sessionBId, setSessionBId] = useState<string>("");

  // Loaded full sessions
  const [fullSessionA, setFullSessionA] = useState<Investigation | null>(null);
  const [fullSessionB, setFullSessionB] = useState<Investigation | null>(null);
  const [activeSection, setActiveSection] = useState<DiffSection>("all");

  useEffect(() => {
    async function load() {
      try {
        const invs = await getInvestigations();
        setInvestigations(invs);

        if (invs.length >= 2) {
          setSessionAId(invs[1].id);
          setSessionBId(invs[0].id);

          const [a, b] = await Promise.all([
            getInvestigation(invs[1].id),
            getInvestigation(invs[0].id),
          ]);
          setFullSessionA(a);
          setFullSessionB(b);
        } else if (invs.length === 1) {
          setSessionAId(invs[0].id);
          const a = await getInvestigation(invs[0].id);
          setFullSessionA(a);
        }
      } catch (err) {
        console.error("Failed to load sessions for comparison:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectSessionA = async (id: string) => {
    setSessionAId(id);
    const full = await getInvestigation(id);
    setFullSessionA(full);
  };

  const handleSelectSessionB = async (id: string) => {
    setSessionBId(id);
    const full = await getInvestigation(id);
    setFullSessionB(full);
  };

  // Real diff computation
  const diffResult: SessionComparisonResult | null = useMemo(() => {
    if (!fullSessionA?.har || !fullSessionB?.har) return null;
    if (fullSessionA.id === fullSessionB.id) return null;
    return compareHarSessions(fullSessionA.har, fullSessionB.har);
  }, [fullSessionA, fullSessionB]);

  if (loading) {
    return (
      <AppShell title="Compare Sessions">
        <div className="p-12 text-center font-mono text-12 text-text-3 border border-line rounded-panel bg-surface-1">
          Loading forensic sessions…
        </div>
      </AppShell>
    );
  }

  // If fewer than 2 investigations exist
  if (investigations.length < 2) {
    return (
      <AppShell title="Compare Sessions">
        <div className="space-y-6">
          <CaseFileHeader
            title="Session differential"
            caseNumber="DIFF"
          />

          <EmptyState
            headline="Two investigations required for comparison"
            description={
              investigations.length === 0
                ? "API Crime Scene measures request drifts, status shifts, and latency regressions between two network recordings. Import at least two HAR captures to unlock differential analysis."
                : "You currently have 1 investigation archive. Import a second HAR recording to compare against your baseline."
            }
            actions={
              <Link
                href="/new-investigation"
                className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
              >
                <PlusIcon size={14} />
                <span>
                  {investigations.length === 0 ? "Import first session" : "Import second session"}
                </span>
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Compare Sessions">
      <div className="space-y-6">
        <CaseFileHeader
          title="Session differential"
          caseNumber="DIFF"
          actions={
            <Link
              href="/new-investigation"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-surface-2 px-3 py-1.5 text-12 font-mono text-text-2 hover:text-text"
            >
              <PlusIcon size={13} />
              <span>Import session</span>
            </Link>
          }
        />

        <p className="text-14 text-text-3 -mt-2">
          Side-by-side differential forensics. Compare baseline against target recording to detect regressions.
        </p>

        {/* Session Selectors: Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-line rounded-panel bg-surface-1 p-4 md:p-5">
          {/* Baseline Session A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
                Baseline (Session A)
              </span>
              <span className="font-mono text-11 text-calm">Reference</span>
            </div>
            <select
              value={sessionAId}
              onChange={(e) => handleSelectSessionA(e.target.value)}
              className="w-full bg-surface-2 border border-line rounded-control px-3 py-2 text-13 font-mono text-text outline-none focus:border-accent"
            >
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id} disabled={inv.id === sessionBId}>
                  {inv.name} ({inv.entryCount} exhibits · {inv.source})
                </option>
              ))}
            </select>
            {fullSessionA && (
              <p className="text-11 font-mono text-text-3">
                Opened {new Date(fullSessionA.createdAt).toLocaleDateString()} · {fullSessionA.creator}
              </p>
            )}
          </div>

          {/* Target Session B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
                Target (Session B)
              </span>
              <span className="font-mono text-11 text-accent">Comparison</span>
            </div>
            <select
              value={sessionBId}
              onChange={(e) => handleSelectSessionB(e.target.value)}
              className="w-full bg-surface-2 border border-line rounded-control px-3 py-2 text-13 font-mono text-text outline-none focus:border-accent"
            >
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id} disabled={inv.id === sessionAId}>
                  {inv.name} ({inv.entryCount} exhibits · {inv.source})
                </option>
              ))}
            </select>
            {fullSessionB && (
              <p className="text-11 font-mono text-text-3">
                Opened {new Date(fullSessionB.createdAt).toLocaleDateString()} · {fullSessionB.creator}
              </p>
            )}
          </div>
        </div>

        {/* Diff Result Summary Segmented Strip */}
        {diffResult && (
          <div className="space-y-6">
            <div className="border border-line rounded-panel bg-surface-1 grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-line">
              <div
                onClick={() => setActiveSection("regressions")}
                className={`p-3.5 cursor-pointer transition-colors ${activeSection === "regressions" ? "bg-surface-3" : "hover:bg-surface-2/60"}`}
              >
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Duration Regressions
                </span>
                <p className="mt-1 font-mono text-20 font-medium text-warning tabular-nums">
                  {diffResult.summary.regressionsCount}
                </p>
                <p className="text-11 text-text-3 font-mono">&gt; 50ms slower in B</p>
              </div>

              <div
                onClick={() => setActiveSection("status")}
                className={`p-3.5 cursor-pointer transition-colors ${activeSection === "status" ? "bg-surface-3" : "hover:bg-surface-2/60"}`}
              >
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Status Code Shifts
                </span>
                <p className="mt-1 font-mono text-20 font-medium text-info tabular-nums">
                  {diffResult.summary.statusChangedCount}
                </p>
                <p className="text-11 text-text-3 font-mono">Response code changed</p>
              </div>

              <div
                onClick={() => setActiveSection("added")}
                className={`p-3.5 cursor-pointer transition-colors ${activeSection === "added" ? "bg-surface-3" : "hover:bg-surface-2/60"}`}
              >
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Added Requests
                </span>
                <p className="mt-1 font-mono text-20 font-medium text-success tabular-nums">
                  +{diffResult.summary.addedCount}
                </p>
                <p className="text-11 text-text-3 font-mono">New in Target (B)</p>
              </div>

              <div
                onClick={() => setActiveSection("removed")}
                className={`p-3.5 cursor-pointer transition-colors ${activeSection === "removed" ? "bg-surface-3" : "hover:bg-surface-2/60"}`}
              >
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Removed Requests
                </span>
                <p className="mt-1 font-mono text-20 font-medium text-danger tabular-nums">
                  -{diffResult.summary.removedCount}
                </p>
                <p className="text-11 text-text-3 font-mono">Absent in Target (B)</p>
              </div>

              <div
                onClick={() => setActiveSection("size")}
                className={`p-3.5 cursor-pointer transition-colors ${activeSection === "size" ? "bg-surface-3" : "hover:bg-surface-2/60"}`}
              >
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Payload Drifts
                </span>
                <p className="mt-1 font-mono text-20 font-medium text-abstract tabular-nums">
                  {diffResult.summary.sizeChangedCount}
                </p>
                <p className="text-11 text-text-3 font-mono">&gt; 1 KB size variance</p>
              </div>
            </div>

            {/* Differential Data Tables */}
            <div className="space-y-6">
              {/* Section 1: Duration Regressions */}
              {(activeSection === "all" || activeSection === "regressions") && diffResult.durationRegressions.length > 0 && (
                <div className="border border-line rounded-panel overflow-hidden bg-surface-1">
                  <div className="bg-surface-2 px-4 py-2.5 border-b border-line flex items-center justify-between">
                    <span className="font-mono text-12 uppercase tracking-wider font-semibold text-warning">
                      Duration Regressions ({diffResult.durationRegressions.length})
                    </span>
                    <span className="text-11 font-mono text-text-3">Latency delta in target session</span>
                  </div>
                  <table className="w-full text-left font-mono text-12">
                    <thead>
                      <tr className="border-b border-line bg-surface-1 text-text-3 text-11 uppercase">
                        <th className="py-2 px-4">Exhibit</th>
                        <th className="py-2 px-4">Method & URL</th>
                        <th className="py-2 px-4 text-right">Time A</th>
                        <th className="py-2 px-4 text-right">Time B</th>
                        <th className="py-2 px-4 text-right">Regression</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {diffResult.durationRegressions.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2/40">
                          <td className="py-2 px-4 text-text-3">{item.id}</td>
                          <td className="py-2 px-4 text-text truncate max-w-md">
                            <span className="text-accent font-semibold mr-2">{item.method}</span>
                            <span title={item.url}>{item.url}</span>
                          </td>
                          <td className="py-2 px-4 text-right text-text-3 tabular-nums">{item.timeA}ms</td>
                          <td className="py-2 px-4 text-right text-text tabular-nums">{item.timeB}ms</td>
                          <td className="py-2 px-4 text-right text-warning font-semibold tabular-nums">
                            +{item.deltaMs}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section 2: Status Code Changes */}
              {(activeSection === "all" || activeSection === "status") && diffResult.statusChanges.length > 0 && (
                <div className="border border-line rounded-panel overflow-hidden bg-surface-1">
                  <div className="bg-surface-2 px-4 py-2.5 border-b border-line flex items-center justify-between">
                    <span className="font-mono text-12 uppercase tracking-wider font-semibold text-info">
                      Status Code Changes ({diffResult.statusChanges.length})
                    </span>
                    <span className="text-11 font-mono text-text-3">HTTP status divergence</span>
                  </div>
                  <table className="w-full text-left font-mono text-12">
                    <thead>
                      <tr className="border-b border-line bg-surface-1 text-text-3 text-11 uppercase">
                        <th className="py-2 px-4">Exhibit</th>
                        <th className="py-2 px-4">Method & URL</th>
                        <th className="py-2 px-4 text-right">Status in A</th>
                        <th className="py-2 px-4 text-right">Status in B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {diffResult.statusChanges.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2/40">
                          <td className="py-2 px-4 text-text-3">{item.id}</td>
                          <td className="py-2 px-4 text-text truncate max-w-md">
                            <span className="text-accent font-semibold mr-2">{item.method}</span>
                            <span title={item.url}>{item.url}</span>
                          </td>
                          <td className="py-2 px-4 text-right text-text-2 tabular-nums">{item.statusA}</td>
                          <td className="py-2 px-4 text-right text-warning font-semibold tabular-nums">
                            {item.statusB}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section 3: Added Requests */}
              {(activeSection === "all" || activeSection === "added") && diffResult.added.length > 0 && (
                <div className="border border-line rounded-panel overflow-hidden bg-surface-1">
                  <div className="bg-surface-2 px-4 py-2.5 border-b border-line flex items-center justify-between">
                    <span className="font-mono text-12 uppercase tracking-wider font-semibold text-success">
                      Added Requests ({diffResult.added.length})
                    </span>
                    <span className="text-11 font-mono text-text-3">Present exclusively in Target (B)</span>
                  </div>
                  <table className="w-full text-left font-mono text-12">
                    <thead>
                      <tr className="border-b border-line bg-surface-1 text-text-3 text-11 uppercase">
                        <th className="py-2 px-4">Exhibit</th>
                        <th className="py-2 px-4">Method & URL</th>
                        <th className="py-2 px-4 text-right">Status</th>
                        <th className="py-2 px-4 text-right">Size</th>
                        <th className="py-2 px-4 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {diffResult.added.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2/40">
                          <td className="py-2 px-4 text-text-3">{item.id}</td>
                          <td className="py-2 px-4 text-text truncate max-w-md">
                            <span className="text-success font-semibold mr-2">{item.method}</span>
                            <span title={item.url}>{item.url}</span>
                          </td>
                          <td className="py-2 px-4 text-right text-text-2 tabular-nums">{item.statusB}</td>
                          <td className="py-2 px-4 text-right text-text-3 tabular-nums">{formatBytes(item.sizeB || 0)}</td>
                          <td className="py-2 px-4 text-right text-text-2 tabular-nums">{item.timeB}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section 4: Removed Requests */}
              {(activeSection === "all" || activeSection === "removed") && diffResult.removed.length > 0 && (
                <div className="border border-line rounded-panel overflow-hidden bg-surface-1">
                  <div className="bg-surface-2 px-4 py-2.5 border-b border-line flex items-center justify-between">
                    <span className="font-mono text-12 uppercase tracking-wider font-semibold text-danger">
                      Removed Requests ({diffResult.removed.length})
                    </span>
                    <span className="text-11 font-mono text-text-3">Present in Baseline (A) but absent in Target (B)</span>
                  </div>
                  <table className="w-full text-left font-mono text-12">
                    <thead>
                      <tr className="border-b border-line bg-surface-1 text-text-3 text-11 uppercase">
                        <th className="py-2 px-4">Exhibit</th>
                        <th className="py-2 px-4">Method & URL</th>
                        <th className="py-2 px-4 text-right">Original Status</th>
                        <th className="py-2 px-4 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {diffResult.removed.map((item, i) => (
                        <tr key={i} className="hover:bg-surface-2/40">
                          <td className="py-2 px-4 text-text-3">{item.id}</td>
                          <td className="py-2 px-4 text-text truncate max-w-md">
                            <span className="text-danger font-semibold mr-2">{item.method}</span>
                            <span title={item.url}>{item.url}</span>
                          </td>
                          <td className="py-2 px-4 text-right text-text-2 tabular-nums">{item.statusA}</td>
                          <td className="py-2 px-4 text-right text-text-3 tabular-nums">{formatBytes(item.sizeA || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
