import type { NormalizedEntry } from "../model";
import { RULES } from "./rules";
import { DEFAULT_THRESHOLDS } from "./thresholds";
import type { AnalysisThresholds, Finding } from "./types";

export function analyzeSession(
  sessionId: string,
  entries: readonly NormalizedEntry[],
  thresholds: AnalysisThresholds = DEFAULT_THRESHOLDS
): Finding[] {
  const findings: Finding[] = [];
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const rule of RULES) {
      if (seen.has(rule.id)) continue;
      const result = rule.run(entry, sessionId, thresholds);
      if (result) {
        seen.add(rule.id);
        findings.push(result);
      }
    }
  }
  return findings;
}
