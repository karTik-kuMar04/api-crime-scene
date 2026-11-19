import type { AnalysisThresholds } from "./types";

export const DEFAULT_THRESHOLDS: AnalysisThresholds = {
  slowMediumMs: 1000,
  slowHighMs: 3000,
  largeLowBytes: 1 * 1024 * 1024,
  largeMediumBytes: 5 * 1024 * 1024,
  redirectChainHops: 3,
};

export function parseThresholds(input: unknown): AnalysisThresholds {
  if (!input || typeof input !== "object") return { ...DEFAULT_THRESHOLDS };
  const rec = input as Record<string, unknown>;
  const next = { ...DEFAULT_THRESHOLDS };
  const keys = Object.keys(DEFAULT_THRESHOLDS) as Array<keyof AnalysisThresholds>;
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      next[key] = value;
    }
  }
  return next;
}

export function thresholdsEqual(a: AnalysisThresholds, b: AnalysisThresholds): boolean {
  return (
    a.slowMediumMs === b.slowMediumMs &&
    a.slowHighMs === b.slowHighMs &&
    a.largeLowBytes === b.largeLowBytes &&
    a.largeMediumBytes === b.largeMediumBytes &&
    a.redirectChainHops === b.redirectChainHops
  );
}
