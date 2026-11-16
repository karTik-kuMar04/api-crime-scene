export const dynamic = "force-dynamic";

async function getApiStatus() {
  const url = process.env.API_INTERNAL_URL ?? "http://localhost:4000/health";

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return "unavailable";
    return "connected";
  } catch {
    return "unavailable";
  }
}

export default async function HomePage() {
  const apiStatus = await getApiStatus();

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-lg font-bold text-cyan-300">
              A
            </div>
            <div>
              <p className="font-semibold tracking-wide">API CRIME SCENE</p>
              <p className="text-xs text-slate-500">Network forensics workspace</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
            Foundation v0.1
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
            Understand what happened on the wire
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Every request leaves a trail.
            <span className="block text-slate-500">Find the evidence.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A privacy-first workspace for inspecting browser network recordings,
            investigating failures and comparing performance.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-slate-500">Frontend</p>
              <p className="mt-1 text-sm font-medium text-emerald-300">Running</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-slate-500">Backend API</p>
              <p className={`mt-1 text-sm font-medium ${apiStatus === "connected" ? "text-emerald-300" : "text-amber-300"}`}>
                {apiStatus === "connected" ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8">
            <p className="text-sm font-medium text-slate-300">Next milestone</p>
            <p className="mt-2 text-2xl font-semibold">HAR upload and parsing</p>
            <p className="mt-2 text-sm text-slate-500">
              The repository foundation is ready. The investigation workflow will be built next.
            </p>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-5 text-xs text-slate-600">
          API Crime Scene · Built for developers · Local-first by design
        </footer>
      </div>
    </main>
  );
}
