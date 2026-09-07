import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  addScheduledCycle,
  clearScheduledCycles,
  deleteScheduledCycle,
  updateCycleStatus,
  useScheduledCycles,
  type ScheduledCycle,
} from "@/components/devision/planner-store";
import { realProject } from "@/lib/real-project";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Cycle Planner — DeVision Scheduled Diagnostics" },
      {
        name: "description",
        content:
          "Schedule automated DeVision repair and maintenance cycles: set start and end times, cycle intervals, target codebase modules, and budget limits.",
      },
      { property: "og:title", content: "Cycle Planner — DeVision Scheduled Diagnostics" },
      {
        property: "og:description",
        content:
          "Schedule diagnostic cycles with custom start/end times and monitor upcoming automated code repair runs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/planner" },
    ],
    links: [{ rel: "canonical", href: "/planner" }],
  }),
  component: PlannerPage,
});

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PlannerPage() {
  const cycles = useScheduledCycles();

  // Form State
  const [title, setTitle] = useState("");
  const [moduleName, setModuleName] = useState(realProject.moduleFile);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [targetPipeline, setTargetPipeline] = useState(realProject.ciCommand);
  const [estimatedCostUsd, setEstimatedCostUsd] = useState(0.0015);
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addScheduledCycle({
      title,
      moduleName,
      startTime,
      endTime,
      intervalMinutes,
      status: "active",
      targetPipeline,
      estimatedCostUsd,
    });

    setTitle("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
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
              <Link to="/runs" className="transition-colors hover:text-accent">
                Runs
              </Link>
              <Link to="/planner" className="text-accent">
                Planner
              </Link>
            </nav>
          </div>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            planner online
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label-micro">Automation & Scheduling</p>
            <h1 className="mt-4 max-w-[34ch] text-balance font-mono text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
              CYCLE PLANNER & AUTOMATED SCHEDULES.
            </h1>
            <p className="mt-4 max-w-[62ch] text-sm text-muted-foreground">
              Schedule recurring diagnostic loops for your codebase. Define window start and end
              times, runner intervals, and CI pipelines to continuously detect regressions before
              they reach users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex h-11 items-center bg-accent px-6 font-mono text-xs font-bold text-accent-foreground transition-all hover:brightness-110"
          >
            + SCHEDULE NEW CYCLE
          </button>
        </div>

        {/* Modal form */}
        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl border border-border bg-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="font-mono text-lg font-bold">Schedule Diagnostic Cycle</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  [CLOSE]
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-6 space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1">Cycle Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nightly Auth Regression Audit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1">Target Code Module</label>
                    <select
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value={realProject.moduleFile}>{realProject.moduleFile}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">CI Pipeline</label>
                    <input
                      type="text"
                      value={targetPipeline}
                      onChange={(e) => setTargetPipeline(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Interval (Mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={720}
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                      className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Estimated Cost / Cycle ($)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={estimatedCostUsd}
                    onChange={(e) => setEstimatedCostUsd(Number(e.target.value))}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="border border-border-strong px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-accent px-5 py-2 font-bold text-accent-foreground hover:brightness-110"
                  >
                    Save Scheduled Cycle
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Scheduled Cycles List */}
        <div className="mt-10 border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <p className="label-micro">Active & Planned Schedules</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {cycles.length} scheduled cycle configuration{cycles.length === 1 ? "" : "s"}
              </p>
            </div>

            {cycles.length > 0 ? (
              <button
                type="button"
                onClick={clearScheduledCycles}
                className="border border-border-strong px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
            ) : null}
          </div>

          {cycles.length === 0 ? (
            <div className="p-12 text-center font-mono text-sm text-muted-foreground">
              No cycles scheduled yet. Click “+ SCHEDULE NEW CYCLE” above to create your first scheduled diagnostic run.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cycles.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 p-6 transition-colors hover:bg-background lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-2 rounded-full ${
                          c.status === "active"
                            ? "bg-accent animate-pulse"
                            : c.status === "paused"
                              ? "bg-fault"
                              : "bg-signal"
                        }`}
                      />
                      <h3 className="font-mono text-base font-bold text-foreground">{c.title}</h3>
                      <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.status}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-muted-foreground">
                      Module: <strong className="text-foreground">{c.moduleName}</strong> · Pipeline:{" "}
                      <strong className="text-accent">{c.targetPipeline}</strong>
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground/80">
                      Window: {c.startTime} – {c.endTime} · Interval: Every {c.intervalMinutes} mins ·
                      Next Run: {fmtTime(c.nextRunAt)} · Est Cost: ${c.estimatedCostUsd}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        updateCycleStatus(
                          c.id,
                          c.status === "active" ? "paused" : "active",
                        )
                      }
                      className={`border px-3 py-1.5 uppercase text-[10px] font-bold tracking-wider transition-colors ${
                        c.status === "active"
                          ? "border-fault/40 text-fault hover:bg-fault/10"
                          : "border-accent/40 text-accent hover:bg-accent/10"
                      }`}
                    >
                      {c.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteScheduledCycle(c.id)}
                      className="border border-border-strong px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
