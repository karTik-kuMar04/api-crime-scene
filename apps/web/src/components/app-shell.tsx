"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  OverviewIcon,
  InvestigationsIcon,
  CompareIcon,
  RequestExplorerIcon,
  ReportsIcon,
  SettingsIcon,
  SearchIcon,
  CommandIcon,
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
} from "./icons";
import { Logo } from "./brand/logo";
import { ThemeToggle } from "./theme-toggle";
import { CommandPalette } from "./command-palette";

interface NavItem {
  label: string;
  href: string;
  icon: typeof OverviewIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: OverviewIcon },
  { label: "Investigations", href: "/investigations", icon: InvestigationsIcon },
  { label: "Compare Sessions", href: "/compare", icon: CompareIcon },
  { label: "Request Explorer", href: "/request-explorer", icon: RequestExplorerIcon },
  { label: "Reports", href: "/reports", icon: ReportsIcon },
];

interface AppShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, description, actions, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("acs-sidebar-collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("acs-sidebar-collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle global Escape key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-bg text-text flex">
      {/* Mobile scrim / backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface-1 transition-all duration-150 ease-out",
          mobileOpen ? "translate-x-0 w-sidebar" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-sidebar-collapsed" : "lg:w-sidebar",
        ].join(" ")}
      >
        {/* Brand & collapse header */}
        <div
          className={`h-topbar flex items-center border-b border-line ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-control border border-line bg-surface-2 text-text-3 hover:text-text hover:border-line-strong transition-colors duration-150"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRightIcon size={14} />
            </button>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-2.5 overflow-hidden text-text hover:text-accent transition-colors duration-150"
                title="API Crime Scene"
              >
                <Logo size={20} className="shrink-0 text-accent" />
                <span className="font-serif text-16 tracking-tight font-medium whitespace-nowrap">
                  API Crime Scene
                </span>
              </Link>

              {/* Desktop collapse button */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-control border border-line bg-surface-2 text-text-3 hover:text-text hover:border-line-strong transition-colors duration-150"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeftIcon size={14} />
              </button>
            </>
          )}

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-control text-text-3 hover:text-text ml-auto"
            aria-label="Close navigation"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const IconCmp = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={[
                  "group relative flex items-center gap-3 rounded-control px-2.5 py-2 text-14 transition-colors duration-150 ease-out",
                  isActive
                    ? "bg-accent-soft text-text font-medium"
                    : "text-text-2 hover:bg-surface-2 hover:text-text",
                  collapsed && !mobileOpen ? "justify-center px-0" : "",
                ].join(" ")}
              >
                {/* 2px accent bar on left edge when active */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r"
                    aria-hidden
                  />
                )}

                <span
                  className={[
                    "shrink-0",
                    isActive ? "text-accent" : "text-text-3 group-hover:text-text",
                  ].join(" ")}
                >
                  <IconCmp size={18} />
                </span>

                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Local-only workspace block */}
        {(!collapsed || mobileOpen) && (
          <div className="mx-3 mb-3 p-3 rounded-panel border border-line bg-surface-2/60">
            <div className="flex items-center gap-2 text-text-2">
              <LockIcon size={14} className="text-accent shrink-0" />
              <span className="font-mono text-11 uppercase tracking-wider text-text-3 font-medium">
                Local Workspace
              </span>
            </div>
            <p className="mt-1 text-12 text-text-3 leading-snug">
              Processed in this browser. Zero cloud telemetry.
            </p>
          </div>
        )}

        {/* Settings link at bottom */}
        <div className="border-t border-line p-2">
          <Link
            href="/settings"
            title={collapsed && !mobileOpen ? "Settings" : undefined}
            className={[
              "group relative flex items-center gap-3 rounded-control px-2.5 py-2 text-14 transition-colors duration-150 ease-out",
              pathname === "/settings"
                ? "bg-accent-soft text-text font-medium"
                : "text-text-2 hover:bg-surface-2 hover:text-text",
              collapsed && !mobileOpen ? "justify-center px-0" : "",
            ].join(" ")}
          >
            {pathname === "/settings" && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r"
                aria-hidden
              />
            )}
            <span
              className={[
                "shrink-0",
                pathname === "/settings" ? "text-accent" : "text-text-3 group-hover:text-text",
              ].join(" ")}
            >
              <SettingsIcon size={18} />
            </span>
            {(!collapsed || mobileOpen) && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={[
          "flex-1 flex flex-col min-w-0 transition-all duration-150 ease-out",
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar",
        ].join(" ")}
      >
        {/* Topbar: 52px */}
        <header className="sticky top-0 z-30 h-topbar border-b border-line bg-surface-1/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-control border border-line bg-surface-2 text-text-3 hover:text-text"
              aria-label="Open navigation"
            >
              <MenuIcon size={16} />
            </button>

            {/* Breadcrumb or title */}
            <div className="truncate">
              <span className="font-mono text-11 uppercase tracking-wider text-text-3">
                API Crime Scene
              </span>
              {title && (
                <span className="ml-2 text-13 font-medium text-text hidden sm:inline">
                  / {title}
                </span>
              )}
            </div>
          </div>

          {/* Right side controls: Search / Cmd+K, Theme, Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search field opening command palette */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-control border border-line bg-surface-2 text-text-3 hover:text-text hover:border-line-strong transition-colors duration-150 text-12 font-mono"
            >
              <SearchIcon size={14} />
              <span>Search exhibits…</span>
              <kbd className="ml-2 flex items-center gap-0.5 px-1 py-0.5 rounded border border-line bg-surface-1 text-11 text-text-3">
                <CommandIcon size={10} />
                <span>K</span>
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden flex h-8 w-8 items-center justify-center rounded-control border border-line bg-surface-2 text-text-3 hover:text-text"
              aria-label="Search"
            >
              <SearchIcon size={16} />
            </button>

            {/* Theme switcher */}
            <ThemeToggle />

            {/* Contextual actions */}
            {actions}
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-6 md:py-8">
          {description && (
            <p className="mb-6 text-14 text-text-3 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
