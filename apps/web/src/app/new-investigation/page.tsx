"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CaseFileHeader } from "@/components/case-file-header";
import { SignalField } from "@/components/brand/signal-field";
import { ChainOfCustody, type ChainStep } from "@/components/chain-of-custody";
import {
  FileHarIcon,
  CheckIcon,
  AlertIcon,
  ShieldIcon,
  LockIcon,
  ChevronRightIcon,
} from "@/components/icons";
import {
  parseHarFile,
  formatBytes,
  MAX_HAR_SIZE_BYTES,
  type HarParseResult,
  type ParseProgress,
} from "@/lib/har-parser";
import { saveInvestigation } from "@/lib/storage";
import type { Investigation } from "@/lib/types";

const STAGES: ChainStep[] = [
  { number: 1, title: "Select", description: "Choose .har or .json capture" },
  { number: 2, title: "Validate", description: "Verify format and integrity" },
  { number: 3, title: "Parse", description: "Index in browser memory" },
  { number: 4, title: "Ready", description: "Save to local archive" },
];

export default function NewInvestigationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);
  const [parseResult, setParseResult] = useState<HarParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state after parse
  const [investigationName, setInvestigationName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setParseResult(null);
    setActiveStep(2);

    // Validate extension
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith(".har") && !nameLower.endsWith(".json")) {
      setErrorMessage("Unsupported file type. Please upload a .har or .json network recording file.");
      setActiveStep(1);
      return;
    }

    try {
      const result = await parseHarFile(file, (prog) => {
        setParseProgress(prog);
        if (prog.stage === "validate") setActiveStep(2);
        if (prog.stage === "parse") setActiveStep(3);
        if (prog.stage === "ready") setActiveStep(4);
      });

      setParseResult(result);
      setActiveStep(4);

      // Default name to filename or domain
      const cleanName = file.name.replace(/\.(har|json)$/i, "");
      setInvestigationName(
        cleanName || `${result.sourceDomain} Network Capture`
      );
    } catch (err) {
      console.error("Parse error:", err);
      const msg = err instanceof Error ? err.message : "Failed to process HAR recording.";
      setErrorMessage(msg);
      setActiveStep(1);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parseResult || !investigationName.trim()) return;

    setSaving(true);
    try {
      const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newInv: Investigation = {
        id,
        name: investigationName.trim(),
        source: parseResult.sourceDomain,
        status: "open",
        createdAt: now,
        updatedAt: now,
        entryCount: parseResult.entryCount,
        pageCount: parseResult.pageCount,
        creator: parseResult.creator,
        timeRange: parseResult.timeRange,
        har: parseResult.file,
      };

      await saveInvestigation(newInv);
      router.push(`/request-explorer?id=${id}`);
    } catch (err) {
      console.error("Failed to save investigation:", err);
      setErrorMessage("Could not write record to local storage.");
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <CaseFileHeader
          title="Open new investigation"
          caseNumber="INGEST"
          actions={
            <Link
              href="/investigations"
              className="text-12 font-mono text-text-3 hover:text-text transition-colors"
            >
              Cancel
            </Link>
          }
        />

        <p className="text-14 text-text-3 -mt-4">
          Ingest a browser HTTP Archive (HAR). All validation, parsing, and storage operate exclusively on your device.
        </p>

        {/* Chain-of-custody progress stages */}
        <div className="border border-line rounded-panel bg-surface-1 p-5">
          <ChainOfCustody steps={STAGES} activeStep={activeStep} />
        </div>

        {/* Drag-and-drop Zone */}
        {!parseResult && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "relative border-2 border-dashed rounded-panel p-8 md:p-14 text-center cursor-pointer overflow-hidden transition-all duration-150",
                dragActive
                  ? "border-accent bg-accent-soft/40"
                  : "border-line bg-surface-1 hover:border-line-strong hover:bg-surface-2/40",
              ].join(" ")}
            >
              {/* Signal field in corner of drop zone */}
              <div className="absolute right-0 bottom-0 pointer-events-none opacity-40 translate-x-8 translate-y-8">
                <SignalField width={220} height={140} />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".har,.json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-12 w-12 rounded-control bg-surface-2 border border-line flex items-center justify-center text-accent mb-4">
                  <FileHarIcon size={24} />
                </div>

                <h2 className="font-serif text-20 md:text-28 text-text font-normal">
                  Drop a HAR file here, or click to browse
                </h2>

                <p className="mt-2 text-13 text-text-3 max-w-md">
                  Accepts standard <code className="font-mono text-text-2">.har</code> or <code className="font-mono text-text-2">.json</code> browser recordings up to {formatBytes(MAX_HAR_SIZE_BYTES)}.
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-control bg-surface-2 border border-line px-3.5 py-1.5 text-12 font-mono text-text-2">
                  <span>Select file from disk</span>
                  <ChevronRightIcon size={12} />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="border border-danger/40 bg-danger/10 rounded-panel p-4 flex items-start gap-3 text-text">
                <AlertIcon size={18} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-12 uppercase tracking-wider font-semibold text-danger">
                    Ingestion Error
                  </h4>
                  <p className="mt-1 text-13 text-text-2">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Progress indicator */}
            {parseProgress && !errorMessage && activeStep < 4 && (
              <div className="border border-line rounded-panel bg-surface-1 p-4 space-y-2 font-mono text-12">
                <div className="flex justify-between text-text-3">
                  <span className="uppercase tracking-wider">{parseProgress.message}</span>
                  <span className="tabular-nums">{parseProgress.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-2 rounded-control overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-150"
                    style={{ width: `${parseProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parsed Result & Save Form */}
        {parseResult && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border border-line rounded-panel bg-surface-1 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <span className="h-6 w-6 rounded-control bg-success/20 text-success flex items-center justify-center font-bold">
                  <CheckIcon size={14} />
                </span>
                <div>
                  <h3 className="font-serif text-20 text-text font-normal">
                    Validation complete
                  </h3>
                  <p className="text-12 font-mono text-text-3">
                    {selectedFile?.name} ({formatBytes(parseResult.totalSize)})
                  </p>
                </div>
              </div>

              {/* Forensic summary grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-line">
                <div>
                  <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                    Exhibits
                  </span>
                  <p className="mt-1 font-mono text-20 text-text font-medium tabular-nums">
                    {parseResult.entryCount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                    Source Domain
                  </span>
                  <p className="mt-1 font-mono text-13 text-text truncate">
                    {parseResult.sourceDomain}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                    Failed Requests
                  </span>
                  <p className="mt-1 font-mono text-20 text-danger font-medium tabular-nums">
                    {parseResult.failedCount}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                    Client Tool
                  </span>
                  <p className="mt-1 font-mono text-13 text-text-2 truncate">
                    {parseResult.creator}
                  </p>
                </div>
              </div>

              {/* Name investigation */}
              <div className="space-y-2">
                <label
                  htmlFor="inv-title"
                  className="block font-mono text-11 uppercase tracking-wider text-text-3 font-medium"
                >
                  Case File Title
                </label>
                <input
                  id="inv-title"
                  type="text"
                  required
                  value={investigationName}
                  onChange={(e) => setInvestigationName(e.target.value)}
                  placeholder="e.g. Checkout Failure Trace"
                  className="w-full bg-surface-2 border border-line rounded-control px-3.5 py-2 text-14 text-text outline-none focus:border-accent font-sans"
                />
                <p className="text-12 text-text-3">
                  This identifier will label exhibits, reports, and comparisons in your local directory.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setParseResult(null);
                    setSelectedFile(null);
                    setActiveStep(1);
                  }}
                  className="font-mono text-12 text-text-3 hover:text-text"
                >
                  ← Select a different file
                </button>

                <button
                  type="submit"
                  disabled={saving || !investigationName.trim()}
                  className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-5 py-2 text-13 font-medium hover:bg-accent-strong disabled:opacity-50 transition-colors"
                >
                  <span>{saving ? "Saving to Archive…" : "Open Investigation"}</span>
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Privacy Note */}
        <div className="border border-line rounded-panel bg-surface-1/60 p-5 flex items-start gap-3.5 text-text-3 text-13">
          <ShieldIcon size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-11 uppercase tracking-wider text-text-2 font-medium">
              Sensitive Content Notice
            </span>
            <p className="leading-relaxed">
              Browser HAR captures frequently contain session tokens, cookies, Basic/Bearer authorization headers, and POST payloads. API Crime Scene automatically masks these entries with redaction bars and never transmits file contents across the network.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
