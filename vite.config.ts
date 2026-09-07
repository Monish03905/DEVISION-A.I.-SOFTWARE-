import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { realProject } from "./src/lib/real-project";

const execFileAsync = promisify(execFile);

async function runCommand(command: string, cwd: string) {
  const startedAt = performance.now();
  const [executable, ...args] = command.split(" ");
  try {
    const result = await execFileAsync(executable, args, {
      cwd,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 4,
      shell: true,
    });
    return { ...result, exitCode: 0, durationMs: performance.now() - startedAt };
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? "",
      exitCode: typeof failure.code === "number" ? failure.code : 1,
      durationMs: performance.now() - startedAt,
    };
  }
}

async function runProjectStage(body: { stage: number; iteration: number; revision: number; cycleId: string }) {
  const projectRoot = resolve(realProject.root);
  const temporaryRoot = await mkdtemp(join(tmpdir(), "devision-cycle-"));
  const temporaryProject = join(temporaryRoot, "project");
  const sourcePath = join(projectRoot, realProject.moduleFile);

  try {
    await cp(projectRoot, temporaryProject, {
      recursive: true,
      filter: (source) => !["node_modules", ".git", "dist"].includes(source.split(/[\\/]/).pop() ?? ""),
    });
    await symlink(join(projectRoot, "node_modules"), join(temporaryProject, "node_modules"), "junction");
    const originalCode = await readFile(sourcePath, "utf8");
    const command = body.stage >= 3 ? realProject.ciCommand : realProject.testCommand;
    const result = await runCommand(command, temporaryProject);
    const output = `${result.stdout}\n${result.stderr}`.split(/\r?\n/).filter(Boolean).slice(-80);
    const passed = result.exitCode === 0;
    const next = body.stage < 4 ? { ...body, stage: body.stage + 1 } : null;

    return {
      project: realProject,
      file: realProject.moduleFile,
      originalFile: realProject.moduleFile,
      fixedFile: realProject.moduleFile,
      originalCode,
      fixedCode: originalCode,
      output,
      passed,
      durationMs: Math.round(result.durationMs),
      cpuPercent: Math.min(100, Math.max(1, Math.round(result.durationMs / 50))),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      costUsd: Number((result.durationMs * 0.000001).toFixed(5)),
      exitCode: result.exitCode,
      next,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function realProjectApi() {
  return {
    name: "devision-real-project-api",
    configureServer(server: { middlewares: { use: (middleware: unknown) => void } }) {
      server.middlewares.use(async (request: any, response: any, next: () => void) => {
        if (request.url?.split("?")[0] !== "/api/devision/project-stage") {
          next();
          return;
        }
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end("Method Not Allowed");
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of request) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const result = await runProjectStage(body);
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify(result));
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Project stage failed." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    realProjectApi(),
    tsconfigPaths(),
    tailwindcss(),
    TanStackRouterVite(),
    react(),
  ],
});
