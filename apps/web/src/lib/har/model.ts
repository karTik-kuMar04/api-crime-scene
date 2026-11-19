export type NameValue = {
  name: string;
  value: string;
};

export type CookieRecord = NameValue & {
  path: string | null;
  domain: string | null;
  expires: string | null;
  httpOnly: boolean | null;
  secure: boolean | null;
};

export type ResourceType =
  | "document"
  | "stylesheet"
  | "script"
  | "image"
  | "font"
  | "xhr-fetch"
  | "media"
  | "websocket"
  | "other";

export type ResourceTypeSource = "reported" | "inferred";

export type SizeColumnSource = "transferSize" | "contentSize";

export interface EntryFlags {
  timingMismatch: boolean;
  failedHttp: boolean;
  networkFailure: boolean;
}

export interface TimingPhases {
  blocked: number | null;
  blockedQueueing: number | null;
  dns: number | null;
  connect: number | null;
  ssl: number | null;
  send: number | null;
  wait: number | null;
  receive: number | null;
}

export interface RequestPayload {
  mimeType: string | null;
  text: string | null;
  params: NameValue[] | null;
  isUrlEncoded: boolean;
  isMultipart: boolean;
}

export interface ResponsePayload {
  mimeType: string | null;
  text: string | null;
  encoding: string | null;
  isBinary: boolean;
  captured: boolean;
  size: number | null;
}

export interface NormalizedEntry {
  id: string;
  index: number;
  exhibitId: string;
  method: string;
  url: string;
  domain: string | null;
  path: string;
  scheme: string | null;
  status: number | null;
  statusText: string;
  hasResponse: boolean;
  failureText: string | null;
  resourceType: ResourceType;
  resourceTypeSource: ResourceTypeSource;
  mimeType: string;
  durationMs: number | null;
  transferSize: number | null;
  bodySize: number | null;
  contentSize: number | null;
  sizeColumnSource: SizeColumnSource | null;
  startedAt: string | null;
  startOffsetMs: number | null;
  flags: EntryFlags;
  redirectUrl: string | null;
  redirectChainLength: number;
  httpVersion: string | null;
  serverIPAddress: string | null;
  connection: string | null;
  pageref: string | null;
  fromCache: boolean | null;
  priority: string | null;
}

export interface EntryDetail {
  id: string;
  requestHeaders: NameValue[];
  responseHeaders: NameValue[];
  requestCookies: CookieRecord[];
  responseCookies: CookieRecord[];
  queryString: NameValue[];
  timings: TimingPhases;
  timingTotalMs: number | null;
  requestPayload: RequestPayload;
  responsePayload: ResponsePayload;
  cache: unknown | null;
  initiator: unknown | null;
}

export interface SkippedEntry {
  index: number;
  reason: string;
}

export interface SessionMeta {
  id: string;
  name: string;
  sourceFileName: string;
  fileSizeBytes: number;
  fileHash: string;
  importedAt: string;
  entryCount: number;
  pageCount: number;
  creator: string | null;
  browser: string | null;
  timeSpan: { start: string; end: string } | null;
  warnings: string[];
  skipped: SkippedEntry[];
}

export interface NormalizeResult {
  entries: NormalizedEntry[];
  details: Map<string, EntryDetail>;
  skipped: SkippedEntry[];
  warnings: string[];
  pageCount: number;
  creator: string | null;
  browser: string | null;
  timeSpan: { start: string; end: string } | null;
}

export function formatExhibitId(index: number): string {
  return `EX-${String(index + 1).padStart(4, "0")}`;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "Not recorded";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${i === 0 ? value : value.toFixed(1)} ${sizes[i]}`;
}

export function findByName(list: readonly NameValue[], name: string): NameValue[] {
  const target = name.toLowerCase();
  const matches: NameValue[] = [];
  for (const item of list) {
    if (item.name.toLowerCase() === target) matches.push(item);
  }
  return matches;
}

export function firstByName(list: readonly NameValue[], name: string): NameValue | undefined {
  const target = name.toLowerCase();
  for (const item of list) {
    if (item.name.toLowerCase() === target) return item;
  }
  return undefined;
}

export function recordedOrNull(value: number | undefined | null): number | null {
  if (value === undefined || value === null || value === -1) return null;
  return value;
}
