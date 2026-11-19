import type { Finding } from "./analysis/types";
import type { NormalizedEntry, ResourceType } from "./model";

export type StatusClass = "2xx" | "3xx" | "4xx" | "5xx" | "no-response";

export type SortKey = "file" | "duration" | "size" | "status" | "start";
export type SortDir = "asc" | "desc";

export interface FilterState {
  query: string;
  methods: string[];
  statusClasses: StatusClass[];
  exactStatuses: number[];
  resourceTypes: ResourceType[];
  domains: string[];
  failedOnly: boolean;
  flaggedOnly: boolean;
  findingSeverities: string[];
  findingCategories: string[];
  sortKey: SortKey;
  sortDir: SortDir;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  query: "",
  methods: [],
  statusClasses: [],
  exactStatuses: [],
  resourceTypes: [],
  domains: [],
  failedOnly: false,
  flaggedOnly: false,
  findingSeverities: [],
  findingCategories: [],
  sortKey: "file",
  sortDir: "asc",
};

export function statusClassOf(entry: NormalizedEntry): StatusClass {
  if (!entry.hasResponse || entry.status === null || entry.status === 0) return "no-response";
  if (entry.status >= 500) return "5xx";
  if (entry.status >= 400) return "4xx";
  if (entry.status >= 300) return "3xx";
  if (entry.status >= 200) return "2xx";
  return "no-response";
}

function matchesQuery(entry: NormalizedEntry, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    entry.url.toLowerCase().includes(q) ||
    (entry.domain ?? "").toLowerCase().includes(q) ||
    entry.path.toLowerCase().includes(q) ||
    entry.method.toLowerCase().includes(q) ||
    entry.statusText.toLowerCase().includes(q) ||
    entry.mimeType.toLowerCase().includes(q)
  );
}

function compareNullable(
  a: number | null,
  b: number | null,
  dir: SortDir
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const diff = a - b;
  return dir === "asc" ? diff : -diff;
}

export function filterEntries(
  entries: readonly NormalizedEntry[],
  filters: FilterState,
  findingsByEntry: ReadonlyMap<string, readonly Finding[]>
): number[] {
  const query = filters.query.trim();
  const methods = new Set(filters.methods.map((m) => m.toUpperCase()));
  const classes = new Set(filters.statusClasses);
  const statuses = new Set(filters.exactStatuses);
  const types = new Set(filters.resourceTypes);
  const domains = new Set(filters.domains);
  const result: number[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!matchesQuery(entry, query)) continue;
    if (methods.size > 0 && !methods.has(entry.method)) continue;
    if (classes.size > 0 && !classes.has(statusClassOf(entry))) continue;
    if (statuses.size > 0 && (entry.status === null || !statuses.has(entry.status))) continue;
    if (types.size > 0 && !types.has(entry.resourceType)) continue;
    if (domains.size > 0 && (entry.domain === null || !domains.has(entry.domain))) continue;
    if (filters.failedOnly) {
      const failed = entry.flags.failedHttp || entry.flags.networkFailure;
      if (!failed) continue;
    }
    const findings = findingsByEntry.get(entry.id) ?? [];
    if (filters.flaggedOnly && findings.length === 0) continue;
    if (filters.findingSeverities.length > 0) {
      if (!findings.some((f) => filters.findingSeverities.includes(f.severity))) continue;
    }
    if (filters.findingCategories.length > 0) {
      if (!findings.some((f) => filters.findingCategories.includes(f.category))) continue;
    }
    result.push(i);
  }

  return result;
}

export function sortEntryIndexes(
  entries: readonly NormalizedEntry[],
  indexes: readonly number[],
  sortKey: SortKey,
  sortDir: SortDir
): number[] {
  if (sortKey === "file") {
    return sortDir === "asc" ? [...indexes] : [...indexes].reverse();
  }

  const decorated = indexes.map((index, ordinal) => ({ index, ordinal }));
  decorated.sort((a, b) => {
    const left = entries[a.index];
    const right = entries[b.index];
    let cmp = 0;
    if (sortKey === "duration") cmp = compareNullable(left.durationMs, right.durationMs, sortDir);
    else if (sortKey === "size") {
      const ls = left.transferSize ?? left.contentSize;
      const rs = right.transferSize ?? right.contentSize;
      cmp = compareNullable(ls, rs, sortDir);
    } else if (sortKey === "status") {
      cmp = compareNullable(left.status, right.status, sortDir);
    } else if (sortKey === "start") {
      cmp = compareNullable(left.startOffsetMs, right.startOffsetMs, sortDir);
    }
    if (cmp !== 0) return cmp;
    return a.ordinal - b.ordinal;
  });
  return decorated.map((d) => d.index);
}

export function applyFiltersAndSort(
  entries: readonly NormalizedEntry[],
  filters: FilterState,
  findingsByEntry: ReadonlyMap<string, readonly Finding[]>
): number[] {
  const filtered = filterEntries(entries, filters, findingsByEntry);
  return sortEntryIndexes(entries, filtered, filters.sortKey, filters.sortDir);
}
