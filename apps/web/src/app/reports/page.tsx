"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CaseFileHeader } from "@/components/case-file-header";
import { EmptyState } from "@/components/empty-state";
import {
  ReportsIcon,
  ExportIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
} from "@/components/icons";
import { getReports, deleteReport, getInvestigations, saveReport } from "@/lib/storage";
import type { Report, Investigation } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedInvId, setSelectedInvId] = useState("");

  const loadData = async () => {
    try {
      const [reps, invs] = await Promise.all([getReports(), getInvestigations()]);
      setReports(reps);
      setInvestigations(invs);
      if (invs.length > 0 && !selectedInvId) {
        setSelectedInvId(invs[0].id);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReport = async () => {
    const targetInv = investigations.find((i) => i.id === selectedInvId);
    if (!targetInv) return;

    setCreating(true);
    try {
      let failed = 0;
      targetInv.har?.log?.entries?.forEach((e) => {
        if (e.response?.status >= 400) failed++;
      });

      const newReport: Report = {
        id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        investigationId: targetInv.id,
        investigationName: targetInv.name,
        createdAt: new Date().toISOString(),
        summary: `Forensic audit of ${targetInv.name} (${targetInv.source}). Indexed ${targetInv.entryCount.toLocaleString()} HTTP exhibits with ${failed} failure responses. Zero telemetry exported.`,
      };

      await saveReport(newReport);
      await loadData();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    await loadData();
  };

  return (
    <AppShell title="Reports">
      <div className="space-y-6">
        <CaseFileHeader
          title="Forensic dossiers"
          caseNumber="AUDIT"
          actions={
            investigations.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  className="bg-surface-2 border border-line rounded-control px-2.5 py-1 text-12 font-mono text-text outline-none focus:border-accent"
                >
                  {investigations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleCreateReport}
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 rounded-control bg-accent text-accent-ink px-3 py-1 text-12 font-mono font-medium hover:bg-accent-strong disabled:opacity-50 transition-colors"
                >
                  <PlusIcon size={12} />
                  <span>{creating ? "Generating…" : "Generate Dossier"}</span>
                </button>
              </div>
            ) : null
          }
        />

        <p className="text-14 text-text-3 -mt-2">
          Summarized incident dossiers and redacted handoff documents compiled from investigations.
        </p>

        {loading ? (
          <div className="p-12 text-center font-mono text-12 text-text-3 border border-line rounded-panel bg-surface-1">
            Loading report records…
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            headline="No forensic reports generated"
            description="Reports compile sanitized summaries of an investigation for cross-team postmortems or debugging handoffs. Generate a report from an open investigation."
            actions={
              investigations.length > 0 ? (
                <button
                  type="button"
                  onClick={handleCreateReport}
                  className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
                >
                  <PlusIcon size={14} />
                  <span>Generate first report</span>
                </button>
              ) : (
                <Link
                  href="/new-investigation"
                  className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
                >
                  <PlusIcon size={14} />
                  <span>Import HAR to begin</span>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {reports.map((rep, idx) => (
              <div
                key={rep.id}
                className="border border-line rounded-panel bg-surface-1 p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-line pb-3">
                  <div>
                    <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                      DOSSIER-{String(idx + 1).padStart(4, "0")} / {rep.investigationName}
                    </span>
                    <h3 className="text-16 font-medium text-text mt-0.5 font-sans">
                      Sanitized Forensic Summary
                    </h3>
                  </div>

                  <span className="font-mono text-12 text-text-3">
                    {new Date(rep.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-13 text-text-2 leading-relaxed font-sans">
                  {rep.summary}
                </p>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Visibly disabled export button as required */}
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-12 font-mono text-text-3 bg-surface-2 border border-line opacity-60 cursor-not-allowed"
                      title="Sanitised report export is coming soon"
                    >
                      <ExportIcon size={13} />
                      <span>Export Dossier (Disabled)</span>
                    </button>

                    <span className="text-11 font-mono text-text-3 italic">
                      Sanitised report export is coming soon
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(rep.id)}
                    className="p-1.5 text-text-3 hover:text-danger rounded-control transition-colors"
                    title="Delete report"
                    aria-label="Delete report"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
