import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Score abaixo de 4 = vermelho, 4-6 = amber, acima = verde */
function scoreColor(score: number): string {
  if (score < 4) return "var(--color-accent-red)";
  if (score < 7) return "var(--color-accent-amber)";
  return "var(--color-accent-green)";
}

// ── Root ──────────────────────────────────────────────────────────────────────

export interface LeaderboardRowRootProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Root({ className, children, ...props }: LeaderboardRowRootProps) {
  return (
    <div
      className={cn("flex items-center gap-6 border-b border-border-primary px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Rank ──────────────────────────────────────────────────────────────────────

export interface LeaderboardRowRankProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

function Rank({ children, className, ...props }: LeaderboardRowRankProps) {
  return (
    <span
      className={cn("w-10 shrink-0 font-mono text-[13px] text-text-tertiary", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Score ─────────────────────────────────────────────────────────────────────

export interface LeaderboardRowScoreProps extends HTMLAttributes<HTMLSpanElement> {
  /** Valor numérico 0–10 — determina a cor automaticamente */
  value: number;
  className?: string;
}

function Score({ value, className, ...props }: LeaderboardRowScoreProps) {
  return (
    <span
      className={cn("w-[60px] shrink-0 font-mono text-[13px] font-bold", className)}
      style={{ color: scoreColor(value) }}
      {...props}
    >
      {value.toFixed(1)}
    </span>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

export interface LeaderboardRowPreviewProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

function Preview({ children, className, ...props }: LeaderboardRowPreviewProps) {
  return (
    <span
      className={cn("min-w-0 flex-1 truncate font-mono text-[12px] text-text-secondary", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Language ──────────────────────────────────────────────────────────────────

export interface LeaderboardRowLanguageProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

function Language({ children, className, ...props }: LeaderboardRowLanguageProps) {
  return (
    <span
      className={cn(
        "w-[100px] shrink-0 text-right font-mono text-[12px] text-text-tertiary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Namespace export ──────────────────────────────────────────────────────────

export const LeaderboardRow = { Root, Rank, Score, Preview, Language };
