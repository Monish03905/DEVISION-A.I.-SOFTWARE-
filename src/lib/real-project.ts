export const realProject = {
  id: "devision-real-project",
  name: "DeVision source project",
  root: "C:\\Users\\monis\\OneDrive\\Desktop\\problem-solve-muse-main",
  moduleFile: "src/lib/loop-engine.ts",
  testCommand: "bun test",
  ciCommand: "bun run lint && bun run build",
  executionMode: "temporary-copy" as const,
};

export type RealProjectConfig = typeof realProject;