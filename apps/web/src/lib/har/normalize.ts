import type { HarCookie, HarEntry, HarFile, HarNameValue, HarTimings } from "./types";
import {
  type CookieRecord,
  type EntryDetail,
  type NameValue,
  type NormalizeResult,
  type NormalizedEntry,
  type RequestPayload,
  type ResponsePayload,
  type SizeColumnSource,
  type SkippedEntry,
  type TimingPhases,
  firstByName,
  formatExhibitId,
  recordedOrNull,
} from "./model";
import { inferResourceType, normalizeReportedResourceType } from "./resource-type";
import { malformedEntryReason } from "./validate";

const TEXT_LIKE = (mime: string): boolean => {
  const m = mime.toLowerCase().split(";")[0].trim();
  if (m.startsWith("text/")) return true;
  if (m === "application/json" || m.endsWith("+json")) return true;
  if (m.endsWith("+xml") || m === "application/xml" || m === "text/xml") return true;
  if (m.includes("javascript") || m.includes("ecmascript")) return true;
  if (m === "application/x-www-form-urlencoded") return true;
  return false;
};

function asNameValues(list: HarNameValue[] | undefined): NameValue[] {
  if (!Array.isArray(list)) return [];
  const out: NameValue[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    out.push({
      name: typeof item.name === "string" ? item.name : "",
      value: typeof item.value === "string" ? item.value : "",
    });
  }
  return out;
}

function asCookies(list: HarCookie[] | undefined): CookieRecord[] {
  if (!Array.isArray(list)) return [];
  const out: CookieRecord[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    out.push({
      name: typeof item.name === "string" ? item.name : "",
      value: typeof item.value === "string" ? item.value : "",
      path: typeof item.path === "string" ? item.path : null,
      domain: typeof item.domain === "string" ? item.domain : null,
      expires: typeof item.expires === "string" ? item.expires : null,
      httpOnly: typeof item.httpOnly === "boolean" ? item.httpOnly : null,
      secure: typeof item.secure === "boolean" ? item.secure : null,
    });
  }
  return out;
}

function parseIso(value: string | undefined): { iso: string; ms: number } | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return { iso: new Date(ms).toISOString(), ms };
}

function parseUrlParts(url: string): {
  domain: string | null;
  path: string;
  scheme: string | null;
} {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(/:$/, "");
    const httpLike = scheme === "http" || scheme === "https" || scheme === "ws" || scheme === "wss";
    return {
      domain: httpLike ? parsed.hostname || null : null,
      path: `${parsed.pathname}${parsed.search}`,
      scheme,
    };
  } catch {
    return { domain: null, path: url, scheme: null };
  }
}

