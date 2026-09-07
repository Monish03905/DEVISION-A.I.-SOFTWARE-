import { useSyncExternalStore } from "react";
import type { CIPipelineRun } from "@/lib/ci-runner";

export type StageRecord = {
  stage: number;
  name: string;
  iteration: number;
  startedAt: number;
  durationMs: number;
  cpuPercent: number;
  memoryMb: number;
  costUsd: number;
  outcome: "running" | "green" | "escalated";
  headline: string;
  ciPipeline?: CIPipelineRun;
  originalCode?: string;
  fixedCode?: string;
  originalFile?: string;
  fixedFile?: string;
};

export type CycleRun = {
  id: string;
  startedAt: number;
  durationMs: number;
  iterations: number;
  outcome: "green" | "escalated";
  totalCostUsd: number;
  avgCpuPercent: number;
  peakMemoryMb: number;
  presetId?: string;
  steps?: StageRecord[];
};

const KEY = "devision.runs.v3";
const MAX_RUNS = 15;

let runs: CycleRun[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) runs = parsed as CycleRun[];
    }
  } catch {
    runs = [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(runs));
  } catch {
    /* storage unavailable */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function recordRun(run: Omit<CycleRun, "id">) {
  load();
  runs = [{ ...run, id: `loop-${run.startedAt.toString(36)}` }, ...runs].slice(0, MAX_RUNS);
  persist();
  emit();
}

export function useCycleRun(id: string) {
  const all = useCycleRuns();
  return all.find((r) => r.id === id) ?? null;
}

export function clearRuns() {
  load();
  runs = [];
  persist();
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const empty: CycleRun[] = [];

export function useCycleRuns() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return runs;
    },
    () => empty,
  );
}
