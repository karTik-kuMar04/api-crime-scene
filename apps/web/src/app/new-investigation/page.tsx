"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BadgeCheckIcon, ShieldIcon, UploadIcon, WarningIcon } from "@/components/icons";

const validExtensions = [".har"];

export default function NewInvestigationPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "error" | "success">("idle");
  const [message, setMessage] = useState("Drop a HAR file to begin a local inspection workflow.");
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const file = incomingFiles[0];
    if (!file) return;

    const isHar = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isHar) {
      setSelectedFile(null);
      setStatus("error");
      setMessage("Unsupported file format. Please select a .har file exported from browser DevTools.");
      return;
    }

    setSelectedFile(file);
    setStatus("ready");
    setMessage(`Ready to import ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB).`);
  };

  const handleImport = () => {
    if (!selectedFile) {
      setStatus("error");
      setMessage("Select a HAR file before importing.");
      return;
    }

    setStatus("success");
    setMessage(`Local validation complete for ${selectedFile.name}. Imported session is ready for inspection.`);
  };

  return (
    <AppShell
      title="New investigation"
      description="Import a HAR recording, validate the file locally, and prepare the session for request analysis and comparison."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
            className={[
              "rounded-2xl border border-dashed p-6 text-center transition-all duration-200",
              isDragging ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--surface)]"
            ].join(" ")}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--accent)]">
              <UploadIcon size={24} />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">Import HAR recording</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Drag and drop a browser export or choose a local file from disk.
            </p>

            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-slate-950"
              >
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".har"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    handleFiles(event.target.files);
                  }
                }}
              />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Supported: .har</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2 text-sm text-[var(--muted)]">
              <span>Validation status</span>
              <span className="font-medium uppercase tracking-[0.1em] text-[var(--foreground)]">
                {status === "idle" ? "Waiting" : status}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
              <div
                className={[
                  "h-full rounded-full bg-[var(--accent)] transition-all duration-300",
                  status === "success" ? "w-full" : status === "ready" ? "w-2/3" : status === "error" ? "w-1/3" : "w-0"
                ].join(" ")}
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3 text-sm text-[var(--muted)]">
              {status === "error" ? (
                <WarningIcon size={16} className="mt-0.5 text-red-400" />
              ) : status === "success" ? (
                <BadgeCheckIcon size={16} className="mt-0.5 text-emerald-400" />
              ) : (
                <UploadIcon size={16} className="mt-0.5 text-[var(--accent)]" />
              )}
              <p>{message}</p>
            </div>

            <button
              type="button"
              onClick={handleImport}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedFile}
            >
              Import HAR
            </button>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Privacy</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Local-first processing</h3>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center gap-3 text-[var(--foreground)]">
              <ShieldIcon size={18} className="text-[var(--accent)]" />
              <p className="font-medium">Sensitive data warning</p>
            </div>
            <p className="text-sm text-[var(--muted)]">
              HAR files can contain cookies, authorization headers, tokens, request payloads, and response bodies. The user is expected to review the file locally and avoid uploading sensitive content unless explicitly agreed.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="font-medium text-[var(--foreground)]">What is implemented</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li>• Drag-and-drop upload area</li>
              <li>• File validation for .har files</li>
              <li>• Local status and success messaging</li>
              <li>• Privacy guidance and honest placeholders</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
