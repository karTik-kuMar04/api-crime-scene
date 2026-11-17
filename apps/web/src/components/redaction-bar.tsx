"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

interface RedactionBarProps {
  value: string;
  isSensitive?: boolean;
  className?: string;
}

export function RedactionBar({
  value,
  isSensitive = true,
  className = "",
}: RedactionBarProps) {
  const [revealed, setRevealed] = useState(false);

  if (!isSensitive) {
    return (
      <span className={`font-mono text-12 text-text break-all select-all ${className}`}>
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 max-w-full ${className}`}>
      {revealed ? (
        <span className="font-mono text-12 text-text break-all bg-surface-3 px-1.5 py-0.5 rounded-control select-all">
          {value}
        </span>
      ) : (
        <span
          className="inline-block h-3.5 bg-line-strong rounded-control select-none opacity-90 transition-opacity hover:opacity-100"
          style={{ width: `${Math.min(Math.max(value.length * 7, 72), 260)}px` }}
          aria-label="Redacted sensitive value"
          title="Redacted for privacy (click Reveal to view)"
        />
      )}

      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 text-11 font-mono text-text-3 hover:text-accent hover:bg-accent-soft transition-colors duration-150"
        title={revealed ? "Mask sensitive value" : "Reveal sensitive value"}
        aria-label={revealed ? "Mask sensitive value" : "Reveal sensitive value"}
      >
        {revealed ? (
          <>
            <EyeOffIcon size={12} />
            <span className="text-11 uppercase tracking-wider">Mask</span>
          </>
        ) : (
          <>
            <EyeIcon size={12} />
            <span className="text-11 uppercase tracking-wider">Reveal</span>
          </>
        )}
      </button>
    </span>
  );
}
