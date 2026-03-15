import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
  base: "flex items-start gap-2 px-4 py-2 font-mono text-[13px] leading-snug",
  variants: {
    variant: {
      // linha removida: bg vermelho escuro, prefix "-" vermelho, código muted
      removed: "bg-diff-removed",
      // linha adicionada: bg verde escuro, prefix "+" verde, código branco
      added: "bg-diff-added",
      // contexto: sem bg, prefix " " muted, código muted
      context: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixClasses: Record<"removed" | "added" | "context", string> = {
  removed: "text-accent-red",
  added: "text-accent-green",
  context: "text-text-tertiary",
};

const codeClasses: Record<"removed" | "added" | "context", string> = {
  removed: "text-text-secondary",
  added: "text-text-primary",
  context: "text-text-secondary",
};

const prefixChars: Record<"removed" | "added" | "context", string> = {
  removed: "-",
  added: "+",
  context: " ",
};

type DiffLineVariants = VariantProps<typeof diffLine>;

export interface DiffLineProps extends HTMLAttributes<HTMLDivElement>, DiffLineVariants {
  code: string;
  className?: string;
}

export function DiffLine({ variant = "context", code, className, ...props }: DiffLineProps) {
  const v = variant as "removed" | "added" | "context";

  return (
    <div className={diffLine({ variant, class: className })} {...props}>
      <span className={prefixClasses[v]} aria-hidden="true">
        {prefixChars[v]}
      </span>
      <span className={codeClasses[v]}>{code}</span>
    </div>
  );
}
