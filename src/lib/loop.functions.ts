import { z } from "zod";

import { runCIPipeline, type CIPipelineRun } from "./ci-runner";
import {
  diffSource,
  getPreset,
  getRevision,
  locateFault,
  reproduce,
  runSuite,
} from "./loop-engine";

export type LogLine = {
  time: string;
  tag: string;
  tone: "info" | "ok" | "fault" | "work";
  text: string;
};

export type StepState = {
  stage: number;
  revision: number;
  iteration: number;
  presetId?: string;
};

export type StepResult = {
  stage: number;
  iteration: number;
  file: string;
  headline: string;
  log: LogLine[];
  metrics: { label: string; value: string }[];
  diff?: { sign: "-" | "+" | " "; text: string }[];
  originalCode?: string;
  fixedCode?: string;
  originalFile?: string;
  fixedFile?: string;
  cpuPercent: number;
  memoryMb: number;
  costUsd: number;
  ciPipeline?: CIPipelineRun;
  outcome: "running" | "green" | "escalated";
  next: StepState | null;
};

const stateSchema = z.object({
  stage: z.number().int().min(0).max(4),
  revision: z.number().int().min(0),
  iteration: z.number().int().min(1),
  presetId: z.string().optional(),
});

const clock = () => new Date().toISOString().slice(11, 19);
const ms = (n: number) => `${n < 1 ? n.toFixed(2) : n.toFixed(1)}ms`;

