/**
 * System font stack fallback when build environment is offline
 * or font CDN download fails (as required by specification).
 *
 * Spec:
 * - UI: Instrument Sans (400, 500, 600) with system sans fallback
 * - Headlines: Instrument Serif (regular) with Georgia/Times fallback
 * - Data/IDs: JetBrains Mono with system monospace fallback
 */

export const instrumentSans = {
  variable: "font-sans-var",
};

export const instrumentSerif = {
  variable: "font-serif-var",
};

export const jetbrainsMono = {
  variable: "font-mono-var",
};
