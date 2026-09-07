import { useSyncExternalStore } from "react";

import { realProject } from "@/lib/real-project";

export type ScheduledCycle = {
  id: string;
  title: string;
  moduleName: string;
  startTime: string; // ISO string or HH:mm
  endTime: string;   // ISO string or HH:mm
  intervalMinutes: number;
  status: "scheduled" | "active" | "completed" | "paused";
  targetPipeline: string;
  estimatedCostUsd: number;
  createdAt: number;
  lastRunAt?: number;
  nextRunAt: number;
};

const KEY = "devision.planner.v2";

const initialSchedules: ScheduledCycle[] = [
  {
    id: "sched-real-project",
    title: "DeVision Real Project Verification",
    moduleName: realProject.moduleFile,
    startTime: "09:00",
    endTime: "18:00",
    intervalMinutes: 15,
    status: "active",
    targetPipeline: realProject.ciCommand,
    estimatedCostUsd: 0,
    createdAt: Date.now() - 3600000 * 2,
    lastRunAt: Date.now() - 60000 * 12,
    nextRunAt: Date.now() + 60000 * 3,
  },
];

let schedules: ScheduledCycle[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        schedules = parsed;
        return;
      }
    }
  } catch {
    /* fallback to initial */
  }
  schedules = initialSchedules;
  persist();
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(schedules));
  } catch {
    /* localStorage unavailable */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function addScheduledCycle(cycle: Omit<ScheduledCycle, "id" | "createdAt" | "nextRunAt">) {
  load();
  const now = Date.now();
  const nextRunAt = now + (cycle.intervalMinutes || 15) * 60 * 1000;
  const newCycle: ScheduledCycle = {
    ...cycle,
    id: `sched-${now.toString(36)}`,
    createdAt: now,
    nextRunAt,
  };
  schedules = [newCycle, ...schedules];
  persist();
  emit();
}

export function updateCycleStatus(id: string, status: ScheduledCycle["status"]) {
  load();
  schedules = schedules.map((s) => (s.id === id ? { ...s, status } : s));
  persist();
  emit();
}

export function deleteScheduledCycle(id: string) {
  load();
  schedules = schedules.filter((s) => s.id !== id);
  persist();
  emit();
}

export function clearScheduledCycles() {
  load();
  schedules = [];
  persist();
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const empty: ScheduledCycle[] = [];

export function useScheduledCycles() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return schedules;
    },
    () => empty,
  );
}

export function getUpcomingCycles(): ScheduledCycle[] {
  load();
  return schedules
    .filter((s) => s.status === "active" || s.status === "scheduled")
    .sort((a, b) => a.nextRunAt - b.nextRunAt);
}
