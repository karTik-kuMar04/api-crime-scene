export interface JsonParseLocation {
  line: number | null;
  column: number | null;
}

export class HarImportError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HarImportError";
    this.code = code;
  }
}

export function locationFromJsonError(text: string, error: unknown): JsonParseLocation {
  const message = error instanceof Error ? error.message : "";
  const lineCol = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineCol) {
    return { line: Number(lineCol[1]), column: Number(lineCol[2]) };
  }
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return { line: null, column: null };
  return offsetToLineColumn(text, Number(positionMatch[1]));
}

export function offsetToLineColumn(text: string, offset: number): JsonParseLocation {
  let line = 1;
  let column = 1;
  const limit = Math.min(Math.max(offset, 0), text.length);
  for (let i = 0; i < limit; i++) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

export function invalidJsonMessage(location: JsonParseLocation): string {
  if (location.line !== null && location.column !== null) {
    return `Invalid JSON at line ${location.line}, column ${location.column}.`;
  }
  return "Invalid JSON.";
}
