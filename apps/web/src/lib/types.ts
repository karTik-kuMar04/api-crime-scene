/**
 * HAR types following the HAR 1.2 specification.
 */

export interface HarLog {
  version: string;
  creator: HarCreator;
  browser?: HarCreator;
  pages?: HarPage[];
  entries: HarEntry[];
  comment?: string;
}

export interface HarCreator {
  name: string;
  version: string;
  comment?: string;
}

export interface HarPage {
  startedDateTime: string;
  id: string;
  title: string;
  pageTimings: {
    onContentLoad?: number;
    onLoad?: number;
    comment?: string;
  };
  comment?: string;
}

export interface HarEntry {
  pageref?: string;
  startedDateTime: string;
  time: number;
  request: HarRequest;
  response: HarResponse;
  cache: Record<string, unknown>;
  timings: HarTimings;
  serverIPAddress?: string;
  connection?: string;
  comment?: string;
}

export interface HarRequest {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HarCookie[];
  headers: HarHeader[];
  queryString: HarQueryParam[];
  postData?: HarPostData;
  headersSize: number;
  bodySize: number;
  comment?: string;
}

export interface HarResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HarCookie[];
  headers: HarHeader[];
  content: HarContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  comment?: string;
}

export interface HarHeader {
  name: string;
  value: string;
  comment?: string;
}

export interface HarCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  comment?: string;
}

export interface HarQueryParam {
  name: string;
  value: string;
  comment?: string;
}

export interface HarPostData {
  mimeType: string;
  params?: Array<{
    name: string;
    value?: string;
    fileName?: string;
    contentType?: string;
    comment?: string;
  }>;
  text: string;
  comment?: string;
}

export interface HarContent {
  size: number;
  compression?: number;
  mimeType: string;
  text?: string;
  encoding?: string;
  comment?: string;
}

export interface HarTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
  comment?: string;
}

export interface HarFile {
  log: HarLog;
}

/* ------------------------------------------------------------------ */
/* Investigation domain types                                          */
/* ------------------------------------------------------------------ */

export type InvestigationStatus = "open" | "closed";

export interface Investigation {
  id: string;
  name: string;
  source: string;
  status: InvestigationStatus;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
  pageCount: number;
  creator: string;
  timeRange: { start: string; end: string } | null;
  har: HarFile;
}

export interface Report {
  id: string;
  investigationId: string;
  investigationName: string;
  createdAt: string;
  summary: string;
}
