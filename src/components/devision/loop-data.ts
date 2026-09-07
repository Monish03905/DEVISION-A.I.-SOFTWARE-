export type Stage = {
  id: string;
  index: string;
  name: string;
  headline: string;
  detail: string;
  file: string;
  log: { time: string; tag: string; tone: "info" | "ok" | "fault" | "work"; text: string }[];
  diff?: { sign: "-" | "+" | " "; text: string }[];
  metrics: { label: string; value: string }[];
};

export const stages: Stage[] = [
  {
    id: "see",
    index: "01",
    name: "See",
    headline: "Read the failure, not the summary",
    detail:
      "DeVision attaches to the running project on the Office Kit and captures the crash exactly as it happened: stack trace, failing request, the log lines around it, and the commit the environment is on.",
    file: "runtime/checkout.log",
    log: [
      { time: "09:41:02", tag: "LINK", tone: "info", text: "Paired with DeVision Office Kit over local network." },
      { time: "09:41:03", tag: "WATCH", tone: "info", text: "Attached to process node:checkout (pid 4471)." },
      { time: "09:41:07", tag: "FAULT", tone: "fault", text: "TypeError: cannot read 'total' of undefined" },
      { time: "09:41:07", tag: "FRAME", tone: "work", text: "src/lib/cart.ts:42 → applyDiscount()" },
    ],
    metrics: [
      { label: "Capture", value: "14ms" },
      { label: "Frames", value: "9" },
      { label: "Source", value: "Local" },
    ],
  },
  {
    id: "understand",
    index: "02",
    name: "Understand",
    headline: "Retrieve the project, then reason on-device",
    detail:
      "An open-source model running on the phone's NPU retrieves the files, tests, and past commits that actually touch the failing path, and states a root cause it can point at — not a guess about a library it never read.",
    file: "context/retrieval.index",
    log: [
      { time: "09:41:08", tag: "INDEX", tone: "info", text: "Retrieved 6 files, 2 tests, 3 related commits." },
      { time: "09:41:10", tag: "MODEL", tone: "info", text: "Inference local — qwen2.5-coder-7b on device NPU." },
      { time: "09:41:12", tag: "CAUSE", tone: "work", text: "applyDiscount() assumes a cart exists for guest sessions." },
      { time: "09:41:12", tag: "TRACE", tone: "ok", text: "Regression introduced in 8f2c1ad (guest checkout)." },
    ],
    metrics: [
      { label: "Context", value: "128k" },
      { label: "Egress", value: "0 KB" },
      { label: "Confidence", value: "0.91" },
    ],
  },
  {
    id: "fix",
    index: "03",
    name: "Fix",
    headline: "A patch scoped to the root cause",
    detail:
      "DeVision writes the smallest change that removes the cause, in the style of the surrounding code, and shows the diff on the phone for approval before anything is written to disk.",
    file: "src/lib/cart.ts",
    log: [
      { time: "09:41:14", tag: "PATCH", tone: "info", text: "Proposed 1 file changed, +3 −1." },
      { time: "09:41:14", tag: "GUARD", tone: "ok", text: "No public API signature altered." },
    ],
    diff: [
      { sign: " ", text: "export function applyDiscount(session: Session) {" },
      { sign: "-", text: "  return session.cart.total * (1 - session.discount);" },
      { sign: "+", text: "  const cart = session.cart ?? createGuestCart(session);" },
      { sign: "+", text: "  if (!cart.items.length) return 0;" },
      { sign: "+", text: "  return cart.total * (1 - session.discount);" },
      { sign: " ", text: "}" },
    ],
    metrics: [
      { label: "Files", value: "1" },
      { label: "Lines", value: "+3 −1" },
      { label: "Approval", value: "Phone" },
    ],
  },
  {
    id: "test",
    index: "04",
    name: "Test",
    headline: "Run it in the real environment",
    detail:
      "The patch is applied in the connected development environment and the suite runs there — same versions, same data, same machine. A fix that only compiles in a chat window never reaches this stage.",
    file: "ci/vitest.run",
    log: [
      { time: "09:41:19", tag: "APPLY", tone: "info", text: "Patch written to working tree." },
      { time: "09:41:22", tag: "TEST", tone: "work", text: "vitest run — 148 passed, 1 failed." },
      { time: "09:41:23", tag: "FAULT", tone: "fault", text: "guest cart total should be 0 → received NaN" },
      { time: "09:41:24", tag: "LOOP", tone: "info", text: "Returning to stage 02 with the new failure." },
    ],
    metrics: [
      { label: "Suite", value: "149" },
      { label: "Duration", value: "3.1s" },
      { label: "Iteration", value: "1 of 2" },
    ],
  },
  {
    id: "verify",
    index: "05",
    name: "Verify",
    headline: "Green, or it is not a fix",
    detail:
      "The loop repeats until the failing test passes and nothing else breaks. DeVision then reports what changed, why, and the evidence that the original failure is gone — or reports honestly that it could not close the loop.",
    file: "report/loop-0x921a.md",
    log: [
      { time: "09:41:31", tag: "PATCH", tone: "info", text: "Iteration 2 — guest cart total coerced to 0." },
      { time: "09:41:35", tag: "TEST", tone: "ok", text: "vitest run — 149 passed, 0 failed." },
      { time: "09:41:36", tag: "REPRO", tone: "ok", text: "Original crash no longer reproducible." },
      { time: "09:41:36", tag: "DONE", tone: "ok", text: "Loop closed. Report pushed to phone." },
    ],
    metrics: [
      { label: "Status", value: "GREEN" },
      { label: "Iterations", value: "2" },
      { label: "Wall time", value: "34s" },
    ],
  },
];
