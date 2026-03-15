import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Badge, type BadgeVariants } from "./badge";

// ── Root ──────────────────────────────────────────────────────────────────────

export interface AnalysisCardRootProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Root({ className, children, ...props }: AnalysisCardRootProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-border-primary bg-transparent p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Badge (severity indicator) ────────────────────────────────────────────────

export interface AnalysisCardBadgeProps {
  variant: BadgeVariants["variant"];
}

function CardBadge({ variant }: AnalysisCardBadgeProps) {
  return (
    <Badge.Root variant={variant}>
      <Badge.Label>{variant ?? "good"}</Badge.Label>
    </Badge.Root>
  );
}

// ── Title ─────────────────────────────────────────────────────────────────────

export interface AnalysisCardTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

function Title({ className, children, ...props }: AnalysisCardTitleProps) {
  return (
    <p className={cn("font-mono text-[13px] leading-snug text-text-primary", className)} {...props}>
      {children}
    </p>
  );
}

// ── Description ───────────────────────────────────────────────────────────────

export interface AnalysisCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

function Description({ className, children, ...props }: AnalysisCardDescriptionProps) {
  return (
    <p
      className={cn("font-sans text-[12px] leading-relaxed text-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// ── Namespace export ──────────────────────────────────────────────────────────

export const AnalysisCard = {
  Root,
  Badge: CardBadge,
  Title,
  Description,
};
