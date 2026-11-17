import type { HarEntry, HarFile } from "./types";

export interface RequestDiffItem {
  id: string; // e.g. EX-0001
  method: string;
  url: string;
  statusA?: number;
  statusB?: number;
  timeA?: number;
  timeB?: number;
  sizeA?: number;
  sizeB?: number;
  deltaMs?: number;
  deltaBytes?: number;
}

export interface SessionComparisonResult {
  added: RequestDiffItem[];
  removed: RequestDiffItem[];
  statusChanges: RequestDiffItem[];
  durationRegressions: RequestDiffItem[];
  sizeChanges: RequestDiffItem[];
  summary: {
    totalA: number;
    totalB: number;
    addedCount: number;
    removedCount: number;
    statusChangedCount: number;
    regressionsCount: number;
    sizeChangedCount: number;
  };
}

function normalizeUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    // Remove transient query parameters if needed, or keep path + search
    return `${u.origin}${u.pathname}${u.search}`;
  } catch {
    return urlStr;
  }
}

function getRequestKey(entry: HarEntry): string {
  const method = (entry.request?.method || "GET").toUpperCase();
  const url = normalizeUrl(entry.request?.url || "");
  return `${method} ${url}`;
}

export function compareHarSessions(
  harA: HarFile,
  harB: HarFile
): SessionComparisonResult {
  const entriesA = harA.log?.entries || [];
  const entriesB = harB.log?.entries || [];

  const mapA = new Map<string, HarEntry[]>();
  for (const entry of entriesA) {
    const key = getRequestKey(entry);
    const list = mapA.get(key) || [];
    list.push(entry);
    mapA.set(key, list);
  }

  const mapB = new Map<string, HarEntry[]>();
  for (const entry of entriesB) {
    const key = getRequestKey(entry);
    const list = mapB.get(key) || [];
    list.push(entry);
    mapB.set(key, list);
  }

  const added: RequestDiffItem[] = [];
  const removed: RequestDiffItem[] = [];
  const statusChanges: RequestDiffItem[] = [];
  const durationRegressions: RequestDiffItem[] = [];
  const sizeChanges: RequestDiffItem[] = [];

  // Track matched keys
  const visitedKeys = new Set<string>();

  // Check all entries in B against A
  entriesB.forEach((entryB, idx) => {
    const key = getRequestKey(entryB);
    const id = `EX-B${String(idx + 1).padStart(3, "0")}`;
    const listA = mapA.get(key);

    const sizeB = entryB.response?.content?.size || entryB.response?.bodySize || 0;
    const timeB = Math.round(entryB.time || 0);
    const statusB = entryB.response?.status || 0;

    if (!listA || listA.length === 0) {
      added.push({
        id,
        method: entryB.request?.method || "GET",
        url: entryB.request?.url || "",
        statusB,
        timeB,
        sizeB,
      });
    } else {
      visitedKeys.add(key);
      const entryA = listA[0]; // match first occurrence
      const sizeA = entryA.response?.content?.size || entryA.response?.bodySize || 0;
      const timeA = Math.round(entryA.time || 0);
      const statusA = entryA.response?.status || 0;

      // Status change
      if (statusA !== statusB) {
        statusChanges.push({
          id,
          method: entryB.request?.method || "GET",
          url: entryB.request?.url || "",
          statusA,
          statusB,
          timeA,
          timeB,
          sizeA,
          sizeB,
        });
      }

      // Duration regression (> 50ms slower and > 25% slower)
      const deltaMs = timeB - timeA;
      if (deltaMs > 50 && (timeA === 0 || deltaMs / timeA > 0.25)) {
        durationRegressions.push({
          id,
          method: entryB.request?.method || "GET",
          url: entryB.request?.url || "",
          timeA,
          timeB,
          deltaMs,
          statusA,
          statusB,
        });
      }

      // Size changes (> 1KB delta)
      const deltaBytes = sizeB - sizeA;
      if (Math.abs(deltaBytes) > 1024) {
        sizeChanges.push({
          id,
          method: entryB.request?.method || "GET",
          url: entryB.request?.url || "",
          sizeA,
          sizeB,
          deltaBytes,
          statusA,
          statusB,
        });
      }
    }
  });

  // Check entries in A that don't exist in B (Removed)
  entriesA.forEach((entryA, idx) => {
    const key = getRequestKey(entryA);
    const id = `EX-A${String(idx + 1).padStart(3, "0")}`;
    const listB = mapB.get(key);

    if (!listB || listB.length === 0) {
      const sizeA = entryA.response?.content?.size || entryA.response?.bodySize || 0;
      const timeA = Math.round(entryA.time || 0);
      const statusA = entryA.response?.status || 0;

      removed.push({
        id,
        method: entryA.request?.method || "GET",
        url: entryA.request?.url || "",
        statusA,
        timeA,
        sizeA,
      });
    }
  });

  return {
    added,
    removed,
    statusChanges,
    durationRegressions,
    sizeChanges,
    summary: {
      totalA: entriesA.length,
      totalB: entriesB.length,
      addedCount: added.length,
      removedCount: removed.length,
      statusChangedCount: statusChanges.length,
      regressionsCount: durationRegressions.length,
      sizeChangedCount: sizeChanges.length,
    },
  };
}
