import type { ResourceType } from "./model";

const MIME_TABLE: Array<{ test: (mime: string) => boolean; type: ResourceType }> = [
  { test: (m) => m === "text/html" || m === "application/xhtml+xml", type: "document" },
  { test: (m) => m === "text/css", type: "stylesheet" },
  {
    test: (m) =>
      m.includes("javascript") ||
      m.includes("ecmascript") ||
      m === "application/wasm",
    type: "script",
  },
  { test: (m) => m.startsWith("image/"), type: "image" },
  {
    test: (m) =>
      m.startsWith("font/") ||
      m === "application/font-woff" ||
      m === "application/font-woff2" ||
      m === "application/vnd.ms-fontobject" ||
      m === "application/x-font-ttf",
    type: "font",
  },
  {
    test: (m) =>
      m.startsWith("audio/") || m.startsWith("video/") || m === "application/vnd.apple.mpegurl",
    type: "media",
  },
  {
    test: (m) =>
      m.includes("json") ||
      m.endsWith("+xml") ||
      m === "application/xml" ||
      m === "text/xml" ||
      m === "application/x-www-form-urlencoded" ||
      m.startsWith("multipart/"),
    type: "xhr-fetch",
  },
];

const EXTENSION_TABLE: Array<{ ext: string; type: ResourceType }> = [
  { ext: ".html", type: "document" },
  { ext: ".htm", type: "document" },
  { ext: ".css", type: "stylesheet" },
  { ext: ".js", type: "script" },
  { ext: ".mjs", type: "script" },
  { ext: ".ts", type: "script" },
  { ext: ".wasm", type: "script" },
  { ext: ".png", type: "image" },
  { ext: ".jpg", type: "image" },
  { ext: ".jpeg", type: "image" },
  { ext: ".gif", type: "image" },
  { ext: ".webp", type: "image" },
  { ext: ".svg", type: "image" },
  { ext: ".ico", type: "image" },
  { ext: ".avif", type: "image" },
  { ext: ".woff", type: "font" },
  { ext: ".woff2", type: "font" },
  { ext: ".ttf", type: "font" },
  { ext: ".otf", type: "font" },
  { ext: ".eot", type: "font" },
  { ext: ".mp4", type: "media" },
  { ext: ".webm", type: "media" },
  { ext: ".mp3", type: "media" },
  { ext: ".m3u8", type: "media" },
];

const REPORTED_MAP: Record<string, ResourceType> = {
  document: "document",
  main_frame: "document",
  subdocument: "document",
  iframe: "document",
  stylesheet: "stylesheet",
  script: "script",
  image: "image",
  imageset: "image",
  font: "font",
  xhr: "xhr-fetch",
  fetch: "xhr-fetch",
  xmlhttprequest: "xhr-fetch",
  media: "media",
  websocket: "websocket",
  websocketrequest: "websocket",
  ping: "other",
  cspviolationreport: "other",
  other: "other",
};

export function normalizeReportedResourceType(raw: string | undefined | null): ResourceType | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key in REPORTED_MAP) return REPORTED_MAP[key];
  if (key === "xhr_fetch") return "xhr-fetch";
  return null;
}

export function inferResourceType(mimeType: string, url: string): ResourceType {
  const mime = mimeType.toLowerCase().split(";")[0].trim();
  if (mime) {
    for (const row of MIME_TABLE) {
      if (row.test(mime)) return row.type;
    }
  }

  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    /* keep raw */
  }
  const lower = pathname.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  for (const row of EXTENSION_TABLE) {
    if (row.ext === ext) return row.type;
  }
  return "other";
}
