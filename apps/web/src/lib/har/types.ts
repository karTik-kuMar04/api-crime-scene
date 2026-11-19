/**
 * Raw HAR 1.2 types. Every field is optional so real-world captures can be tolerated.
 * Browser extensions (_*) are optional and never required.
 */

export interface HarNameValue {
  name?: string;
  value?: string;
  comment?: string;
}

export interface HarCookie {
  name?: string;
  value?: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  comment?: string;
}

export interface HarPostParam {
  name?: string;
  value?: string;
  fileName?: string;
  contentType?: string;
  comment?: string;
}

export interface HarPostData {
  mimeType?: string;
  params?: HarPostParam[];
  text?: string;
  comment?: string;
}

export interface HarContent {
  size?: number;
  compression?: number;
  mimeType?: string;
  text?: string;
  encoding?: string;
  comment?: string;
}

export interface HarTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  wait?: number;
  receive?: number;
  ssl?: number;
  comment?: string;
  _blocked_queueing?: number;
}

export interface HarCacheState {
  expires?: string;
  lastAccess?: string;
  eTag?: string;
  hitCount?: number;
  comment?: string;
}

export interface HarCache {
  beforeRequest?: HarCacheState | null;
  afterRequest?: HarCacheState | null;
  comment?: string;
}

export interface HarCreator {
  name?: string;
  version?: string;
  comment?: string;
}

export interface HarPage {
  startedDateTime?: string;
  id?: string;
  title?: string;
  pageTimings?: {
    onContentLoad?: number;
    onLoad?: number;
    comment?: string;
  };
  comment?: string;
}

export interface HarRequest {
  method?: string;
  url?: string;
  httpVersion?: string;
  cookies?: HarCookie[];
  headers?: HarNameValue[];
  queryString?: HarNameValue[];
  postData?: HarPostData;
  headersSize?: number;
  bodySize?: number;
  comment?: string;
}

export interface HarResponse {
  status?: number;
  statusText?: string;
  httpVersion?: string;
  cookies?: HarCookie[];
  headers?: HarNameValue[];
  content?: HarContent;
  redirectURL?: string;
  headersSize?: number;
  bodySize?: number;
  comment?: string;
  _transferSize?: number;
  _error?: string;
  _errorText?: string;
  _failureText?: string;
}

export interface HarEntry {
  pageref?: string;
  startedDateTime?: string;
  time?: number;
  request?: HarRequest;
  response?: HarResponse;
  cache?: HarCache;
  timings?: HarTimings;
  serverIPAddress?: string;
  connection?: string;
  comment?: string;
  _initiator?: unknown;
  _priority?: string;
  _fromCache?: boolean | string;
  _resourceType?: string;
  _error?: string;
  _errorText?: string;
  _failureText?: string;
  _transferSize?: number;
}

export interface HarLog {
  version?: string;
  creator?: HarCreator;
  browser?: HarCreator;
  pages?: HarPage[];
  entries?: HarEntry[];
  comment?: string;
}

export interface HarFile {
  log?: HarLog;
}
