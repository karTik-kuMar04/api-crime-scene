import type { HarEntry, HarFile } from "./types";

export interface HarParseResult {
  file: HarFile;
  entryCount: number;
  pageCount: number;
  creator: string;
  sourceDomain: string;
  timeRange: { start: string; end: string } | null;
  totalSize: number;
  failedCount: number;
  domains: string[];
}

export type ParseStage = "select" | "validate" | "parse" | "ready";

export interface ParseProgress {
  stage: ParseStage;
  progress: number; // 0 - 100
  message: string;
}

export const MAX_HAR_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function extractDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch {
    // If not a full URL or relative, return as-is or fallback
    const match = urlStr.match(/^(?:https?:\/\/)?([^/:]+)/i);
    return match ? match[1] : urlStr;
  }
}

export function formatExhibitId(index: number): string {
  return `EX-${String(index + 1).padStart(4, "0")}`;
}

/**
 * Yield to event loop to keep UI thread responsive on large files.
 */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function parseHarFile(
  file: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<HarParseResult> {
  if (file.size === 0) {
    throw new Error("File is empty (0 bytes). Please provide a valid HAR recording.");
  }

  if (file.size > MAX_HAR_SIZE_BYTES) {
    throw new Error(
      `File exceeds the 150 MB limit (${formatBytes(file.size)}). Large files may exhaust browser memory.`
    );
  }

  onProgress?.({
    stage: "validate",
    progress: 15,
    message: "Validating file format and structure…",
  });

  await yieldToMain();

  const text = await file.text();

  onProgress?.({
    stage: "parse",
    progress: 40,
    message: "Parsing JSON payload…",
  });

  await yieldToMain();

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Malformed JSON syntax";
    throw new Error(`Invalid JSON: ${msg}`);
  }

  if (!rawJson || typeof rawJson !== "object") {
    throw new Error("Invalid format: Root element must be a JSON object.");
  }

  const harObj = rawJson as Partial<HarFile>;

  if (!harObj.log) {
    throw new Error("Not a valid HAR file: Missing root 'log' property.");
  }

  if (!Array.isArray(harObj.log.entries)) {
    throw new Error("Not a valid HAR file: 'log.entries' array is missing or invalid.");
  }

  const entries = harObj.log.entries as HarEntry[];
  const entryCount = entries.length;
  const pageCount = Array.isArray(harObj.log.pages) ? harObj.log.pages.length : 0;
  const creator = harObj.log.creator
    ? `${harObj.log.creator.name} ${harObj.log.creator.version || ""}`.trim()
    : "Unknown client";

  onProgress?.({
    stage: "parse",
    progress: 75,
    message: `Sanitizing and indexing ${entryCount.toLocaleString()} requests…`,
  });

  await yieldToMain();

  // Index entries, compute time range, domains, failed count
  let minTime = Infinity;
  let maxTime = -Infinity;
  let totalSize = 0;
  let failedCount = 0;
  const domainSet = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (i % 500 === 0 && i > 0) {
      await yieldToMain();
    }

    // Default missing sub-objects if incomplete
    if (!entry.request) {
      entry.request = {
        method: "GET",
        url: "",
        httpVersion: "HTTP/1.1",
        cookies: [],
        headers: [],
        queryString: [],
        headersSize: 0,
        bodySize: 0,
      };
    }
    if (!entry.response) {
      entry.response = {
        status: 0,
        statusText: "",
        httpVersion: "HTTP/1.1",
        cookies: [],
        headers: [],
        content: { size: 0, mimeType: "" },
        redirectURL: "",
        headersSize: 0,
        bodySize: 0,
      };
    }
    if (!entry.timings) {
      entry.timings = { send: 0, wait: 0, receive: 0 };
    }

    if (entry.startedDateTime) {
      const t = new Date(entry.startedDateTime).getTime();
      if (!isNaN(t)) {
        if (t < minTime) minTime = t;
        const totalDuration = entry.time || 0;
        const end = t + totalDuration;
        if (end > maxTime) maxTime = end;
      }
    }

    if (entry.request.url) {
      const domain = extractDomain(entry.request.url);
      if (domain) domainSet.add(domain);
    }

    const respSize = entry.response.content?.size || entry.response.bodySize || 0;
    const reqSize = entry.request.bodySize || 0;
    totalSize += Math.max(0, respSize) + Math.max(0, reqSize);

    if (entry.response.status >= 400 || entry.response.status === 0) {
      failedCount++;
    }
  }

  // Determine primary source domain
  let sourceDomain = "Local capture";
  if (domainSet.size > 0) {
    // Pick the most common domain or first
    sourceDomain = Array.from(domainSet)[0];
  }

  const timeRange =
    minTime !== Infinity && maxTime !== -Infinity
      ? {
          start: new Date(minTime).toISOString(),
          end: new Date(maxTime).toISOString(),
        }
      : null;

  onProgress?.({
    stage: "ready",
    progress: 100,
    message: "Inspection ready.",
  });

  return {
    file: harObj as HarFile,
    entryCount,
    pageCount,
    creator,
    sourceDomain,
    timeRange,
    totalSize,
    failedCount,
    domains: Array.from(domainSet).sort(),
  };
}
