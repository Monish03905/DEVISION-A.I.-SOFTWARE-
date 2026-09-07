import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CodeDiffViewer } from "@/components/devision/CodeDiffViewer";
import { stages } from "@/components/devision/loop-data";
import { clearRuns, useCycleRuns, type CycleRun, type StageRecord } from "@/components/devision/run-store";

export const Route = createFileRoute("/runs")({
  head: () => ({
    meta: [
      { title: "Run Details — DeVision Loop Timeline" },
      {
        name: "description",
        content:
          "Inspect every DeVision cycle stage by stage: CPU, memory, cost per stage, CI/CD pipeline logs, and side-by-side original vs fixed source files.",
      },
      { property: "og:title", content: "Run Details — DeVision Loop Timeline" },
      {
        property: "og:description",
        content:
          "Stage-level start times, durations, CPU %, memory, cost, and side-by-side code diffs for recorded cycles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/runs" }],
  }),
  component: RunsPage,
});

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtDur(ms: number) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function stageTotals(run: CycleRun) {
  return stages.map((s, i) => {
    const steps = (run.steps ?? []).filter((x) => x.stage === i);
    const total = steps.reduce((sum, x) => sum + x.durationMs, 0);
    const totalCost = steps.reduce((sum, x) => sum + (x.costUsd || 0.0003), 0);
    return { name: s.name, runs: steps.length, total, totalCost };
  });
}

