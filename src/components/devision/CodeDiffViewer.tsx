import { useState } from "react";

export type CodeDiffProps = {
  originalFile: string;
  originalCode: string;
  fixedFile: string;
  fixedCode: string;
  revisionLabel?: string;
};

export function CodeDiffViewer({
  originalFile,
  originalCode,
  fixedFile,
  fixedCode,
  revisionLabel = "Candidate Patch 02",
}: CodeDiffProps) {
  const [viewMode, setViewMode] = useState<"sideBySide" | "unified">("sideBySide");
  const [copied, setCopied] = useState(false);

  const origLines = originalCode.split("\n");
  const fixedLines = fixedCode.split("\n");
  const hasChanges = originalCode !== fixedCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-background shadow-rack">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            {revisionLabel}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {origLines.length} orig lines → {fixedLines.length} fixed lines
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex rounded border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("sideBySide")}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === "sideBySide"
                  ? "bg-accent/20 text-accent font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode("unified")}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === "unified"
                  ? "bg-accent/20 text-accent font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unified
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="border border-border-strong px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-accent"
          >
            {copied ? "Copied!" : "Copy Fix"}
          </button>
        </div>
      </div>

      {/* Code diff body */}
      {viewMode === "sideBySide" ? (
        <div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0 font-mono text-xs overflow-x-auto">
          {/* Left: Original Code File */}
          <div className="bg-background">
            <div className="flex items-center justify-between border-b border-border bg-fault/10 px-4 py-2 text-[11px] text-fault font-semibold">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-fault" />
                Original File: {originalFile}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">Buggy HEAD</span>
            </div>
            <div className="p-3 space-y-0.5 max-h-[380px] overflow-y-auto leading-relaxed">
              {origLines.map((line, idx) => {
                const isModified = hasChanges && line !== fixedLines[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                      isModified ? "bg-fault/15 text-fault font-medium" : "text-foreground/80"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-right text-[10px] text-muted-foreground/60 select-none">
                      {idx + 1}
                    </span>
                    <span className="w-4 shrink-0 text-center select-none">
                      {isModified ? "-" : " "}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Fixed Code File */}
          <div className="bg-background">
            <div className="flex items-center justify-between border-b border-border bg-accent/10 px-4 py-2 text-[11px] text-accent font-semibold">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Fixed File: {fixedFile}
              </span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">Patched Code</span>
            </div>
            <div className="p-3 space-y-0.5 max-h-[380px] overflow-y-auto leading-relaxed">
              {fixedLines.map((line, idx) => {
                const isAdded = hasChanges && line !== origLines[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                      isAdded ? "bg-accent/15 text-accent font-medium" : "text-foreground/80"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-right text-[10px] text-muted-foreground/60 select-none">
                      {idx + 1}
                    </span>
                    <span className="w-4 shrink-0 text-center select-none">
                      {isAdded ? "+" : " "}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="bg-background p-4 font-mono text-xs max-h-[380px] overflow-y-auto leading-relaxed space-y-0.5">
          <div className="text-muted-foreground text-[11px] mb-3 pb-2 border-b border-border">
            --- a/{originalFile} (Original)
            <br />
            +++ b/{fixedFile} (Fixed)
          </div>
          {origLines.map((line, idx) => (
            <div key={`orig-${idx}`} className="flex items-start gap-3 px-2 py-0.5 text-fault bg-fault/10 rounded">
              <span className="w-6 shrink-0 text-right text-[10px] opacity-60">{idx + 1}</span>
              <span className="w-4 shrink-0 text-center">-</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
          {fixedLines.map((line, idx) => (
            <div key={`fixed-${idx}`} className="flex items-start gap-3 px-2 py-0.5 text-accent bg-accent/10 rounded">
              <span className="w-6 shrink-0 text-right text-[10px] opacity-60">{idx + 1}</span>
              <span className="w-4 shrink-0 text-center">+</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
