"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { CaseFileHeader } from "@/components/case-file-header";
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  SortIcon,
  TrashIcon,
  ChevronRightIcon,
  LockIcon,
} from "@/components/icons";
import { getInvestigations, deleteInvestigation, updateInvestigation } from "@/lib/storage";
import type { Investigation, InvestigationStatus } from "@/lib/types";

type SortOption = "newest" | "oldest" | "exhibits_desc" | "exhibits_asc";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvestigationStatus>("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getInvestigations();
      setInvestigations(data);
    } catch (err) {
      console.error("Failed to load investigations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const domains = useMemo(() => {
    const set = new Set<string>();
    investigations.forEach((inv) => {
      if (inv.source) set.add(inv.source);
    });
    return Array.from(set).sort();
  }, [investigations]);

  const filteredInvestigations = useMemo(() => {
    return investigations
      .filter((inv) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = inv.name.toLowerCase().includes(q);
          const matchSource = inv.source.toLowerCase().includes(q);
          if (!matchName && !matchSource) return false;
        }
        // Status filter
        if (statusFilter !== "all" && inv.status !== statusFilter) {
          return false;
        }
        // Domain filter
        if (domainFilter !== "all" && inv.source !== domainFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        if (sortBy === "exhibits_desc") {
          return (b.entryCount || 0) - (a.entryCount || 0);
        }
        if (sortBy === "exhibits_asc") {
          return (a.entryCount || 0) - (b.entryCount || 0);
        }
        return 0;
      });
  }, [investigations, search, statusFilter, domainFilter, sortBy]);

  const handleDelete = async (id: string) => {
    await deleteInvestigation(id);
    setConfirmDeleteId(null);
    await loadData();
  };

  const toggleStatus = async (inv: Investigation) => {
    const nextStatus: InvestigationStatus = inv.status === "open" ? "closed" : "open";
    await updateInvestigation(inv.id, { status: nextStatus });
    await loadData();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <CaseFileHeader
          title="Case file directory"
          caseNumber="ARCHIVE"
          actions={
            <Link
              href="/new-investigation"
              className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
            >
              <PlusIcon size={14} />
              <span>New investigation</span>
            </Link>
          }
        />

        <p className="text-14 text-text-3 -mt-2">
          Forensic records and parsed network captures stored locally in this browser.
        </p>

        {/* Search, Filter, Sort Controls */}
        <div className="border border-line rounded-panel bg-surface-1 p-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case title or domain…"
              className="w-full bg-surface-2 border border-line rounded-control pl-8 pr-3 py-1.5 text-13 text-text placeholder-text-3 outline-none focus:border-accent"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 text-12 font-mono">
            <span className="text-text-3 hidden sm:inline mr-1">Status:</span>
            {(["all", "open", "closed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={[
                  "px-2.5 py-1 rounded-control uppercase tracking-wider text-11 transition-colors",
                  statusFilter === st
                    ? "bg-surface-3 text-text font-medium border border-line-strong"
                    : "text-text-3 hover:text-text",
                ].join(" ")}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          {domains.length > 0 && (
            <div className="flex items-center gap-1.5 text-12 font-mono">
              <FilterIcon size={13} className="text-text-3" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-surface-2 border border-line rounded-control px-2 py-1 text-12 text-text outline-none focus:border-accent"
              >
                <option value="all">All Domains ({domains.length})</option>
                {domains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center gap-1.5 text-12 font-mono ml-auto">
            <SortIcon size={13} className="text-text-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-surface-2 border border-line rounded-control px-2 py-1 text-12 text-text outline-none focus:border-accent"
            >
              <option value="newest">Recently modified</option>
              <option value="oldest">Oldest modified</option>
              <option value="exhibits_desc">Most exhibits</option>
              <option value="exhibits_asc">Fewest exhibits</option>
            </select>
          </div>
        </div>

        {/* Investigation List */}
        {loading ? (
          <div className="p-12 text-center font-mono text-12 text-text-3 border border-line rounded-panel bg-surface-1">
            Loading investigation records…
          </div>
        ) : filteredInvestigations.length === 0 ? (
          <EmptyState
            headline={
              investigations.length === 0
                ? "No case files in archive"
                : "No matching investigations"
            }
            description={
              investigations.length === 0
                ? "Open an investigation by importing a HAR file. All network exhibits are stored locally in IndexedDB."
                : "Try adjusting your search criteria or resetting active filters."
            }
            actions={
              investigations.length === 0 ? (
                <Link
                  href="/new-investigation"
                  className="inline-flex items-center gap-2 rounded-control bg-accent text-accent-ink px-4 py-2 text-13 font-medium hover:bg-accent-strong transition-colors"
                >
                  <PlusIcon size={14} />
                  <span>New investigation</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setDomainFilter("all");
                  }}
                  className="inline-flex items-center gap-1 rounded-control border border-line bg-surface-2 px-3 py-1.5 text-12 text-text-2 hover:text-text font-mono"
                >
                  Reset filters
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredInvestigations.map((inv, idx) => {
              const caseNum = `CASE-${String(idx + 1).padStart(4, "0")}`;
              return (
                <div
                  key={inv.id}
                  className="border border-line rounded-panel bg-surface-1 p-4 md:p-5 hover:border-line-strong transition-all duration-150"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Case Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-11 text-text-3 mb-1.5">
                        <span className="uppercase tracking-wider font-semibold text-text-2">
                          {caseNum}
                        </span>
                        <span className="text-line-strong">/</span>
                        <span className="truncate">{inv.source}</span>
                        <span className="text-line-strong">/</span>
                        <span>
                          {new Date(inv.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-line-strong">/</span>
                        <span className="text-accent font-medium tabular-nums">
                          {inv.entryCount.toLocaleString()} EXHIBITS
                        </span>
                      </div>

                      <Link
                        href={`/request-explorer?id=${inv.id}`}
                        className="group inline-block"
                      >
                        <h2 className="text-16 font-medium text-text group-hover:text-accent transition-colors flex items-center gap-2">
                          <span>{inv.name}</span>
                          <ChevronRightIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h2>
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-12 text-text-3 font-mono">
                        <span>Client: {inv.creator || "Standard HAR"}</span>
                        <span>Pages: {inv.pageCount || 1}</span>
                        {inv.timeRange && (
                          <span>
                            Duration:{" "}
                            {Math.round(
                              (new Date(inv.timeRange.end).getTime() -
                                new Date(inv.timeRange.start).getTime()) /
                                1000
                            )}
                            s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
                      {/* Status toggle */}
                      <button
                        type="button"
                        onClick={() => toggleStatus(inv)}
                        className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1 text-11 font-mono uppercase tracking-wider border border-line bg-surface-2 text-text-2 hover:text-text transition-colors"
                        title="Click to toggle status"
                      >
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full",
                            inv.status === "open" ? "bg-accent" : "bg-text-3",
                          ].join(" ")}
                        />
                        <span>{inv.status}</span>
                      </button>

                      {/* Inspect link */}
                      <Link
                        href={`/request-explorer?id=${inv.id}`}
                        className="inline-flex items-center gap-1.5 rounded-control bg-surface-2 hover:bg-surface-3 border border-line text-text px-3 py-1 text-12 font-mono transition-colors"
                      >
                        <span>Inspect</span>
                      </Link>

                      {/* Delete */}
                      {confirmDeleteId === inv.id ? (
                        <div className="flex items-center gap-1 bg-surface-3 p-0.5 rounded-control border border-danger/30">
                          <button
                            type="button"
                            onClick={() => handleDelete(inv.id)}
                            className="px-2 py-0.5 text-11 font-mono text-danger font-semibold hover:bg-danger/20 rounded-control"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 text-11 font-mono text-text-3 hover:text-text rounded-control"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(inv.id)}
                          className="p-1.5 text-text-3 hover:text-danger rounded-control transition-colors"
                          title="Delete case file"
                          aria-label="Delete case file"
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