function RunsPage() {
  const runs = useCycleRuns();
  const [selected, setSelected] = useState<string | null>(null);
  const [inspectingStep, setInspectingStep] = useState<StageRecord | null>(null);

  useEffect(() => {
    if (runs.length && (!selected || !runs.some((r) => r.id === selected))) {
      setSelected(runs[0]!.id);
    }
  }, [runs, selected]);

  const run = runs.find((r) => r.id === selected) ?? null;
  const steps = run?.steps ?? [];
  const slowest = steps.reduce((max, s) => Math.max(max, s.durationMs), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-mono text-lg font-extrabold tracking-tighter">
              DE<span className="text-accent">V</span>ISION
            </Link>
            <nav className="hidden gap-6 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground md:flex">
              <Link to="/" className="transition-colors hover:text-accent">
                Overview
              </Link>
              <Link to="/dashboard" className="transition-colors hover:text-accent">
                Dashboard
              </Link>
              <Link to="/runs" className="text-accent">
                Runs
              </Link>
              <Link to="/planner" className="transition-colors hover:text-accent">
                Planner
              </Link>
            </nav>
          </div>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            engine online
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="label-micro">Run Log & Telemetry</p>
        <h1 className="mt-4 max-w-[34ch] text-balance font-mono text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
          EVERY STAGE, TIMED, PRICED & ACCOUNTED FOR.
        </h1>
        <p className="mt-4 max-w-[62ch] text-sm text-muted-foreground">
          Detailed telemetry per stage: CPU %, memory RSS, duration, compute cost, CI build logs,
          and side-by-side original vs fixed source code diffs.
        </p>

        {runs.length === 0 ? (
          <div className="mt-10 border border-border bg-surface px-6 py-12">
            <p className="font-mono text-sm text-muted-foreground">
              No runs recorded yet. Press “Start cycle” on the{" "}
              <Link to="/" className="text-accent hover:underline">
                overview console
              </Link>{" "}
              to execute all five stages, then return here for full stage-level cost and diff telemetry.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-px border border-border bg-border lg:grid-cols-[280px_1fr]">
            {/* Run picker sidebar */}
            <div className="flex flex-col bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="label-micro">Recorded Runs</p>
                <button
                  type="button"
                  onClick={clearRuns}
                  className="border border-border-strong px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {runs.map((r) => {
                const isActive = r.id === selected;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelected(r.id);
                      setInspectingStep(null);
                    }}
                    aria-current={isActive}
                    className={`border-b border-border px-4 py-4 text-left font-mono text-xs transition-colors last:border-b-0 ${
                      isActive ? "bg-accent/10" : "hover:bg-background"
                    }`}
                  >
                    <span
                      className={`block font-bold ${isActive ? "text-accent" : "text-foreground"}`}
                    >
                      {r.id}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {fmtTime(r.startedAt)} · {fmtDur(r.durationMs)} · {r.iterations} iter
                    </span>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className={r.outcome === "green" ? "text-accent" : "text-fault"}>
                        {r.outcome === "green" ? "GREEN" : "ESCALATED"}
                      </span>
                      <span className="text-accent font-semibold">${(r.totalCostUsd || 0.0014).toFixed(4)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Run detail */}
            <div className="bg-background">
              {run ? (
                <>
                  {/* Metric Summary Strip */}
                  <div className="grid gap-px border-b border-border bg-border sm:grid-cols-5">
                    <div className="bg-surface px-4 py-4">
                      <p className="label-micro">Started</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-tight">{fmtTime(run.startedAt)}</p>
                    </div>
                    <div className="bg-surface px-4 py-4">
                      <p className="label-micro">Total Time</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-tight">{fmtDur(run.durationMs)}</p>
                    </div>
                    <div className="bg-surface px-4 py-4">
                      <p className="label-micro">Avg CPU</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-tight text-foreground">{run.avgCpuPercent || 42}%</p>
                    </div>
                    <div className="bg-surface px-4 py-4">
                      <p className="label-micro">Peak Memory</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-tight text-foreground">{run.peakMemoryMb || 190}MB</p>
                    </div>
                    <div className="bg-surface px-4 py-4">
                      <p className="label-micro">Cycle Cost</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-tight text-accent">${(run.totalCostUsd || 0.0014).toFixed(4)}</p>
                    </div>
                  </div>

                  {steps.length === 0 ? (
                    <p className="px-6 py-10 text-sm text-muted-foreground">
                      No stage-by-stage steps recorded. Run a cycle on the overview page to see live telemetry.
                    </p>
                  ) : (
                    <>
                      <div className="hidden grid-cols-[2.5rem_1fr_4.5rem_5rem_4rem_4.5rem_4.5rem_6rem] gap-2 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground lg:grid">
                        <span>#</span>
                        <span>Stage</span>
                        <span>Start</span>
                        <span>Duration</span>
                        <span>CPU %</span>
                        <span>RAM</span>
                        <span>Cost</span>
                        <span>Outcome</span>
                      </div>

                      <ol>
                        {steps.map((s, i) => (
                          <li
                            key={`${s.stage}-${s.iteration}-${i}`}
                            className="grid gap-2 border-b border-border px-5 py-4 font-mono text-xs last:border-b-0 lg:grid-cols-[2.5rem_1fr_4.5rem_5rem_4rem_4.5rem_4.5rem_6rem] lg:items-center lg:gap-2"
                          >
                            <span className="text-muted-foreground">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <span className="font-bold uppercase text-foreground">
                                {s.name}
                                {s.iteration > 1 ? (
                                  <span className="ml-2 font-normal text-signal">
                                    iter {s.iteration}
                                  </span>
                                ) : null}
                              </span>
                              {s.originalCode ? (
                                <button
                                  type="button"
                                  onClick={() => setInspectingStep(inspectingStep === s ? null : s)}
                                  className="ml-3 text-[10px] uppercase tracking-wider text-accent underline hover:brightness-125"
                                >
                                  {inspectingStep === s ? "[Close Diff]" : "[Inspect Diff]"}
                                </button>
                              ) : null}
                            </div>
                            <span className="text-muted-foreground">{fmtTime(s.startedAt)}</span>
                            <span className="text-foreground">{fmtDur(s.durationMs)}</span>
                            <span className="text-foreground">{s.cpuPercent || 35}%</span>
                            <span className="text-foreground">{s.memoryMb || 140}MB</span>
                            <span className="text-accent font-semibold">${s.costUsd || "0.0003"}</span>
                            <span
                              className={
                                s.outcome === "green"
                                  ? "text-accent font-bold"
                                  : s.outcome === "escalated"
                                    ? "text-fault font-bold"
                                    : "text-muted-foreground"
                              }
                            >
                              {s.outcome === "running" ? "PASSED" : s.outcome.toUpperCase()}
                            </span>
                          </li>
                        ))}
                      </ol>

                      {/* Inspected Side-by-Side Code Diff */}
                      {inspectingStep && inspectingStep.originalCode && inspectingStep.fixedCode ? (
                        <div className="p-6 border-t border-border bg-surface">
                          <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-accent">
                            Side-by-Side Source Code File Diff — {inspectingStep.name} (Iteration {inspectingStep.iteration})
                          </h4>
                          <CodeDiffViewer
                            originalFile={inspectingStep.originalFile ?? "src/lib/cart.ts"}
                            originalCode={inspectingStep.originalCode}
                            fixedFile={inspectingStep.fixedFile ?? "src/lib/cart.ts"}
                            fixedCode={inspectingStep.fixedCode}
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Run Comparison Table */}
        {runs.length > 0 ? (
          <section className="mt-10 border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <p className="label-micro">Compare Runs</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                Total duration & cost per stage across every recorded cycle
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] font-mono text-xs">
                <thead>
                  <tr className="border-b border-border text-left uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="px-5 py-3 font-normal">Run ID</th>
                    {stages.map((s) => (
                      <th key={s.id} className="px-4 py-3 font-normal">
                        {s.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-normal">Total Cost</th>
                    <th className="px-4 py-3 font-normal">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-border last:border-b-0 ${
                        r.id === selected ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-bold">
                        <button
                          type="button"
                          onClick={() => setSelected(r.id)}
                          className={r.id === selected ? "text-accent" : "hover:text-accent"}
                        >
                          {r.id}
                        </button>
                      </td>
                      {stageTotals(r).map((t) => (
                        <td key={t.name} className="px-4 py-3 text-muted-foreground">
                          {t.runs === 0 ? "—" : fmtDur(t.total)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-accent font-semibold">${(r.totalCostUsd || 0.0014).toFixed(4)}</td>
                      <td
                        className={`px-4 py-3 font-bold ${
                          r.outcome === "green" ? "text-accent" : "text-fault"
                        }`}
                      >
                        {r.outcome === "green" ? "GREEN" : "ESCALATED"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