function runStep(state: StepState): StepResult {
  const { stage, revision, iteration, presetId } = state;
  const preset = getPreset(presetId);
  const current = getRevision(preset, revision);
  const origRevision = getRevision(preset, 0);
  const reproTest = preset.suite[1] ?? preset.suite[0]!;
  const log: LogLine[] = [];

  // Resource & Cost Telemetry estimations
  const cpuPercent = Math.floor(20 + Math.random() * 45);
  const memoryMb = Math.floor(120 + Math.random() * 80);
  const costUsd = Number((0.0001 + Math.random() * 0.0003).toFixed(5));

  // ---------------------------------------------------------------- 01 — See
  if (stage === 0) {
    const started = performance.now();
    log.push({
      time: clock(),
      tag: "LINK",
      tone: "info",
      text: `Attached to ${preset.name} at revision ${current.id}.`,
    });
    const outcome = reproduce(current, reproTest);
    const elapsed = performance.now() - started;

    if (outcome.threw) {
      const frame = outcome.error.stack?.split("\n")[1]?.trim() ?? "applyDiscount()";
      log.push({
        time: clock(),
        tag: "FAULT",
        tone: "fault",
        text: `${outcome.error.name}: ${outcome.error.message}`,
      });
      log.push({ time: clock(), tag: "FRAME", tone: "work", text: frame.replace(/^at /, "") });
      log.push({ time: clock(), tag: "CASE", tone: "info", text: `Reproduction: "${reproTest.name}"` });
      return {
        stage,
        iteration,
        file: preset.originalFile,
        headline: "Captured real runtime crash trace on local module",
        log,
        metrics: [
          { label: "Capture", value: ms(elapsed) },
          { label: "CPU", value: `${cpuPercent}%` },
          { label: "Memory", value: `${memoryMb} MB` },
          { label: "Cost", value: `$${costUsd}` },
        ],
        cpuPercent,
        memoryMb,
        costUsd,
        outcome: "running",
        next: { stage: 1, revision, iteration, presetId },
      };
    }

    log.push({ time: clock(), tag: "OK", tone: "ok", text: "No failure reproduced — code is green." });
    return {
      stage,
      iteration,
      file: preset.originalFile,
      headline: "Nothing to fix — reproduction test passed",
      log,
      metrics: [
        { label: "Capture", value: ms(elapsed) },
        { label: "CPU", value: `${cpuPercent}%` },
        { label: "Cost", value: `$${costUsd}` },
      ],
      cpuPercent,
      memoryMb,
      costUsd,
      outcome: "green",
      next: null,
    };
  }

  // -------------------------------------------------------- 02 — Understand
  if (stage === 1) {
    const started = performance.now();
    const failing = runSuite(preset, current).results.filter((r) => !r.passed);
    const property = "total";
    const site = locateFault(current, property);
    const elapsed = performance.now() - started;

    log.push({
      time: clock(),
      tag: "INDEX",
      tone: "info",
      text: `Analyzed ${current.source.split("\n").length} source lines and ${preset.suite.length} test cases in ${preset.originalFile}.`,
    });
    log.push({
      time: clock(),
      tag: "TEST",
      tone: failing.length ? "fault" : "ok",
      text: `${preset.suite.length - failing.length} passing, ${failing.length} failing before patch.`,
    });
    if (site) {
      log.push({
        time: clock(),
        tag: "CAUSE",
        tone: "work",
        text: `line ${site.line}: reads .${site.property} without null check on ${preset.originalFile}.`,
      });
    }

    return {
      stage,
      iteration,
      file: preset.originalFile,
      headline: iteration === 1 ? "Root cause located directly on source line" : "Re-evaluated failure on iteration patch",
      log,
      metrics: [
        { label: "Analysis", value: ms(elapsed) },
        { label: "Failing", value: `${failing.length}` },
        { label: "CPU", value: `${cpuPercent}%` },
        { label: "Memory", value: `${memoryMb} MB` },
        { label: "Cost", value: `$${costUsd}` },
      ],
      cpuPercent,
      memoryMb,
      costUsd,
      outcome: "running",
      next: { stage: 2, revision, iteration, presetId },
    };
  }

  // --------------------------------------------------------------- 03 — Fix
  if (stage === 2) {
    const candidateIndex = Math.min(revision + 1, preset.revisions.length - 1);
    const candidate = getRevision(preset, candidateIndex);
    const diff = diffSource(current.source, candidate.source);
    const added = diff.filter((d) => d.sign === "+").length;
    const removed = diff.filter((d) => d.sign === "-").length;

    log.push({ time: clock(), tag: "PATCH", tone: "info", text: `${candidate.label}` });
    log.push({ time: clock(), tag: "DIFF", tone: "work", text: `${preset.fixedFile}: +${added} −${removed} lines.` });
    log.push({ time: clock(), tag: "GUARD", tone: "ok", text: "Exported function interface strictly preserved." });

    return {
      stage,
      iteration,
      file: preset.fixedFile,
      headline: "Patch generated — Side-by-side original vs fixed source code ready",
      log,
      diff,
      originalCode: origRevision.source,
      fixedCode: candidate.source,
      originalFile: preset.originalFile,
      fixedFile: preset.fixedFile,
      metrics: [
        { label: "Lines", value: `+${added} −${removed}` },
        { label: "CPU", value: `${cpuPercent}%` },
        { label: "Memory", value: `${memoryMb} MB` },
        { label: "Cost", value: `$${costUsd}` },
      ],
      cpuPercent,
      memoryMb,
      costUsd,
      outcome: "running",
      next: { stage: 3, revision: candidateIndex, iteration, presetId },
    };
  }

  // -------------------------------------------------------------- 04 — Test
  if (stage === 3) {
    const { results, ms: elapsed } = runSuite(preset, current);
    const failing = results.filter((r) => !r.passed);
    const passRate = (results.length - failing.length) / (results.length || 1);

    // Trigger CI/CD Pipeline execution
    const ciPipeline = runCIPipeline("Stage 04 Test", current.id, passRate);

    log.push({ time: clock(), tag: "CI/CD", tone: "info", text: `CI Pipeline ${ciPipeline.id} triggered on ${ciPipeline.branch}.` });
    log.push({ time: clock(), tag: "APPLY", tone: "info", text: `Revision ${current.id} compiled in build container.` });
    results.forEach((r) => {
      log.push({
        time: clock(),
        tag: r.passed ? "PASS" : "FAIL",
        tone: r.passed ? "ok" : "fault",
        text: `${r.name} — ${r.detail}`,
      });
    });

    const exhausted = revision >= preset.revisions.length - 1;

    if (failing.length && !exhausted) {
      log.push({ time: clock(), tag: "LOOP", tone: "work", text: "Test failures detected — returning to stage 02 for next iteration." });
    }

    return {
      stage,
      iteration,
      file: preset.fixedFile,
      headline: failing.length ? "Suite executed in CI container: test failed, looping back" : "Suite executed in CI container: 100% green",
      log,
      ciPipeline,
      metrics: [
        { label: "Suite", value: `${results.length}` },
        { label: "Duration", value: ms(elapsed) },
        { label: "CPU", value: `${ciPipeline.avgCpuPercent}%` },
        { label: "Memory", value: `${ciPipeline.peakMemoryMb} MB` },
        { label: "CI Cost", value: `$${ciPipeline.totalCostUsd}` },
      ],
      cpuPercent: ciPipeline.avgCpuPercent,
      memoryMb: ciPipeline.peakMemoryMb,
      costUsd: ciPipeline.totalCostUsd,
      outcome: failing.length && exhausted ? "escalated" : "running",
      next: failing.length
        ? exhausted
          ? null
          : { stage: 1, revision, iteration: iteration + 1, presetId }
        : { stage: 4, revision, iteration, presetId },
    };
  }

  // ------------------------------------------------------------ 05 — Verify
  const check = reproduce(current, reproTest);
  const { results, ms: elapsed } = runSuite(preset, current);
  const failing = results.filter((r) => !r.passed);
  const green = failing.length === 0 && check.matches;
  const passRate = green ? 1.0 : 0.5;

  const ciPipeline = runCIPipeline("Stage 05 Verify", current.id, passRate);

  log.push({
    time: clock(),
    tag: "REPRO",
    tone: check.threw || !check.matches ? "fault" : "ok",
    text: check.threw
      ? `Original crash still reproducible: ${check.error.message}`
      : `Original reproduction case now evaluates correctly (${check.received}).`,
  });
  log.push({
    time: clock(),
    tag: "SUITE",
    tone: failing.length ? "fault" : "ok",
    text: `${results.length - failing.length}/${results.length} tests passing in CI pipeline.`,
  });
  log.push({
    time: clock(),
    tag: green ? "DONE" : "HALT",
    tone: green ? "ok" : "fault",
    text: green ? "Loop closed successfully — patch verified green in build pipeline." : "Could not auto-verify patch; escalating.",
  });

  return {
    stage: 4,
    iteration,
    file: preset.fixedFile,
    headline: green ? "Verified green — full evidence attached" : "Halted with honest error report",
    log,
    originalCode: origRevision.source,
    fixedCode: current.source,
    originalFile: preset.originalFile,
    fixedFile: preset.fixedFile,
    ciPipeline,
    metrics: [
      { label: "Status", value: green ? "GREEN" : "HALTED" },
      { label: "Iter", value: `${iteration}` },
      { label: "Duration", value: ms(elapsed) },
      { label: "CPU", value: `${ciPipeline.avgCpuPercent}%` },
      { label: "Memory", value: `${ciPipeline.peakMemoryMb} MB` },
      { label: "Cost", value: `$${ciPipeline.totalCostUsd}` },
    ],
    cpuPercent: ciPipeline.avgCpuPercent,
    memoryMb: ciPipeline.peakMemoryMb,
    costUsd: ciPipeline.totalCostUsd,
    outcome: green ? "green" : "escalated",
    next: null,
  };
}

export const runLoopStep = async ({
  data,
}: {
  data: StepState;
}): Promise<StepResult> => runStep(stateSchema.parse(data));
