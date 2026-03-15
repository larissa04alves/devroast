import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const badgeRoot = tv({
  base: "inline-flex items-center gap-2",
  variants: {
    variant: {
      critical: "[&>span:first-child]:bg-accent-red text-accent-red",
      warning: "[&>span:first-child]:bg-accent-amber text-accent-amber",
      good: "[&>span:first-child]:bg-accent-green text-accent-green",
      verdict: "[&>span:first-child]:bg-accent-red text-accent-red text-[13px]",
    },
  },
  defaultVariants: {
    variant: "good",
  },
});

type BadgeVariants = VariantProps<typeof badgeRoot>;

export interface BadgeRootProps extends HTMLAttributes<HTMLSpanElement>, BadgeVariants {
  className?: string;
}

function Root({ variant, className, children, ...props }: BadgeRootProps) {
  return (
    <span className={badgeRoot({ variant, class: className })} {...props}>
      {/* dot decorativo — sempre presente */}
      <span className="block size-2 rounded-full" aria-hidden="true" />
      {children}
    </span>
  );
}

export interface BadgeLabelProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

function Label({ className, children, ...props }: BadgeLabelProps) {
  return (
    <span className={cn("font-mono text-[12px] leading-none", className)} {...props}>
      {children}
    </span>
  );
}

export const Badge = { Root, Label };
export type { BadgeVariants };
