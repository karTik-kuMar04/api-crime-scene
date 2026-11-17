"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CompareIcon,
  FolderIcon,
  InvestigationsIcon,
  MenuIcon,
  NetworkIcon,
  OverviewIcon,
  ReportsIcon,
  RequestExplorerIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon
} from "./icons";
import { ThemeToggle } from "./theme-toggle";

const navigationItems = [
  { label: "Overview", href: "/", icon: OverviewIcon },
  { label: "Investigations", href: "/investigations", icon: InvestigationsIcon },
  { label: "Compare Sessions", href: "/compare", icon: CompareIcon },
  { label: "Request Explorer", href: "/request-explorer", icon: RequestExplorerIcon },
  { label: "Reports", href: "/reports", icon: ReportsIcon }
];

const workspaceItems = [
  { label: "New investigation", href: "/new-investigation" },
  { label: "Settings", href: "/settings" }
];

function LogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent)]/40 bg-[linear-gradient(135deg,rgba(32,240,255,0.2),rgba(13,148,136,0.08))] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(45,212,191,0.08)]">
      <NetworkIcon size={18} />
      <span className="absolute inset-1 rounded-lg border border-[var(--accent)]/20" />
    </div>
  );
}

export function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = navigationItems.find((item) => item.href === pathname) ?? navigationItems[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] transition-colors duration-200">
      <div className="lg:hidden">
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        ) : null}
      </div>

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 border-r border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-xl transition-all duration-300",
          "shadow-[0_20px_45px_rgba(2,6,23,0.25)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "w-24" : "w-[18rem]",
          "lg:translate-x-0"
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <LogoMark />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    API
                  </p>
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">Crime Scene</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <LogoMark />
              </div>
            )}

            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] lg:flex"
            >
              {sidebarCollapsed ? <ChevronRightIcon size={14} /> : <ChevronLeftIcon size={14} />}
            </button>
          </div>

          <nav className="flex-1 space-y-5 px-3 py-5">
            <div className="space-y-1">
              {navigationItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-[var(--surface-strong)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_rgba(45,212,191,0.12)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                      sidebarCollapsed ? "justify-center px-2" : ""
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={16} className={isActive ? "text-[var(--accent)]" : "text-current"} />
                    {!sidebarCollapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              {!sidebarCollapsed ? (
                <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Workspace
                </div>
              ) : null}
              <div className="space-y-1">
                {workspaceItems.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                      pathname === href ? "bg-[var(--surface-strong)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                      sidebarCollapsed ? "justify-center px-2" : ""
                    ].join(" ")}
                  >
                    {href === "/new-investigation" ? <FolderIcon size={16} /> : <SettingsIcon size={16} />}
                    {!sidebarCollapsed ? <span>{label}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="border-t border-[var(--border)] px-3 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[11px] font-semibold text-[var(--accent)]">
                KS
              </div>
              {!sidebarCollapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">Kartik S.</p>
                  <p className="truncate text-[11px] text-[var(--muted)]">Workspace</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      <div className={sidebarCollapsed ? "lg:pl-24" : "lg:pl-72"}>
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--foreground)] lg:hidden"
              >
                <MenuIcon size={16} />
              </button>

              <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)] sm:flex">
                <SparkIcon size={12} className="text-[var(--accent)]" />
                {activeItem.label}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                  Workspace
                </p>
                <h1 className="truncate text-lg font-semibold text-[var(--foreground)] sm:text-xl">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
              >
                <SearchIcon size={14} />
                Search
              </button>

              <ThemeToggle />

              <button
                type="button"
                aria-label="Profile menu"
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[10px] font-semibold text-[var(--accent)]">
                  KS
                </span>
                <span className="hidden sm:inline">Kartik</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
          {description ? (
            <div className="mb-6 flex flex-col gap-2 border-b border-[var(--border)] pb-5">
              <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--muted)]">Overview</h2>
              <p className="max-w-3xl text-sm text-[var(--muted)] sm:text-base">{description}</p>
            </div>
          ) : null}
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-[18rem] border-r border-[var(--border)] bg-[var(--panel)]/95 p-3 backdrop-blur-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          ].join(" ")}
        >
          <div className="mb-4 flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">API</p>
                <p className="text-sm font-semibold">Crime Scene</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <nav className="space-y-1">
            {navigationItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                    isActive ? "bg-[var(--surface-strong)] text-[var(--foreground)]" : "text-[var(--muted)]"
                  ].join(" ")}
                >
                  <Icon size={16} className={isActive ? "text-[var(--accent)]" : "text-current"} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </div>
  );
}
