import { AppShell } from "@/components/app-shell";
import { BadgeCheckIcon, MoonIcon, ShieldIcon, SunIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Adjust workspace preferences, privacy guardrails, and application appearance while keeping investigation data local-first."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Appearance</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Theme preferences</h3>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--foreground)]">Application theme</p>
                <p className="text-sm text-[var(--muted)]">Dark mode remains the default and can be switched per user preference.</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="font-medium text-[var(--foreground)]">Preferences</p>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                <span>Open imported HAR files in the same workspace</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                <span>Highlight potential issue patterns</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                <span>Auto-open comparison summary</span>
                <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Privacy</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Local-first handling</h3>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center gap-3 text-[var(--foreground)]">
              <ShieldIcon size={18} className="text-[var(--accent)]" />
              <p className="font-medium">Sensitive data awareness</p>
            </div>
            <p className="text-sm text-[var(--muted)]">
              HAR files can contain cookies, authorization headers, tokens, request payloads, and other highly sensitive data. API Crime Scene is designed for local-first inspection and does not automatically upload activity to a remote service.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center gap-3 text-[var(--foreground)]">
              <BadgeCheckIcon size={18} className="text-[var(--accent)]" />
              <p className="font-medium">About API Crime Scene</p>
            </div>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>Privacy-first browser forensics</li>
              <li>Next.js + TypeScript workspace</li>
              <li>Built for HAR analysis and session comparisons</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
