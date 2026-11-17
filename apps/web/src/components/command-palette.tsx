"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  CloseIcon,
  OverviewIcon,
  InvestigationsIcon,
  CompareIcon,
  RequestExplorerIcon,
  ReportsIcon,
  SettingsIcon,
  FileHarIcon,
  PacketIcon,
} from "./icons";
import { getInvestigations } from "@/lib/storage";
import type { Investigation } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  category: "Navigation" | "Investigations" | "Exhibits";
  subtitle?: string;
  href: string;
  icon: typeof OverviewIcon;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Load investigations when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      getInvestigations()
        .then(setInvestigations)
        .catch(() => setInvestigations([]));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const navItems: PaletteItem[] = [
    { id: "nav-overview", title: "Overview", category: "Navigation", subtitle: "Forensics desk dashboard", href: "/", icon: OverviewIcon },
    { id: "nav-investigations", title: "Investigations", category: "Navigation", subtitle: "Saved forensic case files", href: "/investigations", icon: InvestigationsIcon },
    { id: "nav-import", title: "New investigation / Import HAR", category: "Navigation", subtitle: "Parse browser network recording", href: "/new-investigation", icon: FileHarIcon },
    { id: "nav-compare", title: "Compare Sessions", category: "Navigation", subtitle: "Diff two network recordings", href: "/compare", icon: CompareIcon },
    { id: "nav-explorer", title: "Request Explorer", category: "Navigation", subtitle: "Inspect exhibits, headers & timing", href: "/request-explorer", icon: RequestExplorerIcon },
    { id: "nav-reports", title: "Reports", category: "Navigation", subtitle: "Generated forensics records", href: "/reports", icon: ReportsIcon },
    { id: "nav-settings", title: "Settings", category: "Navigation", subtitle: "Theme & local data preferences", href: "/settings", icon: SettingsIcon },
  ];

  const invItems: PaletteItem[] = investigations.map((inv) => ({
    id: `inv-${inv.id}`,
    title: inv.name,
    category: "Investigations",
    subtitle: `${inv.source} · ${inv.entryCount.toLocaleString()} exhibits`,
    href: `/request-explorer?id=${inv.id}`,
    icon: InvestigationsIcon,
  }));

  // Build exhibit items from first investigation if available
  const exhibitItems: PaletteItem[] = [];
  if (investigations.length > 0 && investigations[0].har?.log?.entries) {
    const topInv = investigations[0];
    const topEntries = topInv.har.log.entries.slice(0, 15);
    topEntries.forEach((entry, idx) => {
      const exId = `EX-${String(idx + 1).padStart(4, "0")}`;
      const method = entry.request?.method || "GET";
      const url = entry.request?.url || "";
      exhibitItems.push({
        id: `ex-${topInv.id}-${idx}`,
        title: `${exId} ${method}`,
        category: "Exhibits",
        subtitle: url,
        href: `/request-explorer?id=${topInv.id}&exhibit=${idx}`,
        icon: PacketIcon,
      });
    });
  }

  const allItems = [...navItems, ...invItems, ...exhibitItems];

  const filteredItems = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
    : navItems;

  const handleSelect = (item: PaletteItem) => {
    onClose();
    startTransition(() => {
      router.push(item.href);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl border border-line bg-surface-1 shadow-2xl rounded-panel overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-surface-2">
          <SearchIcon size={16} className="text-text-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page, or search exhibits…"
            className="flex-1 bg-transparent text-14 text-text placeholder-text-3 outline-none font-sans"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-text-3 hover:text-text rounded-control p-1"
            aria-label="Close command palette"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-13 text-text-3">
              No matching commands or exhibits found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconCmp = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={[
                    "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors duration-150",
                    isSelected ? "bg-surface-3 text-text" : "text-text-2 hover:bg-surface-2",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "p-1.5 rounded-control shrink-0",
                      isSelected ? "bg-accent-soft text-accent" : "text-text-3",
                    ].join(" ")}
                  >
                    <IconCmp size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-14 font-medium truncate text-text">
                        {item.title}
                      </span>
                      <span className="font-mono text-11 uppercase tracking-wider text-text-3 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-12 font-mono text-text-3 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard shortcut footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-line bg-surface-1 text-11 font-mono text-text-3">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>API Crime Scene</span>
        </div>
      </div>
    </div>
  );
}
