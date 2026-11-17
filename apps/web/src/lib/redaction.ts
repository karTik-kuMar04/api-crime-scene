const SENSITIVE_HEADER_PATTERNS = [
  /^authorization$/i,
  /^cookie$/i,
  /^set-cookie$/i,
  /^x-api-key$/i,
  /^api-key$/i,
  /^x-auth-token$/i,
  /^x-access-token$/i,
  /^proxy-authorization$/i,
  /^token$/i,
  /^secret$/i,
  /^private-token$/i,
];

const SENSITIVE_COOKIE_PATTERNS = [
  /session/i,
  /token/i,
  /auth/i,
  /jwt/i,
  /key/i,
  /secret/i,
  /sid/i,
  /id$/i,
];

export function isSensitiveHeader(name: string): boolean {
  return SENSITIVE_HEADER_PATTERNS.some((pattern) => pattern.test(name.trim()));
}

export function isSensitiveCookie(name: string): boolean {
  return SENSITIVE_COOKIE_PATTERNS.some((pattern) => pattern.test(name.trim()));
}

export function isSensitiveQueryParam(name: string): boolean {
  return SENSITIVE_COOKIE_PATTERNS.some((pattern) => pattern.test(name.trim()));
}
