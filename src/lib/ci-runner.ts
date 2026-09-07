/**
 * Real CI/CD Pipeline Build Runner.
 * Simulates and logs realistic multi-step CI pipeline execution for DeVision cycles.
 */

export type CIBuildStep = {
  id: string;
  name: string;
  command: string;
  status: "success" | "failure" | "running" | "queued";
  durationMs: number;
  cpuPercent: number;
  memoryMb: number;
  costUsd: number;
  output: string[];
};

export type CIPipelineRun = {
  id: string;
  commitSha: string;
  branch: string;
  pipelineName: string;
  status: "passed" | "failed" | "building";
  totalDurationMs: number;
  totalCostUsd: number;
  avgCpuPercent: number;
  peakMemoryMb: number;
  steps: CIBuildStep[];
};

export function runCIPipeline(
  stageName: string,
  revisionId: string,
  testPassRate: number,
): CIPipelineRun {
  const commitSha = revisionId.startsWith("patch")
    ? `patch-${Math.random().toString(36).substring(2, 7)}`
    : revisionId;
  const isSuccess = testPassRate === 1.0;

  const steps: CIBuildStep[] = [
    {
      id: "step-1",
      name: "Lint & Static Analysis",
      command: "eslint src/**/*.ts --max-warnings=0",
      status: "success",
      durationMs: Math.floor(180 + Math.random() * 120),
      cpuPercent: Math.floor(25 + Math.random() * 15),
      memoryMb: Math.floor(110 + Math.random() * 20),
      costUsd: 0.00015,
      output: [
        "[CI] Initializing ESLint v9.32.0...",
        "[CI] Checking 8 files in src/lib and src/components...",
        "[CI] ✔ 0 errors, 0 warnings found.",
      ],
    },
    {
      id: "step-2",
      name: "Type Checking",
      command: "tsc --noEmit",
      status: "success",
      durationMs: Math.floor(240 + Math.random() * 160),
      cpuPercent: Math.floor(45 + Math.random() * 20),
      memoryMb: Math.floor(165 + Math.random() * 30),
      costUsd: 0.00028,
      output: [
        "[CI] Compiling TypeScript AST target ES2022...",
        "[CI] Verifying strict null checks & type bounds...",
        "[CI] ✔ 0 type diagnostics emitted.",
      ],
    },
    {
      id: "step-3",
      name: "Test Suite Runner",
      command: "vitest run --reporter=verbose",
      status: isSuccess ? "success" : "failure",
      durationMs: Math.floor(450 + Math.random() * 350),
      cpuPercent: Math.floor(70 + Math.random() * 25),
      memoryMb: Math.floor(210 + Math.random() * 45),
      costUsd: 0.00065,
      output: isSuccess
        ? [
            "[CI] Running test suite against candidate build...",
            `[CI] PASS  src/lib/module.test.ts (4/4 passed)`,
            "[CI] ✔ All tests passed in real container environment.",
          ]
        : [
            "[CI] Running test suite against candidate build...",
            `[CI] FAIL  src/lib/module.test.ts (${Math.floor(testPassRate * 4)}/4 passed)`,
            "[CI] ✖ AssertionError: Expected total 0 for guest checkout.",
          ],
    },
    {
      id: "step-4",
      name: "Build & Artifact Packaging",
      command: "vite build --mode production",
      status: isSuccess ? "success" : "queued",
      durationMs: isSuccess ? Math.floor(320 + Math.random() * 180) : 0,
      cpuPercent: isSuccess ? Math.floor(55 + Math.random() * 20) : 0,
      memoryMb: isSuccess ? Math.floor(190 + Math.random() * 35) : 0,
      costUsd: isSuccess ? 0.00032 : 0,
      output: isSuccess
        ? [
            "[CI] Bundling production assets with Vite...",
            "[CI] dist/server/index.js 42.8 kB",
            "[CI] ✔ CI/CD Artifact successfully uploaded.",
          ]
        : ["[CI] Skipped due to earlier test failure."],
    },
  ];

  const totalDurationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);
  const totalCostUsd = Number(steps.reduce((sum, s) => sum + s.costUsd, 0).toFixed(5));
  const activeSteps = steps.filter((s) => s.durationMs > 0);
  const avgCpuPercent = Math.round(
    activeSteps.reduce((sum, s) => sum + s.cpuPercent, 0) / (activeSteps.length || 1),
  );
  const peakMemoryMb = Math.max(...steps.map((s) => s.memoryMb), 0);

  return {
    id: `ci-${Math.random().toString(36).substring(2, 8)}`,
    commitSha,
    branch: "main",
    pipelineName: `DeVision Automated Build — ${stageName}`,
    status: isSuccess ? "passed" : "failed",
    totalDurationMs,
    totalCostUsd,
    avgCpuPercent,
    peakMemoryMb,
    steps,
  };
}
