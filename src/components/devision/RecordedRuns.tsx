import { Link } from "@tanstack/react-router";

import { clearRuns, useCycleRuns } from "./run-store";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RecordedRuns() {
  const runs = useCycleRuns();

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="label-micro">Recorded runs</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Cycles you started from the overview console
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/runs"
            className="border border-accent bg-accent/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/20"
          >
            Run details
          </Link>
          {runs.length > 0 ? (
          <button
            type="button"
            onClick={clearRuns}
            className="border border-border-strong px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
          ) : null}
        </div>
      </div>

      {runs.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">
          No runs recorded yet. Press “Start cycle” on the overview to run all five stages and log
          the result here.
        </p>
      ) : (
        <ul>
          {runs.map((run) => (
            <li
              key={run.id}
              className="grid grid-cols-2 gap-3 border-b border-border px-5 py-4 font-mono text-xs last:border-b-0 sm:grid-cols-4"
            >
              <Link to="/runs" className="text-foreground hover:text-accent">
                {run.id}
              </Link>
              <span className="text-muted-foreground">{formatTime(run.startedAt)}</span>
              <span className="text-muted-foreground">
                {(run.durationMs / 1000).toFixed(1)}s · {run.iterations} iter
              </span>
              <span className={run.outcome === "green" ? "text-accent" : "text-fault"}>
                {run.outcome === "green" ? "GREEN" : "ESCALATED"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
