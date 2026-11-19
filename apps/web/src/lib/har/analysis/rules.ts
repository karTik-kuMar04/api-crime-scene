import type { NormalizedEntry } from "../model";
import type { AnalysisThresholds, Finding, RuleId } from "./types";

type RuleFn = (
  entry: NormalizedEntry,
  sessionId: string,
  thresholds: AnalysisThresholds
) => Finding | null;

function finding(
  entry: NormalizedEntry,
  sessionId: string,
  ruleId: RuleId,
  rest: Omit<Finding, "id" | "sessionId" | "entryId" | "exhibitId" | "ruleId">
): Finding {
  return {
    id: `${entry.id}:${ruleId}`,
    sessionId,
    entryId: entry.id,
    exhibitId: entry.exhibitId,
    ruleId,
    ...rest,
  };
}

const http4xx: RuleFn = (entry, sessionId) => {
  if (!entry.hasResponse || entry.status === null) return null;
  if (entry.status < 400 || entry.status > 499) return null;
  return finding(entry, sessionId, "http-4xx", {
    category: "http-error",
    severity: "medium",
    kind: "observation",
    title: "Client error response",
    observed: `Status ${entry.status}`,
    measured: { metric: "status", value: entry.status },
    reason: "The response status is in the 400–499 range.",
  });
};

const http5xx: RuleFn = (entry, sessionId) => {
  if (!entry.hasResponse || entry.status === null) return null;
  if (entry.status < 500 || entry.status > 599) return null;
  return finding(entry, sessionId, "http-5xx", {
    category: "http-error",
    severity: "high",
    kind: "observation",
    title: "Server error response",
    observed: `Status ${entry.status}`,
    measured: { metric: "status", value: entry.status },
    reason: "The response status is in the 500–599 range.",
  });
};

const networkFailure: RuleFn = (entry, sessionId) => {
  if (entry.hasResponse && !entry.failureText) return null;
  return finding(entry, sessionId, "network-failure", {
    category: "network-failure",
    severity: "high",
    kind: "observation",
    title: "No HTTP response",
    observed: entry.failureText ? "Browser-reported failure" : "Status 0 or missing response",
    measured: { metric: "hasResponse", value: entry.hasResponse ? 1 : 0 },
    reason: "The entry has no HTTP response, or the browser recorded a failure.",
  });
};

const slowRequest: RuleFn = (entry, sessionId, thresholds) => {
  if (entry.durationMs === null) return null;
  if (entry.durationMs < thresholds.slowMediumMs) return null;
  const high = entry.durationMs >= thresholds.slowHighMs;
  return finding(entry, sessionId, "slow-request", {
    category: "performance",
    severity: high ? "high" : "medium",
    kind: "potential-issue",
    title: "Slow request",
    observed: `${Math.round(entry.durationMs)} ms duration`,
    measured: {
      metric: "durationMs",
      value: entry.durationMs,
      unit: "ms",
      threshold: high ? thresholds.slowHighMs : thresholds.slowMediumMs,
    },
    reason: high
      ? `Duration is at or above the ${thresholds.slowHighMs} ms high threshold.`
      : `Duration is at or above the ${thresholds.slowMediumMs} ms medium threshold.`,
    caveat: "A slow request may be expected for large or remote resources.",
  });
};

const largeResponse: RuleFn = (entry, sessionId, thresholds) => {
  const size = entry.transferSize ?? entry.contentSize;
  if (size === null) return null;
  if (size < thresholds.largeLowBytes) return null;
  const medium = size >= thresholds.largeMediumBytes;
  return finding(entry, sessionId, "large-response", {
    category: "payload-size",
    severity: medium ? "medium" : "low",
    kind: "potential-issue",
    title: "Large response",
    observed: `${size} bytes transferred or content`,
    measured: {
      metric: entry.transferSize !== null ? "transferSize" : "contentSize",
      value: size,
      unit: "bytes",
      threshold: medium ? thresholds.largeMediumBytes : thresholds.largeLowBytes,
    },
    reason: medium
      ? `Size is at or above the ${thresholds.largeMediumBytes} byte medium threshold.`
      : `Size is at or above the ${thresholds.largeLowBytes} byte low threshold.`,
  });
};

const redirect: RuleFn = (entry, sessionId, thresholds) => {
  const isRedirect =
    entry.hasResponse &&
    entry.status !== null &&
    entry.status >= 300 &&
    entry.status < 400 &&
    Boolean(entry.redirectUrl);
  if (!isRedirect) return null;
  const chain = entry.redirectChainLength >= thresholds.redirectChainHops;
  if (chain) {
    return finding(entry, sessionId, "redirect", {
      category: "redirect",
      severity: "low",
      kind: "potential-issue",
      title: "Redirect chain",
      observed: `${entry.redirectChainLength} hops`,
      measured: {
        metric: "redirectChainLength",
        value: entry.redirectChainLength,
        threshold: thresholds.redirectChainHops,
      },
      reason: `The redirect chain is at or above ${thresholds.redirectChainHops} hops.`,
    });
  }
  return finding(entry, sessionId, "redirect", {
    category: "redirect",
    severity: "info",
    kind: "observation",
    title: "Redirect",
    observed: `Status ${entry.status}`,
    measured: { metric: "status", value: entry.status },
    reason: "The response is a 3xx with a Location or redirect URL.",
  });
};

export const RULES: Array<{ id: RuleId; run: RuleFn }> = [
  { id: "http-4xx", run: http4xx },
  { id: "http-5xx", run: http5xx },
  { id: "network-failure", run: networkFailure },
  { id: "slow-request", run: slowRequest },
  { id: "large-response", run: largeResponse },
  { id: "redirect", run: redirect },
];
