import type { RealProjectConfig } from "./real-project";

export type RealProjectState = {
  stage: number;
  iteration: number;
  revision: number;
  cycleId: string;
};

export type RealProjectResult = {
  project: RealProjectConfig;
  file: string;
  originalFile: string;
  fixedFile: string;
  originalCode: string;
  fixedCode: string;
  output: string[];
  passed: boolean;
  durationMs: number;
  cpuPercent: number;
  memoryMb: number;
  costUsd: number;
  exitCode: number;
  next: RealProjectState | null;
};

export async function runRealProjectStage(state: RealProjectState) {
  const response = await fetch("/api/devision/project-stage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(state),
  });

  const payload = (await response.json()) as RealProjectResult | { error?: string };
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "Real project runner failed.");
  }
  return payload;
}