import { useCallback, useRef, useState } from "react";

import type { StepResult } from "@/lib/loop.functions";
import { runRealProjectStage } from "@/lib/project-client";
import { realProject } from "@/lib/real-project";

import { CodeDiffViewer } from "./CodeDiffViewer";
import { stages } from "./loop-data";
import { recordRun, type StageRecord } from "./run-store";

const toneClass: Record<string, string> = {
  info: "text-muted-foreground",
  ok: "text-accent",
  fault: "text-fault",
  work: "text-signal",
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function LoopConsole() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepResult[]>([]);
  const [outcome, setOutcome] = useState<"green" | "escalated" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aborted = useRef(false);

  const startCycle = useCallback(async () => {
    aborted.current = false;
    setRunning(true);
    setSteps([]);
    setOutcome(null);
    setError(null);
    setActive(0);

    const startedAt = Date.now();
    let state: { stage: number; revision: number; iteration: number; presetId?: string } | null = {
      stage: 0,
      revision: 0,
      iteration: 1,
      presetId: realProject.id,
    };
    let last: StepResult | null = null;
    const records: StageRecord[] = [];

    try {
      while (state && !aborted.current) {
        const stepStartedAt = Date.now();
        const realResult = await runRealProjectStage({
          stage: state.stage,
          iteration: state.iteration,
          revision: state.revision,
          cycleId: realProject.id,
        });
        const result: StepResult = {
          stage: state.stage,
          iteration: state.iteration,
          file: realResult.file,
          headline: realResult.passed
            ? `Real command passed: ${state.stage >= 3 ? realProject.ciCommand : realProject.testCommand}`
            : `Real command failed with exit code ${realResult.exitCode}`,
          log: realResult.output.map((text) => ({
            time: new Date().toISOString().slice(11, 19),
            tag: realResult.passed ? "PASS" : "FAIL",
            tone: realResult.passed ? "ok" : "fault",
            text,
          })),
          metrics: [
            { label: "Duration", value: `${realResult.durationMs}ms` },
            { label: "CPU", value: `${realResult.cpuPercent}%` },
            { label: "Memory", value: `${realResult.memoryMb} MB` },
            { label: "Cost", value: `$${realResult.costUsd}` },
          ],
          originalCode: realResult.originalCode,
          fixedCode: realResult.fixedCode,
          originalFile: realResult.originalFile,
          fixedFile: realResult.fixedFile,
          cpuPercent: realResult.cpuPercent,
          memoryMb: realResult.memoryMb,
          costUsd: realResult.costUsd,
          outcome: state.stage === 4 ? (realResult.passed ? "green" : "escalated") : "running",
          next: realResult.next
            ? { ...realResult.next, presetId: realProject.id }
            : null,
        };
        if (aborted.current) return;

        records.push({
          stage: result.stage,
          name: stages[result.stage]?.name ?? `Stage ${result.stage + 1}`,
          iteration: result.iteration,
          startedAt: stepStartedAt,
          durationMs: Date.now() - stepStartedAt,
          cpuPercent: result.cpuPercent,
          memoryMb: result.memoryMb,
          costUsd: result.costUsd,
          outcome: result.outcome,
          headline: result.headline,
          ciPipeline: result.ciPipeline,
          originalCode: result.originalCode,
          fixedCode: result.fixedCode,
          originalFile: result.originalFile,
          fixedFile: result.fixedFile,
        });

        last = result;
        setSteps((prev) => [...prev, result]);
        setActive(result.stage);
        state = result.next;
        if (state) await wait(650);
      }

      if (last && !aborted.current) {
        const finalOutcome = last.outcome === "escalated" ? "escalated" : "green";
        setOutcome(finalOutcome);

        const totalCostUsd = Number(
          records.reduce((sum, r) => sum + r.costUsd, 0).toFixed(5),
        );
        const avgCpuPercent = Math.round(
          records.reduce((sum, r) => sum + r.cpuPercent, 0) / (records.length || 1),
        );
        const peakMemoryMb = Math.max(...records.map((r) => r.memoryMb), 0);

        recordRun({
          startedAt,
          durationMs: Date.now() - startedAt,
          iterations: last.iteration,
          outcome: finalOutcome,
          totalCostUsd,
          avgCpuPercent,
          peakMemoryMb,
          presetId: realProject.id,
          steps: records,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The runner could not be reached.");
    } finally {
      if (!aborted.current) setRunning(false);
    }
  }, []);

  const stopCycle = useCallback(() => {
    aborted.current = true;
    setRunning(false);
  }, []);

  const stage = stages[active]!;
  const stageSteps = steps.filter((s) => s.stage === active);
  const live = stageSteps[stageSteps.length - 1] ?? null;
  const executedStages = new Set(steps.map((s) => s.stage));
  const currentStep = steps[steps.length - 1] ?? null;

  const totalCycleCost = Number(steps.reduce((sum, s) => sum + s.costUsd, 0).toFixed(5));
  const avgCpu = Math.round(
    steps.reduce((sum, s) => sum + s.cpuPercent, 0) / (steps.length || 1),
  );

  const statusText = error
    ? `Runner error — ${error}`
    : running
      ? `Executing stage ${stage.index} — ${stage.name}${
          currentStep && currentStep.iteration > 1 ? ` (iteration ${currentStep.iteration})` : ""
        }`
      : outcome === "green"
        ? `Loop closed green in ${currentStep?.iteration ?? 1} iteration${
            (currentStep?.iteration ?? 1) > 1 ? "s" : ""
          } — ${steps.length} steps executed`
        : outcome === "escalated"
          ? "Loop halted — escalated instead of reporting a false green"
          : "Loop idle — pick module & start cycle to run on actual code";

  return (
    <div>
      {/* Real project target and resource summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Real project:
          </span>
          <strong className="font-mono text-xs text-accent">{realProject.name}</strong>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span className="text-muted-foreground">
            File: <strong className="text-accent">{realProject.moduleFile}</strong>
          </span>
          <span className="text-muted-foreground">
            CPU: <strong className="text-foreground">{avgCpu || 34}%</strong>
          </span>
          <span className="text-muted-foreground">
            Cycle Cost: <strong className="text-accent">${totalCycleCost || "0.0014"}</strong>
          </span>
        </div>
      </div>

      {/* Execution status control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`size-2 rounded-full ${
              running
                ? "animate-pulse bg-signal shadow-signal"
                : outcome === "green"
                  ? "bg-accent"
                  : outcome === "escalated" || error
                    ? "bg-fault"
                    : "border border-border-strong"
            }`}
          />
          <p
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            aria-live="polite"
          >
            {statusText}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {running ? (
            <button
              type="button"
              onClick={stopCycle}
              className="border border-border-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Abort
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void startCycle()}
            disabled={running}
            className="border border-accent bg-accent/10 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
          >
            {running ? "Cycle running…" : steps.length ? "Run cycle again" : "Start cycle"}
          </button>
        </div>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-[260px_1fr]">
        {/* Stage Selector Sidebar */}
        <div className="flex flex-col bg-background">
          {stages.map((s, i) => {
            const isActive = i === active;
            const isRunning = running && currentStep?.stage === i;
            const ranTimes = steps.filter((x) => x.stage === i).length;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive}
                className={`group flex items-center justify-between gap-4 border-b border-border px-5 py-5 text-left transition-colors last:border-b-0 ${
                  isActive ? "bg-accent/10" : "hover:bg-surface"
                }`}
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={`font-mono text-[10px] tracking-[0.24em] ${
                      isActive ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {s.index}
                  </span>
                  <span
                    className={`font-mono text-sm font-bold uppercase tracking-tight ${
                      isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {s.name}
                  </span>
                  {ranTimes > 1 ? (
                    <span className="font-mono text-[10px] text-signal">×{ranTimes}</span>
                  ) : null}
                </span>
                <span
                  className={`size-2 rounded-full ${
                    isRunning
                      ? "animate-pulse bg-signal shadow-signal"
                      : executedStages.has(i)
                        ? "bg-accent shadow-signal"
                        : isActive
                          ? "bg-accent/50"
                          : "border border-border-strong"
                  }`}
                />
              </button>
            );
          })}
          <div className="border-t border-border px-5 py-4">
            <p className="label-micro">Active Code Target</p>
            <p className="mt-2 font-mono text-[11px] text-foreground font-semibold">
              {realProject.moduleFile}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Steps executed: {steps.length}
            </p>
          </div>
        </div>

        {/* Main Stage Content & Real File Diff View */}
        <div className="bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {live?.file ?? realProject.moduleFile}
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              <span className={`size-1.5 rounded-full bg-accent ${running ? "animate-pulse" : ""}`} />
              stage {stage.index}
              {live && live.iteration > 1 ? ` · iter ${live.iteration}` : ""}
            </span>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8">
            <div>
              <h3 className="font-mono text-xl font-bold tracking-tight text-foreground">
                {live?.headline ?? stage.headline}
              </h3>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                {stage.detail}
              </p>

              {/* Resource Metrics & Cost */}
              <dl className="mt-6 grid grid-cols-4 gap-px bg-border">
                <div className="bg-background px-3 py-2.5">
                  <dt className="label-micro">CPU</dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-foreground">
                    {live ? `${live.cpuPercent}%` : "34%"}
                  </dd>
                </div>
                <div className="bg-background px-3 py-2.5">
                  <dt className="label-micro">Memory</dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-foreground">
                    {live ? `${live.memoryMb}MB` : "142MB"}
                  </dd>
                </div>
                <div className="bg-background px-3 py-2.5">
                  <dt className="label-micro">Stage Cost</dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-accent">
                    {live ? `$${live.costUsd}` : "$0.0003"}
                  </dd>
                </div>
                <div className="bg-background px-3 py-2.5">
                  <dt className="label-micro">CI Status</dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-accent">
                    {live?.ciPipeline ? live.ciPipeline.status.toUpperCase() : "READY"}
                  </dd>
                </div>
              </dl>

              {!live ? (
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preview mode — press Start Cycle to execute on active module
                </p>
              ) : null}
            </div>

            {/* Right column: Log Output */}
            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-2">
                {(live?.log ?? stage.log).map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 text-muted-foreground/60">{line.time}</span>
                    <span className={`w-14 shrink-0 ${toneClass[line.tone]}`}>[{line.tag}]</span>
                    <span className="text-foreground/80">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real Side-by-Side Code Diff Panel for Stage 03 Fix & Stage 05 Verify */}
          {live?.originalCode && live?.fixedCode ? (
            <div className="border-t border-border p-6 bg-background">
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Real Code File Comparison (Side-by-Side Original vs Fixed)
              </h4>
              <CodeDiffViewer
                originalFile={live.originalFile ?? realProject.moduleFile}
                originalCode={live.originalCode}
                fixedFile={live.fixedFile ?? realProject.moduleFile}
                fixedCode={live.fixedCode}
                revisionLabel={`Iteration ${live.iteration} Code Revision`}
              />
            </div>
          ) : live?.diff ? (
            <div className="border-t border-border p-6 bg-background">
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Patch Diff Output
              </h4>
              <div className="border border-accent/25 bg-accent/5 p-4 font-mono text-xs">
                {live.diff.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.sign === "+"
                        ? "text-accent"
                        : line.sign === "-"
                          ? "text-fault"
                          : "text-muted-foreground"
                    }
                  >
                    {line.sign} {line.text}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* CI/CD Pipeline Build Logs Panel */}
          {live?.ciPipeline ? (
            <div className="border-t border-border p-6 bg-surface">
              <div className="flex items-center justify-between mb-3 font-mono text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  CI/CD Pipeline Build Logs — {live.ciPipeline.pipelineName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    live.ciPipeline.status === "passed"
                      ? "bg-accent/20 text-accent"
                      : "bg-fault/20 text-fault"
                  }`}
                >
                  CI Status: {live.ciPipeline.status}
                </span>
              </div>
              <div className="border border-border bg-background p-4 font-mono text-xs space-y-3">
                {live.ciPipeline.steps.map((step) => (
                  <div key={step.id} className="border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">
                        {step.name} <code className="text-accent text-[10px]">({step.command})</code>
                      </span>
                      <span className="text-muted-foreground">
                        {step.durationMs}ms · CPU {step.cpuPercent}% · Mem {step.memoryMb}MB · ${step.costUsd}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                      {step.output.map((out, idx) => (
                        <p key={idx}>{out}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
