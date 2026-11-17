"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CaseFileHeader } from "@/components/case-file-header";
import { EmptyState } from "@/components/empty-state";
import { RedactionBar } from "@/components/redaction-bar";
import { WaterfallRuler } from "@/components/waterfall-ruler";
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
} from "@/components/icons";
import { isSensitiveHeader, isSensitiveQueryParam } from "@/lib/redaction";
import { getInvestigations, getInvestigation } from "@/lib/storage";
import { formatExhibitId, formatBytes } from "@/lib/har-parser";
import type { Investigation } from "@/lib/types";

type DetailTab = "overview" | "headers" | "request" | "response" | "timing";

function getMimeCategory(mimeType = ""): string {
  const m = mimeType.toLowerCase();
  if (m.includes("json") || m.includes("xml")) return "xhr";
  if (m.includes("javascript") || m.includes("ecmascript")) return "script";
  if (m.includes("css")) return "style";
  if (m.includes("image")) return "image";
  if (m.includes("font")) return "font";
  if (m.includes("html")) return "doc";
  return "other";
}

function getMethodBadgeColor(method = "GET"): string {
  const m = method.toUpperCase();
  if (m === "GET") return "text-calm bg-calm-soft";
  if (m === "POST") return "text-accent bg-accent-soft";
  if (m === "PUT") return "text-warning bg-warning/10";
  if (m === "PATCH") return "text-abstract bg-abstract-soft";
  if (m === "DELETE") return "text-danger bg-danger/10";
  return "text-text-2 bg-surface-3";
}

function getStatusColor(status = 0): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 300 && status < 400) return "text-info";
  if (status >= 400 && status < 500) return "text-warning";
  if (status >= 500 || status === 0) return "text-danger";
  return "text-text-3";
}

function RequestExplorerContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const queryExhibit = searchParams.get("exhibit");

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selection state
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [copied, setCopied] = useState(false);

  // Windowed virtual scrolling
  const [visibleStart, setVisibleStart] = useState(0);
  const ROW_HEIGHT = 36;
  const WINDOW_BUFFER = 50;
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const invs = await getInvestigations();
        setInvestigations(invs);

        if (invs.length > 0) {
          const target = queryId
            ? invs.find((i) => i.id === queryId) || invs[0]
            : invs[0];

          // Fetch full investigation
          const fullInv = await getInvestigation(target.id);
          setCurrentInvestigation(fullInv);

          if (queryExhibit) {
            const exIdx = parseInt(queryExhibit, 10);
            if (!isNaN(exIdx)) setSelectedIndex(exIdx);
          }
        }
      } catch {
        /* keep empty explorer state */
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [queryId, queryExhibit]);

  const switchInvestigation = async (id: string) => {
    setLoading(true);
    try {
      const full = await getInvestigation(id);
      setCurrentInvestigation(full);
      setSelectedIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const rawEntries = useMemo(() => {
    return currentInvestigation?.har?.log?.entries || [];
  }, [currentInvestigation]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return rawEntries
      .map((entry, originalIndex) => ({ entry, originalIndex }))
      .filter(({ entry }) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const url = (entry.request?.url || "").toLowerCase();
          const method = (entry.request?.method || "").toLowerCase();
          if (!url.includes(q) && !method.includes(q)) return false;
        }

        // Method
        if (methodFilter !== "all") {
          if ((entry.request?.method || "").toUpperCase() !== methodFilter) return false;
        }

        // Status
        if (statusFilter !== "all") {
          const status = entry.response?.status || 0;
          if (statusFilter === "2xx" && (status < 200 || status >= 300)) return false;
          if (statusFilter === "3xx" && (status < 300 || status >= 400)) return false;
          if (statusFilter === "4xx" && (status < 400 || status >= 500)) return false;
          if (statusFilter === "5xx" && status < 500) return false;
        }

        // Type
        if (typeFilter !== "all") {
          const cat = getMimeCategory(entry.response?.content?.mimeType);
          if (cat !== typeFilter) return false;
        }

        return true;
      });
  }, [rawEntries, search, methodFilter, statusFilter, typeFilter]);

  // Virtual window calculation on scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    setVisibleStart(Math.max(0, startIndex - 10));
  };

  const visibleEntries = useMemo(() => {
    return filteredEntries.slice(visibleStart, visibleStart + WINDOW_BUFFER);
  }, [filteredEntries, visibleStart]);

  const selectedEntry = rawEntries[selectedIndex] || filteredEntries[0]?.entry || null;

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppShell title="Request Explorer">
        <div className="p-12 text-center font-mono text-12 text-text-3 border border-line rounded-panel bg-surface-1">
          Loading forensic exhibits…
        </div>
      </AppShell>
    );
  }

  if (!currentInvestigation || rawEntries.length === 0) {
    return (
      <AppShell title="Request Explorer">
        <div className="space-y-6">
          <CaseFileHeader
            title="Request Explorer"
            caseNumber="EMPTY"
            actions={
              <Link
                href="/new-investigation"
                className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
              >
                <PlusIcon size={14} />
                <span>Import HAR</span>
              </Link>
            }
          />
          <EmptyState
            headline="No network exhibits loaded"
            description="Request Explorer inspects decrypted headers, payloads, and waterfall timelines for imported recordings. Open an investigation to begin."
            actions={
              <Link
                href="/new-investigation"
                className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
              >
                <PlusIcon size={14} />
                <span>Import HAR file</span>
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Request Explorer">
      <div className="space-y-4">
        {/* Case File Header with Investigation Switcher */}
        <CaseFileHeader
          title={currentInvestigation.name}
          caseNumber={`CASE-${currentInvestigation.id.slice(-4).toUpperCase()}`}
          sourceDomain={currentInvestigation.source}
          openedDate={currentInvestigation.createdAt}
          requestCount={rawEntries.length}
          status={currentInvestigation.status}
          actions={
            investigations.length > 1 ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-11 text-text-3 uppercase tracking-wider hidden sm:inline">
                  Case:
                </span>
                <select
                  value={currentInvestigation.id}
                  onChange={(e) => switchInvestigation(e.target.value)}
                  className="bg-surface-2 border border-line rounded-control px-2.5 py-1 text-12 font-mono text-text outline-none focus:border-accent"
                >
                  {investigations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.entryCount})
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          }
        />

        {/* Filter Controls Bar */}
        <div className="border border-line rounded-panel bg-surface-1 p-2.5 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by path, URL, or method…"
              className="w-full bg-surface-2 border border-line rounded-control pl-8 pr-3 py-1 text-13 text-text placeholder-text-3 outline-none focus:border-accent font-sans"
            />
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-1 font-mono text-11">
            <span className="text-text-3 mr-1">Method:</span>
            {["all", "GET", "POST", "PUT", "DELETE"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethodFilter(m)}
                className={[
                  "px-2 py-0.5 rounded-control uppercase transition-colors",
                  methodFilter === m
                    ? "bg-surface-3 text-text font-semibold border border-line-strong"
                    : "text-text-3 hover:text-text",
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 font-mono text-11">
            <span className="text-text-3 mr-1">Status:</span>
            {["all", "2xx", "3xx", "4xx", "5xx"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={[
                  "px-2 py-0.5 rounded-control uppercase transition-colors",
                  statusFilter === st
                    ? "bg-surface-3 text-text font-semibold border border-line-strong"
                    : "text-text-3 hover:text-text",
                ].join(" ")}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 font-mono text-11">
            <FilterIcon size={12} className="text-text-3" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-2 border border-line rounded-control px-2 py-0.5 text-11 text-text outline-none focus:border-accent"
            >
              <option value="all">All Types</option>
              <option value="xhr">XHR / Fetch</option>
              <option value="script">Script</option>
              <option value="style">Style</option>
              <option value="image">Image</option>
              <option value="doc">Document</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Count info */}
          <div className="font-mono text-11 text-text-3 ml-auto">
            {filteredEntries.length.toLocaleString()} / {rawEntries.length.toLocaleString()} exhibits
          </div>
        </div>

        {/* Split Pane: Left Request List, Right Detail Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px] max-h-[80vh]">
          {/* Left Pane: Exhibit Table with Windowed Scrolling */}
          <div className="lg:col-span-5 xl:col-span-5 border border-line rounded-panel bg-surface-1 flex flex-col overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center border-b border-line bg-surface-2 px-3 py-2 text-11 font-mono uppercase tracking-wider text-text-3 shrink-0">
              <span className="col-span-2">Exhibit</span>
              <span className="col-span-2">Method</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-4">Path / Resource</span>
              <span className="col-span-2 text-right">Time</span>
            </div>

            {/* Virtualized / Windowed Scroll Area */}
            <div
              ref={listContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto relative divide-y divide-line"
            >
              {/* Spacer above */}
              <div style={{ height: `${visibleStart * ROW_HEIGHT}px` }} />

              {/* Rendered window slice */}
              {visibleEntries.map(({ entry, originalIndex }) => {
                const exId = formatExhibitId(originalIndex);
                const isSelected = selectedIndex === originalIndex;
                const method = entry.request?.method || "GET";
                const status = entry.response?.status || 0;
                const url = entry.request?.url || "";
                let pathname = url;
                try {
                  const u = new URL(url);
                  pathname = u.pathname + u.search;
                } catch {
                  // keep full
                }

                return (
                  <div
                    key={originalIndex}
                    onClick={() => setSelectedIndex(originalIndex)}
                    className={[
                      "grid grid-cols-12 items-center px-3 cursor-pointer text-12 font-mono transition-colors",
                      isSelected
                        ? "bg-surface-3 text-text border-l-2 border-accent"
                        : "hover:bg-surface-2/60 text-text-2",
                    ].join(" ")}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    <span className="col-span-2 text-11 text-text-3 font-medium">
                      {exId}
                    </span>

                    <span className="col-span-2">
                      <span className={`px-1.5 py-0.5 rounded-control text-11 font-semibold ${getMethodBadgeColor(method)}`}>
                        {method}
                      </span>
                    </span>

                    <span className="col-span-2 flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          status >= 200 && status < 300
                            ? "bg-success"
                            : status >= 300 && status < 400
                            ? "bg-info"
                            : status >= 400 && status < 500
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      />
                      <span className={`font-medium ${getStatusColor(status)}`}>
                        {status || "ERR"}
                      </span>
                    </span>

                    <span className="col-span-4 truncate text-text font-sans text-13" title={url}>
                      {pathname || "/"}
                    </span>

                    <span className="col-span-2 text-right text-text-3 tabular-nums">
                      {Math.round(entry.time || 0)}ms
                    </span>
                  </div>
                );
              })}

              {/* Spacer below */}
              <div
                style={{
                  height: `${Math.max(
                    0,
                    (filteredEntries.length - (visibleStart + visibleEntries.length)) * ROW_HEIGHT
                  )}px`,
                }}
              />
            </div>
          </div>

          {/* Right Pane: Forensic Detail Panel */}
          <div className="lg:col-span-7 xl:col-span-7 border border-line rounded-panel bg-surface-1 flex flex-col overflow-hidden">
            {selectedEntry ? (
              <>
                {/* Detail Header */}
                <div className="border-b border-line bg-surface-2 p-4 shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-12 font-semibold text-accent">
                        {formatExhibitId(selectedIndex)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-control text-11 font-mono font-semibold ${getMethodBadgeColor(selectedEntry.request?.method)}`}>
                        {selectedEntry.request?.method}
                      </span>
                      <span className={`font-mono text-12 font-semibold ${getStatusColor(selectedEntry.response?.status)}`}>
                        {selectedEntry.response?.status} {selectedEntry.response?.statusText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-12 font-mono text-text-3">
                      <span>{Math.round(selectedEntry.time || 0)}ms</span>
                      <span>·</span>
                      <span>{formatBytes(selectedEntry.response?.content?.size || selectedEntry.response?.bodySize || 0)}</span>
                    </div>
                  </div>

                  {/* URL Row with Copy */}
                  <div className="mt-2.5 flex items-center gap-2 bg-surface-1 border border-line rounded-control px-2.5 py-1.5">
                    <span className="font-mono text-12 text-text truncate flex-1 select-all" title={selectedEntry.request?.url}>
                      {selectedEntry.request?.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(selectedEntry.request?.url || "")}
                      className="text-text-3 hover:text-text p-1 shrink-0"
                      title="Copy full URL"
                      aria-label="Copy full URL"
                    >
                      {copied ? <CheckIcon size={13} className="text-success" /> : <CopyIcon size={13} />}
                    </button>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="mt-3 flex items-center gap-1 border-b border-line -mb-4 pt-1 font-mono text-11 uppercase tracking-wider">
                    {(["overview", "headers", "request", "response", "timing"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={[
                          "px-3 py-1.5 transition-colors border-b-2 -mb-[1px]",
                          activeTab === tab
                            ? "border-accent text-accent font-semibold"
                            : "border-transparent text-text-3 hover:text-text",
                        ].join(" ")}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line">
                          Exhibit Metadata
                        </div>
                        <div className="divide-y divide-line bg-surface-1/40 font-mono text-12">
                          <div className="p-3 grid grid-cols-3 gap-2">
                            <span className="text-text-3">Timestamp</span>
                            <span className="col-span-2 text-text">
                              {selectedEntry.startedDateTime ? new Date(selectedEntry.startedDateTime).toISOString() : "Unknown"}
                            </span>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-2">
                            <span className="text-text-3">Server IP</span>
                            <span className="col-span-2 text-text">
                              {selectedEntry.serverIPAddress || "Not captured"}
                            </span>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-2">
                            <span className="text-text-3">HTTP Version</span>
                            <span className="col-span-2 text-text">
                              {selectedEntry.request?.httpVersion || "HTTP/1.1"}
                            </span>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-2">
                            <span className="text-text-3">MIME Type</span>
                            <span className="col-span-2 text-text">
                              {selectedEntry.response?.content?.mimeType || "Unknown"}
                            </span>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-2">
                            <span className="text-text-3">Redirect URL</span>
                            <span className="col-span-2 text-text truncate">
                              {selectedEntry.response?.redirectURL || "None"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini waterfall */}
                      {selectedEntry.timings && (
                        <div className="border border-line rounded-panel p-4 bg-surface-1/40">
                          <h4 className="font-mono text-11 uppercase tracking-wider text-text-3 mb-2">
                            Timing Summary
                          </h4>
                          <WaterfallRuler timings={selectedEntry.timings} totalTime={selectedEntry.time || 0} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: HEADERS */}
                  {activeTab === "headers" && (
                    <div className="space-y-6">
                      {/* Request Headers */}
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line flex items-center justify-between">
                          <span>Request Headers ({selectedEntry.request?.headers?.length || 0})</span>
                          <span className="text-accent text-10">Auto-Redacted</span>
                        </div>
                        <div className="divide-y divide-line bg-surface-1/40 font-mono text-12">
                          {selectedEntry.request?.headers?.length ? (
                            selectedEntry.request.headers.map((h, i) => {
                              const sensitive = isSensitiveHeader(h.name);
                              return (
                                <div key={i} className="p-2.5 grid grid-cols-12 gap-2 hover:bg-surface-2/40">
                                  <span className="col-span-4 text-text-3 truncate" title={h.name}>
                                    {h.name}
                                  </span>
                                  <div className="col-span-8">
                                    <RedactionBar value={h.value} isSensitive={sensitive} />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-text-3 text-12">No request headers recorded</div>
                          )}
                        </div>
                      </div>

                      {/* Response Headers */}
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line flex items-center justify-between">
                          <span>Response Headers ({selectedEntry.response?.headers?.length || 0})</span>
                          <span className="text-accent text-10">Auto-Redacted</span>
                        </div>
                        <div className="divide-y divide-line bg-surface-1/40 font-mono text-12">
                          {selectedEntry.response?.headers?.length ? (
                            selectedEntry.response.headers.map((h, i) => {
                              const sensitive = isSensitiveHeader(h.name);
                              return (
                                <div key={i} className="p-2.5 grid grid-cols-12 gap-2 hover:bg-surface-2/40">
                                  <span className="col-span-4 text-text-3 truncate" title={h.name}>
                                    {h.name}
                                  </span>
                                  <div className="col-span-8">
                                    <RedactionBar value={h.value} isSensitive={sensitive} />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-text-3 text-12">No response headers recorded</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REQUEST */}
                  {activeTab === "request" && (
                    <div className="space-y-4">
                      {/* Query Parameters */}
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line">
                          Query Parameters ({selectedEntry.request?.queryString?.length || 0})
                        </div>
                        <div className="divide-y divide-line bg-surface-1/40 font-mono text-12">
                          {selectedEntry.request?.queryString?.length ? (
                            selectedEntry.request.queryString.map((q, i) => {
                              const sensitive = isSensitiveQueryParam(q.name);
                              return (
                                <div key={i} className="p-2.5 grid grid-cols-12 gap-2 hover:bg-surface-2/40">
                                  <span className="col-span-4 text-text-3 truncate">{q.name}</span>
                                  <div className="col-span-8">
                                    <RedactionBar value={q.value} isSensitive={sensitive} />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-text-3 text-12">No query parameters</div>
                          )}
                        </div>
                      </div>

                      {/* Request POST Body */}
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line flex items-center justify-between">
                          <span>Request Payload</span>
                          <span>{selectedEntry.request?.postData?.mimeType || "None"}</span>
                        </div>
                        <div className="p-3 bg-surface-1/40">
                          {selectedEntry.request?.postData?.text ? (
                            <pre className="font-mono text-12 text-text overflow-x-auto p-3 bg-surface-2 rounded-control select-all max-h-64 whitespace-pre-wrap break-all">
                              {selectedEntry.request.postData.text}
                            </pre>
                          ) : (
                            <p className="text-12 text-text-3 font-mono">No request body submitted</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: RESPONSE */}
                  {activeTab === "response" && (
                    <div className="space-y-4">
                      <div className="border border-line rounded-panel overflow-hidden">
                        <div className="bg-surface-2 px-3 py-2 font-mono text-11 uppercase tracking-wider text-text-3 border-b border-line flex items-center justify-between">
                          <span>Response Content</span>
                          <span className="text-11">{selectedEntry.response?.content?.mimeType || "Unknown"}</span>
                        </div>
                        <div className="p-3 bg-surface-1/40">
                          {selectedEntry.response?.content?.text ? (
                            <pre className="font-mono text-12 text-text overflow-x-auto p-3 bg-surface-2 rounded-control select-all max-h-80 whitespace-pre-wrap break-all">
                              {selectedEntry.response.content.text}
                            </pre>
                          ) : (
                            <p className="text-12 text-text-3 font-mono">
                              Response payload body was empty or not captured in this HAR.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: TIMING */}
                  {activeTab === "timing" && (
                    <div className="space-y-4">
                      {selectedEntry.timings ? (
                        <WaterfallRuler
                          timings={selectedEntry.timings}
                          totalTime={selectedEntry.time || 0}
                        />
                      ) : (
                        <p className="text-12 text-text-3 font-mono">No detailed timing captured for this exhibit.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-text-3 font-mono text-12">
                Select an exhibit from the left to inspect forensic details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function RequestExplorerPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Request Explorer">
          <div className="p-12 text-center font-mono text-12 text-text-3">
            Loading explorer workspace…
          </div>
        </AppShell>
      }
    >
      <RequestExplorerContent />
    </Suspense>
  );
}
