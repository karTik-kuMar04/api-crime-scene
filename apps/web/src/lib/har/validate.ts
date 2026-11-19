import type { HarFile } from "./types";
import { HarImportError } from "./json-error";

export type HarValidationOk = { ok: true; har: HarFile };
export type HarValidationErr = { ok: false; error: HarImportError };

export function validateHarDocument(value: unknown): HarValidationOk | HarValidationErr {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false,
      error: new HarImportError("not-har", "This JSON is not a HAR file: it has no log object."),
    };
  }

  const root = value as { log?: unknown };
  if (root.log === null || typeof root.log !== "object" || Array.isArray(root.log)) {
    return {
      ok: false,
      error: new HarImportError("not-har", "This JSON is not a HAR file: it has no log object."),
    };
  }

  const log = root.log as { entries?: unknown };
  if (!Array.isArray(log.entries)) {
    return {
      ok: false,
      error: new HarImportError(
        "not-har",
        "This JSON is not a HAR file: log.entries is not an array."
      ),
    };
  }

  if (log.entries.length === 0) {
    return {
      ok: false,
      error: new HarImportError("empty-har", "This HAR contains no requests."),
    };
  }

  return { ok: true, har: value as HarFile };
}

export function isImportableExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".har") || lower.endsWith(".json");
}

export function malformedEntryReason(entry: unknown, index: number): string | null {
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return `Entry ${index} is not an object.`;
  }
  const rec = entry as { request?: unknown; response?: unknown };
  if (rec.request === null || typeof rec.request !== "object" || Array.isArray(rec.request)) {
    return `Entry ${index} is missing request.`;
  }
  const request = rec.request as { url?: unknown };
  if (typeof request.url !== "string" || request.url.length === 0) {
    return `Entry ${index} is missing request.url.`;
  }
  if (rec.response === undefined) {
    return `Entry ${index} is missing response.`;
  }
  return null;
}
