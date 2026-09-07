import { useEffect, useState } from "react";
import { getUpcomingCycles, type ScheduledCycle } from "./planner-store";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CycleCountdown() {
  const [upcoming, setUpcoming] = useState<ScheduledCycle | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(180);

  useEffect(() => {
    const list = getUpcomingCycles();
    if (list.length > 0) setUpcoming(list[0]!);

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 180 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((180 - secondsLeft) / 180) * 100;

  return (
    <div className="flex flex-col gap-6 border border-border bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-8 shadow-rack">
      <div>
        <p className="label-micro">Next Scheduled Cycle</p>
        <h3 className="mt-2 font-mono text-lg font-bold text-foreground">
          {upcoming ? upcoming.title : "No real project cycle scheduled"}
        </h3>
        <p
          className="mt-3 font-mono text-5xl font-extrabold tracking-tight text-accent lg:text-6xl"
          aria-live="polite"
        >
          {pad(minutes)}:{pad(seconds)}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Window: {upcoming ? `${upcoming.startTime} – ${upcoming.endTime}` : "09:00 – 18:00"} · Target:{" "}
          <span className="text-foreground font-semibold">{upcoming ? upcoming.moduleName : "src/lib/cart.ts"}</span>
        </p>
      </div>

      <div className="w-full md:max-w-sm">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Cycle Window Progress</span>
          <span className="text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-1.5 overflow-hidden bg-surface-2">
          <div
            className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-px bg-border">
          {[
            { label: "Interval", value: upcoming ? `${upcoming.intervalMinutes}m` : "15m" },
            { label: "Est. Cost", value: upcoming ? `$${upcoming.estimatedCostUsd}` : "$0.0014" },
            { label: "Pipeline", value: upcoming ? upcoming.targetPipeline.split(" ")[0]! : "GitHub" },
          ].map((item) => (
            <div key={item.label} className="bg-background px-3 py-3">
              <p className="label-micro">{item.label}</p>
              <p className="mt-2 font-mono text-xs font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