function decodeBase64Utf8(text: string): string | null {
  try {
    if (typeof atob === "function") {
      const binary = atob(text);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    }
    return Buffer.from(text, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function parseUrlEncoded(text: string): NameValue[] {
  const pairs: NameValue[] = [];
  const chunks = text.split("&");
  for (const chunk of chunks) {
    if (!chunk) continue;
    const eq = chunk.indexOf("=");
    const rawName = eq === -1 ? chunk : chunk.slice(0, eq);
    const rawValue = eq === -1 ? "" : chunk.slice(eq + 1);
    let name: string;
    let value: string;

    try {
      name = decodeURIComponent(rawName.replace(/\+/g, " "));
    } catch {
      name = rawName;
    }

    try {
      value = decodeURIComponent(rawValue.replace(/\+/g, " "));
    } catch {
      value = rawValue;
    }

    pairs.push({ name, value });
  }
  return pairs;
}

function timingValue(value: number | undefined): number | null {
  return recordedOrNull(value);
}

function buildTimings(raw: HarTimings | undefined): TimingPhases {
  return {
    blocked: timingValue(raw?.blocked),
    blockedQueueing: timingValue(raw?._blocked_queueing),
    dns: timingValue(raw?.dns),
    connect: timingValue(raw?.connect),
    ssl: timingValue(raw?.ssl),
    send: timingValue(raw?.send),
    wait: timingValue(raw?.wait),
    receive: timingValue(raw?.receive),
  };
}

function sumPhases(timings: TimingPhases): number | null {
  const parts = [
    timings.blocked,
    timings.dns,
    timings.connect,
    timings.send,
    timings.wait,
    timings.receive,
  ];
  let any = false;
  let sum = 0;
  for (const part of parts) {
    if (part === null) continue;
    if (part < 0) continue;
    any = true;
    sum += part;
  }
  if (!any && timings.blockedQueueing !== null && timings.blockedQueueing >= 0) {
    return timings.blockedQueueing;
  }
  return any ? sum : null;
}

function durationMs(entry: HarEntry, timings: TimingPhases): number | null {
  const time = recordedOrNull(entry.time);
  if (time !== null && time >= 0) return time;
  return sumPhases(timings);
}

function timingMismatch(entry: HarEntry, timings: TimingPhases): boolean {
  const time = recordedOrNull(entry.time);
  const sum = sumPhases(timings);
  if (time === null || sum === null) return false;
  return Math.abs(time - sum) > 1;
}

function sizes(entry: HarEntry): {
  transferSize: number | null;
  bodySize: number | null;
  contentSize: number | null;
  sizeColumnSource: SizeColumnSource | null;
} {
  const response = entry.response;
  const headersSize = recordedOrNull(response?.headersSize);
  const bodySize = recordedOrNull(response?.bodySize);
  const contentSize = recordedOrNull(response?.content?.size);
  const chromeTransfer = recordedOrNull(entry._transferSize ?? response?._transferSize);

  let transferSize = chromeTransfer;
  if (transferSize === null && headersSize !== null && bodySize !== null) {
    transferSize = headersSize + bodySize;
  }

  const sizeColumnSource: SizeColumnSource | null =
    transferSize !== null ? "transferSize" : contentSize !== null ? "contentSize" : null;

  return { transferSize, bodySize, contentSize, sizeColumnSource };
}

function requestPayload(entry: HarEntry): RequestPayload {
  const post = entry.request?.postData;
  const mimeType = typeof post?.mimeType === "string" ? post.mimeType : null;
  const mime = (mimeType ?? "").toLowerCase();
  const isUrlEncoded = mime.includes("application/x-www-form-urlencoded");
  const isMultipart = mime.includes("multipart/form-data");

  const paramsFromHar: NameValue[] | null = Array.isArray(post?.params)
    ? post.params.map((p) => ({
        name: typeof p.name === "string" ? p.name : "",
        value: typeof p.value === "string" ? p.value : "",
      }))
    : null;

  const text = typeof post?.text === "string" ? post.text : null;

  if (isUrlEncoded) {
    const parsed = text ? parseUrlEncoded(text) : paramsFromHar;
    return { mimeType, text, params: parsed, isUrlEncoded: true, isMultipart: false };
  }

  if (isMultipart) {
    return { mimeType, text, params: paramsFromHar, isUrlEncoded: false, isMultipart: true };
  }

  return { mimeType, text, params: paramsFromHar, isUrlEncoded: false, isMultipart: false };
}

function responsePayload(entry: HarEntry): ResponsePayload {
  const content = entry.response?.content;
  const mimeType = typeof content?.mimeType === "string" ? content.mimeType : null;
  const encoding = typeof content?.encoding === "string" ? content.encoding : null;
  const size = recordedOrNull(content?.size);
  const rawText = content?.text;

  if (rawText === undefined) {
    return { mimeType, text: null, encoding, isBinary: false, captured: false, size };
  }

  const mime = mimeType ?? "";
  if (encoding && encoding.toLowerCase() === "base64") {
    if (!TEXT_LIKE(mime)) {
      return { mimeType, text: null, encoding, isBinary: true, captured: true, size };
    }
    const decoded = decodeBase64Utf8(rawText);
    return {
      mimeType,
      text: decoded,
      encoding,
      isBinary: false,
      captured: true,
      size,
    };
  }

  if (!TEXT_LIKE(mime) && mime.length > 0) {
    return { mimeType, text: null, encoding, isBinary: true, captured: true, size };
  }

  return {
    mimeType,
    text: typeof rawText === "string" ? rawText : null,
    encoding,
    isBinary: false,
    captured: true,
    size,
  };
}

function failureText(entry: HarEntry): string | null {
  const candidates = [
    entry._error,
    entry._errorText,
    entry._failureText,
    entry.response?._error,
    entry.response?._errorText,
    entry.response?._failureText,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function fromCache(value: boolean | string | undefined): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.length > 0;
  return null;
}

function creatorLabel(input: { name?: string; version?: string } | undefined): string | null {
  if (!input) return null;
  const name = input.name?.trim();
  const version = input.version?.trim();
  if (!name && !version) return null;
  return [name, version].filter(Boolean).join(" ");
}

function resolveRedirectUrl(entry: HarEntry, responseHeaders: NameValue[]): string | null {
  const fromField = entry.response?.redirectURL;
  if (typeof fromField === "string" && fromField.trim()) return fromField;
  const location = firstByName(responseHeaders, "Location");
  return location?.value ?? null;
}

function buildRedirectChains(entries: NormalizedEntry[]): void {
  const byPageAndUrl = new Map<string, NormalizedEntry[]>();
  for (const entry of entries) {
    const key = `${entry.pageref ?? ""}::${entry.url}`;
    const list = byPageAndUrl.get(key);
    if (list) list.push(entry);
    else byPageAndUrl.set(key, [entry]);
  }

  for (const entry of entries) {
    if (!entry.redirectUrl) {
      entry.redirectChainLength = 0;
      continue;
    }
    let hops = 1;
    let current: NormalizedEntry | undefined = entry;
    const seen = new Set<string>([entry.id]);
    while (current?.redirectUrl) {
      const page: string = current.pageref ?? "";
      const targetUrl: string = current.redirectUrl;
      const candidates: NormalizedEntry[] = byPageAndUrl.get(`${page}::${targetUrl}`) ?? [];
      const next: NormalizedEntry | undefined = candidates.find(
        (candidate: NormalizedEntry) =>
          candidate.index > current!.index && !seen.has(candidate.id)
      );
      if (!next) break;
      hops += 1;
      seen.add(next.id);
      current = next;
      if (hops > 20) break;
    }
    entry.redirectChainLength = hops;
  }
}

export function normalizeHar(har: HarFile, sessionId: string): NormalizeResult {
  const rawEntries = har.log?.entries ?? [];
  const skipped: SkippedEntry[] = [];
  const kept: Array<{ raw: HarEntry; index: number }> = [];

  for (let i = 0; i < rawEntries.length; i++) {
    const reason = malformedEntryReason(rawEntries[i], i);
    if (reason) {
      skipped.push({ index: i, reason });
      continue;
    }
    kept.push({ raw: rawEntries[i] as HarEntry, index: i });
  }

  const startTimes: Array<number | null> = [];
  let earliest = Infinity;

  const entries: NormalizedEntry[] = [];
  const details = new Map<string, EntryDetail>();

  for (let exhibit = 0; exhibit < kept.length; exhibit++) {
    const { raw, index } = kept[exhibit];
    const requestHeaders = asNameValues(raw.request?.headers);
    const responseHeaders = asNameValues(raw.response?.headers);
    const queryFromHar = asNameValues(raw.request?.queryString);
    const timings = buildTimings(raw.timings);
    const parsedStart = parseIso(raw.startedDateTime);
    startTimes.push(parsedStart?.ms ?? null);
    if (parsedStart && parsedStart.ms < earliest) earliest = parsedStart.ms;

    const url = raw.request?.url ?? "";
    const parts = parseUrlParts(url);
    const mimeType = raw.response?.content?.mimeType ?? "";
    const reported = normalizeReportedResourceType(raw._resourceType);
    const resourceType = reported ?? inferResourceType(mimeType, url);
    const resourceTypeSource = reported ? "reported" : "inferred";
    const sizeInfo = sizes(raw);
    const statusRaw = raw.response?.status;
    const hasResponse = statusRaw !== undefined && statusRaw !== 0;
    const status = statusRaw === undefined ? null : statusRaw;
    const fail = failureText(raw);
    const duration = durationMs(raw, timings);
    const mismatch = timingMismatch(raw, timings);
    const id = `${sessionId}:${index}`;
    const redirectUrl = resolveRedirectUrl(raw, responseHeaders);

    const entry: NormalizedEntry = {
      id,
      index,
      exhibitId: formatExhibitId(exhibit),
      method: (raw.request?.method ?? "GET").toUpperCase(),
      url,
      domain: parts.domain,
      path: parts.path,
      scheme: parts.scheme,
      status,
      statusText: raw.response?.statusText ?? "",
      hasResponse,
      failureText: fail,
      resourceType,
      resourceTypeSource,
      mimeType,
      durationMs: duration,
      transferSize: sizeInfo.transferSize,
      bodySize: sizeInfo.bodySize,
      contentSize: sizeInfo.contentSize,
      sizeColumnSource: sizeInfo.sizeColumnSource,
      startedAt: parsedStart?.iso ?? null,
      startOffsetMs: null,
      flags: {
        timingMismatch: mismatch,
        failedHttp: hasResponse && typeof status === "number" && status >= 400,
        networkFailure: !hasResponse || Boolean(fail),
      },
      redirectUrl,
      redirectChainLength: redirectUrl ? 1 : 0,
      httpVersion: raw.request?.httpVersion ?? raw.response?.httpVersion ?? null,
      serverIPAddress: raw.serverIPAddress ?? null,
      connection: raw.connection ?? null,
      pageref: raw.pageref ?? null,
      fromCache: fromCache(raw._fromCache),
      priority: raw._priority ?? null,
    };

    const detail: EntryDetail = {
      id,
      requestHeaders,
      responseHeaders,
      requestCookies: asCookies(raw.request?.cookies),
      responseCookies: asCookies(raw.response?.cookies),
      queryString: queryFromHar,
      timings,
      timingTotalMs: duration,
      requestPayload: requestPayload(raw),
      responsePayload: responsePayload(raw),
      cache: raw.cache ?? null,
      initiator: raw._initiator ?? null,
    };

    entries.push(entry);
    details.set(id, detail);
  }

  const origin = earliest === Infinity ? null : earliest;
  for (let i = 0; i < entries.length; i++) {
    const started = startTimes[i];
    entries[i].startOffsetMs = origin === null || started === null ? null : started - origin;
  }

  buildRedirectChains(entries);

  const startedValues = entries
    .map((e) => (e.startedAt ? Date.parse(e.startedAt) : NaN))
    .filter((n) => !Number.isNaN(n));
  const timeSpan =
    startedValues.length > 0
      ? {
          start: new Date(Math.min(...startedValues)).toISOString(),
          end: new Date(Math.max(...startedValues)).toISOString(),
        }
      : null;

  const warnings: string[] = [];
  if (skipped.length > 0) {
    warnings.push(`${skipped.length} entries were skipped because they were incomplete.`);
  }
  const mismatchCount = entries.filter((e) => e.flags.timingMismatch).length;
  if (mismatchCount > 0) {
    warnings.push(`${mismatchCount} requests have timing phases that do not match the recorded total.`);
  }

  return {
    entries,
    details,
    skipped,
    warnings,
    pageCount: Array.isArray(har.log?.pages) ? har.log.pages.length : 0,
    creator: creatorLabel(har.log?.creator),
    browser: creatorLabel(har.log?.browser),
    timeSpan,
  };
}
