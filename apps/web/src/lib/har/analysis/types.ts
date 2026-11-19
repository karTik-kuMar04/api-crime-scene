export type FindingCategory =
  | "http-error"
  | "network-failure"
  | "performance"
  | "payload-size"
  | "redirect";

export type FindingSeverity = "info" | "low" | "medium" | "high";

export type FindingKind = "observation" | "potential-issue";

export type RuleId =
  | "http-4xx"
  | "http-5xx"
  | "network-failure"
  | "slow-request"
  | "large-response"
  | "redirect";

export interface FindingMeasured {
  metric: string;
  value: number | string | null;
  unit?: string;
  threshold?: number;
}

export interface Finding {
  id: string;
  sessionId: string;
  entryId: string;
  exhibitId: string;
  ruleId: RuleId;
  category: FindingCategory;
  severity: FindingSeverity;
  kind: FindingKind;
  title: string;
  observed: string;
  measured: FindingMeasured;
  reason: string;
  caveat?: string;
}

export interface AnalysisThresholds {
  slowMediumMs: number;
  slowHighMs: number;
  largeLowBytes: number;
  largeMediumBytes: number;
  redirectChainHops: number;
}
