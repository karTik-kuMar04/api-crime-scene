import { REDACTED_PLACEHOLDER } from "./config";
import type { CookieRecord, EntryDetail, NameValue, NormalizedEntry } from "./model";

const SENSITIVE_HEADER_EXACT = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
  "x-csrf-token",
  "x-xsrf-token",
]);

const SENSITIVE_HEADER_FRAGMENTS = ["token", "secret", "password", "api-key", "apikey"];

const SENSITIVE_PARAM_EXACT = new Set([
  "access_token",
  "id_token",
  "refresh_token",
  "token",
  "api_key",
  "apikey",
  "key",
  "secret",
  "client_secret",
  "password",
  "passwd",
  "pwd",
  "sig",
  "signature",
  "session",
  "sessionid",
  "code",
]);

const JWT_SHAPE = /^(?:[A-Za-z0-9_-]+\.){2}[A-Za-z0-9_-]+$/;
const JWT_IN_TEXT = /(?:[A-Za-z0-9_-]+\.){2}[A-Za-z0-9_-]+/g;
const BEARER_IN_TEXT = /Bearer\s+\S+/gi;

export interface SanitizeOptions {
  extraNames?: string[];
  redactAllBodies?: boolean;
  redactAllQueryValues?: boolean;
}

export function isSensitiveHeader(name: string, extraNames: string[] = []): boolean {
  const lower = name.trim().toLowerCase();
  if (SENSITIVE_HEADER_EXACT.has(lower)) return true;
  if (extraNames.some((n) => n.trim().toLowerCase() === lower)) return true;
  return SENSITIVE_HEADER_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

export function isSensitiveParam(name: string, extraNames: string[] = []): boolean {
  const lower = name.trim().toLowerCase();
  if (SENSITIVE_PARAM_EXACT.has(lower)) return true;
  return extraNames.some((n) => n.trim().toLowerCase() === lower);
}

export function isJwtShaped(value: string): boolean {
  return JWT_SHAPE.test(value.trim());
}

function extraList(options?: SanitizeOptions): string[] {
  return options?.extraNames ?? [];
}

function redactValue(_value: string): string {
  return REDACTED_PLACEHOLDER;
}

function redactNameValues(
  list: readonly NameValue[],
  options: SanitizeOptions | undefined,
  mode: "header" | "param",
  forceAll = false
): NameValue[] {
  const extra = extraList(options);
  return list.map((item) => {
    const sensitive =
      forceAll ||
      (mode === "header" ? isSensitiveHeader(item.name, extra) : isSensitiveParam(item.name, extra)) ||
      isJwtShaped(item.value) ||
      /^\s*Bearer\s+/i.test(item.value);
    return {
      name: item.name,
      value: sensitive ? redactValue(item.value) : item.value,
    };
  });
}

function redactCookies(list: readonly CookieRecord[], options?: SanitizeOptions): CookieRecord[] {
  const extra = extraList(options);
  return list.map((item) => ({
    ...item,
    value:
      isSensitiveParam(item.name, extra) || isSensitiveHeader("cookie", extra)
        ? redactValue(item.value)
        : item.value,
  }));
}

function redactTextPatterns(text: string): string {
  return text.replace(BEARER_IN_TEXT, REDACTED_PLACEHOLDER).replace(JWT_IN_TEXT, (match) => {
    return JWT_SHAPE.test(match) ? REDACTED_PLACEHOLDER : match;
  });
}

function sanitizeJsonValue(value: unknown, extra: string[]): unknown {
  if (typeof value === "string") {
    if (isJwtShaped(value) || /^\s*Bearer\s+/i.test(value)) return REDACTED_PLACEHOLDER;
    return redactTextPatterns(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item, extra));
  }
  if (value !== null && typeof value === "object") {
    const out = Object.create(null) as Record<string, unknown>;
    for (const key of Object.keys(value as object)) {
      const raw = (value as Record<string, unknown>)[key];
      const next = isSensitiveParam(key, extra) ? REDACTED_PLACEHOLDER : sanitizeJsonValue(raw, extra);
      Object.defineProperty(out, key, {
        value: next,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return out;
  }
  return value;
}

export function sanitizeBodyText(text: string, options?: SanitizeOptions): string {
  if (options?.redactAllBodies) return REDACTED_PLACEHOLDER;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(text) as unknown;
      return JSON.stringify(sanitizeJsonValue(parsed, extraList(options)), null, 2);
    } catch {
      return redactTextPatterns(text);
    }
  }
  return redactTextPatterns(text);
}

export function sanitizeEntry(
  entry: NormalizedEntry,
  detail: EntryDetail,
  options?: SanitizeOptions
): { entry: NormalizedEntry; detail: EntryDetail } {
  const queryString = redactNameValues(
    detail.queryString,
    options,
    "param",
    options?.redactAllQueryValues
  );

  const requestParams = detail.requestPayload.params
    ? redactNameValues(detail.requestPayload.params, options, "param")
    : null;

  let requestText = detail.requestPayload.text;
  if (requestText !== null) {
    requestText = options?.redactAllBodies
      ? REDACTED_PLACEHOLDER
      : sanitizeBodyText(requestText, options);
  }

  let responseText = detail.responsePayload.text;
  if (responseText !== null) {
    responseText = options?.redactAllBodies
      ? REDACTED_PLACEHOLDER
      : sanitizeBodyText(responseText, options);
  }

  const sanitizedDetail: EntryDetail = {
    ...detail,
    requestHeaders: redactNameValues(detail.requestHeaders, options, "header"),
    responseHeaders: redactNameValues(detail.responseHeaders, options, "header"),
    requestCookies: redactCookies(detail.requestCookies, options),
    responseCookies: redactCookies(detail.responseCookies, options),
    queryString,
    requestPayload: {
      ...detail.requestPayload,
      text: requestText,
      params: requestParams,
    },
    responsePayload: {
      ...detail.responsePayload,
      text: responseText,
    },
  };

  return {
    entry: { ...entry },
    detail: sanitizedDetail,
  };
}

export function sanitizeSession(
  entries: readonly NormalizedEntry[],
  details: ReadonlyMap<string, EntryDetail>,
  options?: SanitizeOptions
): { entries: NormalizedEntry[]; details: Map<string, EntryDetail> } {
  const nextEntries: NormalizedEntry[] = [];
  const nextDetails = new Map<string, EntryDetail>();
  for (const entry of entries) {
    const detail = details.get(entry.id);
    if (!detail) {
      nextEntries.push({ ...entry });
      continue;
    }
    const sanitized = sanitizeEntry(entry, detail, options);
    nextEntries.push(sanitized.entry);
    nextDetails.set(entry.id, sanitized.detail);
  }
  return { entries: nextEntries, details: nextDetails };
}

export { REDACTED_PLACEHOLDER };
