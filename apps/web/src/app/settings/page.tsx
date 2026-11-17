"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CaseFileHeader } from "@/components/case-file-header";
import {
  ThemeDarkIcon,
  ThemeLightIcon,
  ThemeSystemIcon,
  ShieldIcon,
  LockIcon,
  TrashIcon,
  AlertIcon,
  CheckIcon,
} from "@/components/icons";
import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { clearAllData, getStorageMetrics } from "@/lib/storage";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Preferences
  const [sidebarDefault, setSidebarDefault] = useState<"expanded" | "collapsed">("expanded");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Storage metrics
  const [metrics, setMetrics] = useState({
    investigationsCount: 0,
    requestsCount: 0,
    failedRequestsCount: 0,
    potentialIssuesCount: 0,
  });

  // Modal & feedback state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem("acs-sidebar-collapsed");
      if (savedSidebar === "true") setSidebarDefault("collapsed");

      const savedDensity = localStorage.getItem("acs-density");
      if (savedDensity === "compact") setDensity("compact");
    } catch {
      // ignore
    }

    getStorageMetrics().then(setMetrics).catch(() => {});
  }, []);

  const handleSidebarChange = (val: "expanded" | "collapsed") => {
    setSidebarDefault(val);
    try {
      localStorage.setItem("acs-sidebar-collapsed", String(val === "collapsed"));
    } catch {
      // ignore
    }
  };

  const handleDensityChange = (val: "comfortable" | "compact") => {
    setDensity(val);
    try {
      localStorage.setItem("acs-density", val);
    } catch {
      // ignore
    }
  };

  const handleConfirmClear = async () => {
    setClearing(true);
    try {
      await clearAllData();
      const newMets = await getStorageMetrics();
      setMetrics(newMets);
      setShowDeleteModal(false);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 4000);
    } finally {
      setClearing(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="space-y-8 max-w-4xl">
        <CaseFileHeader
          title="Desk configuration"
          caseNumber="CONFIG"
        />

        <p className="text-14 text-text-3 -mt-4">
          Control appearance, data retention, layout preferences, and privacy rules.
        </p>

        {/* 1. APPEARANCE: Large Preview Tiles */}
        <section className="space-y-4">
          <div>
            <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
              Visual Environment
            </span>
            <h2 className="text-16 font-medium text-text mt-0.5">Appearance</h2>
            <p className="text-13 text-text-3">
              Switch between ink-navy dark mode and warm paper light mode.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tile 1: Dark Mode */}
            <div
              onClick={() => setTheme("dark")}
              className={[
                "border rounded-panel p-4 cursor-pointer transition-all duration-150 flex flex-col justify-between h-44",
                theme === "dark"
                  ? "border-accent bg-surface-2 ring-1 ring-accent"
                  : "border-line bg-surface-1 hover:border-line-strong hover:bg-surface-2",
              ].join(" ")}
            >
              {/* Miniature dark UI simulation */}
              <div
                data-theme="dark"
                className="h-24 w-full rounded border border-line bg-bg p-2 flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span className="h-1.5 w-8 rounded-full bg-accent" />
                  <span className="h-1.5 w-4 rounded-full bg-line-strong" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-16 rounded bg-text/40" />
                  <div className="h-1.5 w-full rounded bg-line" />
                  <div className="h-1.5 w-3/4 rounded bg-line" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <ThemeDarkIcon size={14} className={theme === "dark" ? "text-accent" : "text-text-3"} />
                  <span className="text-13 font-medium text-text">Dark (Default)</span>
                </div>
                {theme === "dark" && <CheckIcon size={14} className="text-accent" />}
              </div>
            </div>

            {/* Tile 2: Light Mode (Warm Paper) */}
            <div
              onClick={() => setTheme("light")}
              className={[
                "border rounded-panel p-4 cursor-pointer transition-all duration-150 flex flex-col justify-between h-44",
                theme === "light"
                  ? "border-accent bg-surface-2 ring-1 ring-accent"
                  : "border-line bg-surface-1 hover:border-line-strong hover:bg-surface-2",
              ].join(" ")}
            >
              {/* Miniature light UI simulation */}
              <div
                data-theme="light"
                className="h-24 w-full rounded border border-line bg-bg p-2 flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-line pb-1.5">
                  <span className="h-1.5 w-8 rounded-full bg-accent" />
                  <span className="h-1.5 w-4 rounded-full bg-line-strong" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-16 rounded bg-text/40" />
                  <div className="h-1.5 w-full rounded bg-line" />
                  <div className="h-1.5 w-3/4 rounded bg-line" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <ThemeLightIcon size={14} className={theme === "light" ? "text-accent" : "text-text-3"} />
                  <span className="text-13 font-medium text-text">Light (Paper)</span>
                </div>
                {theme === "light" && <CheckIcon size={14} className="text-accent" />}
              </div>
            </div>

            {/* Tile 3: System Mode */}
            <div
              onClick={() => setTheme("system")}
              className={[
                "border rounded-panel p-4 cursor-pointer transition-all duration-150 flex flex-col justify-between h-44",
                theme === "system"
                  ? "border-accent bg-surface-2 ring-1 ring-accent"
                  : "border-line bg-surface-1 hover:border-line-strong hover:bg-surface-2",
              ].join(" ")}
            >
              {/* Split miniature */}
              <div className="h-24 w-full rounded border border-line flex overflow-hidden">
                <div
                  data-theme="dark"
                  className="w-1/2 bg-bg p-2 border-r border-line flex flex-col justify-between"
                >
                  <span className="h-1.5 w-5 rounded-full bg-accent" />
                  <div className="h-1.5 w-full rounded bg-line" />
                </div>
                <div
                  data-theme="light"
                  className="w-1/2 bg-bg p-2 flex flex-col justify-between"
                >
                  <span className="h-1.5 w-5 rounded-full bg-accent" />
                  <div className="h-1.5 w-full rounded bg-line" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <ThemeSystemIcon size={14} className={theme === "system" ? "text-accent" : "text-text-3"} />
                  <span className="text-13 font-medium text-text">System</span>
                </div>
                {theme === "system" && <CheckIcon size={14} className="text-accent" />}
              </div>
            </div>
          </div>
        </section>

        {/* 2. PRIVACY AND DATA HANDLING */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div>
            <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
              Audit & Retention
            </span>
            <h2 className="text-16 font-medium text-text mt-0.5">Privacy and data handling</h2>
            <p className="text-13 text-text-3">
              API Crime Scene runs 100% on device. No telemetry, third-party trackers, or cloud storage exist.
            </p>
          </div>

          <div className="border border-line rounded-panel bg-surface-1 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-13">
              <div className="p-3 bg-surface-2 rounded-control border border-line space-y-1">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  Local IndexedDB Storage
                </span>
                <p className="font-mono text-14 text-text font-semibold tabular-nums">
                  {metrics.investigationsCount} Case Files · {metrics.requestsCount.toLocaleString()} Exhibits
                </p>
                <p className="text-12 text-text-3">All records reside in your browser profile directory.</p>
              </div>

              <div className="p-3 bg-surface-2 rounded-control border border-line space-y-1">
                <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                  In-Memory Processing
                </span>
                <p className="font-mono text-14 text-text font-semibold">
                  Zero Network Calls
                </p>
                <p className="text-12 text-text-3">HAR payload analysis never leaves client execution memory.</p>
              </div>
            </div>

            {clearSuccess && (
              <div className="p-3 rounded-control bg-success/15 border border-success/30 text-success text-13 font-mono flex items-center gap-2">
                <CheckIcon size={14} />
                <span>All local case files, parsed logs, and reports permanently cleared.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-line">
              <div>
                <h4 className="text-14 font-medium text-danger">Purge local workspace</h4>
                <p className="text-12 text-text-3">
                  Permanently deletes all stored investigations, exhibits, and generated reports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-control px-3.5 py-2 text-12 font-mono text-danger bg-danger/10 border border-danger/30 hover:bg-danger/20 transition-colors"
              >
                <TrashIcon size={13} />
                <span>Delete all local data</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. PREFERENCES */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div>
            <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
              Ergonomics
            </span>
            <h2 className="text-16 font-medium text-text mt-0.5">Workspace preferences</h2>
          </div>

          <div className="border border-line rounded-panel bg-surface-1 divide-y divide-line">
            {/* Sidebar Default */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-14 font-medium text-text">Sidebar default state</h3>
                <p className="text-12 text-text-3">
                  Choose whether the navigation sidebar opens expanded (248px) or compact (64px).
                </p>
              </div>

              <div className="flex items-center gap-1 font-mono text-12">
                <button
                  type="button"
                  onClick={() => handleSidebarChange("expanded")}
                  className={[
                    "px-3 py-1.5 rounded-control transition-colors",
                    sidebarDefault === "expanded"
                      ? "bg-surface-3 text-text font-medium border border-line-strong"
                      : "text-text-3 hover:text-text",
                  ].join(" ")}
                >
                  Expanded
                </button>
                <button
                  type="button"
                  onClick={() => handleSidebarChange("collapsed")}
                  className={[
                    "px-3 py-1.5 rounded-control transition-colors",
                    sidebarDefault === "collapsed"
                      ? "bg-surface-3 text-text font-medium border border-line-strong"
                      : "text-text-3 hover:text-text",
                  ].join(" ")}
                >
                  Collapsed
                </button>
              </div>
            </div>

            {/* Density */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-14 font-medium text-text">Table row density</h3>
                <p className="text-12 text-text-3">
                  Adjust row height in Request Explorer and differential tables.
                </p>
              </div>

              <div className="flex items-center gap-1 font-mono text-12">
                <button
                  type="button"
                  onClick={() => handleDensityChange("comfortable")}
                  className={[
                    "px-3 py-1.5 rounded-control transition-colors",
                    density === "comfortable"
                      ? "bg-surface-3 text-text font-medium border border-line-strong"
                      : "text-text-3 hover:text-text",
                  ].join(" ")}
                >
                  Comfortable (36px)
                </button>
                <button
                  type="button"
                  onClick={() => handleDensityChange("compact")}
                  className={[
                    "px-3 py-1.5 rounded-control transition-colors",
                    density === "compact"
                      ? "bg-surface-3 text-text font-medium border border-line-strong"
                      : "text-text-3 hover:text-text",
                  ].join(" ")}
                >
                  Compact (32px)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ABOUT */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div>
            <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
              System Specification
            </span>
            <h2 className="text-16 font-medium text-text mt-0.5">About API Crime Scene</h2>
          </div>

          <div className="border border-line rounded-panel bg-surface-1 p-5 text-13 font-mono space-y-2 text-text-2">
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-text-3">Release</span>
              <span className="text-text">v0.1.0 (Evidence Desk)</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-text-3">Architecture</span>
              <span className="text-text">Next.js App Router + TypeScript + Tailwind CSS</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <span className="text-text-3">Storage Engine</span>
              <span className="text-text">Native W3C IndexedDB Sandbox</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-3">License</span>
              <span className="text-text">Privacy-First Open Source</span>
            </div>
          </div>
        </section>

        {/* CONFIRM DELETE MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm data purge"
              className="w-full max-w-md border border-line bg-surface-1 shadow-2xl rounded-panel p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-danger">
                <AlertIcon size={20} />
                <h3 className="font-serif text-20 text-text font-normal">
                  Permanently purge all data?
                </h3>
              </div>

              <p className="text-13 text-text-3 leading-relaxed">
                This action will permanently erase all locally stored investigations, exhibit indexes, and compiled dossiers from this browser. This cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={clearing}
                  className="px-3.5 py-1.5 text-12 font-mono text-text-3 hover:text-text rounded-control"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmClear}
                  disabled={clearing}
                  className="inline-flex items-center gap-2 rounded-control bg-danger text-white px-4 py-1.5 text-12 font-mono font-medium hover:bg-danger/90 disabled:opacity-50 transition-colors"
                >
                  <TrashIcon size={12} />
                  <span>{clearing ? "Purging…" : "Yes, purge all data"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
