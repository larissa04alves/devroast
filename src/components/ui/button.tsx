import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-mono font-medium leading-none",
    "transition-colors duration-150 cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
  ],
  variants: {
    variant: {
      // primaryBtn do Pencil: bg accent-green, text bg-page, font-medium
      primary: [
        "bg-accent-green text-bg-page font-medium",
        "enabled:hover:bg-accent-green-hover",
        "focus-visible:ring-accent-green",
      ],
      // secondaryBtn do Pencil: sem bg, borda border-primary, text text-primary, font-normal
      secondary: [
        "bg-transparent text-text-primary font-normal border border-border-primary",
        "enabled:hover:bg-bg-elevated enabled:hover:border-border-hover",
        "focus-visible:ring-border-primary",
      ],
      // linkBtn do Pencil: sem bg, borda border-primary, text text-secondary, font-normal
      link: [
        "bg-transparent text-text-secondary font-normal border border-border-primary",
        "enabled:hover:text-text-link-hover enabled:hover:border-border-hover",
        "focus-visible:ring-border-primary",
      ],
      ghost: [
        "bg-transparent text-text-primary font-normal",
        "enabled:hover:bg-bg-elevated",
        "focus-visible:ring-border-primary",
      ],
      destructive: [
        "bg-accent-red text-text-primary font-medium",
        "enabled:hover:bg-accent-red-hover",
        "focus-visible:ring-accent-red",
      ],
    },
    size: {
      // linkBtn: py-[6px] px-3
      sm: "py-[6px] px-3 text-[12px]",
      // primaryBtn/secondaryBtn: py-[10px]/py-[8px] — md usa o do primary como base
      md: "py-[10px] px-6 text-[13px]",
      // secondaryBtn usa padding menor — exposto como size="compact"
      compact: "py-2 px-4 text-[12px]",
      lg: "py-3.5 px-8 text-[15px]",
    },
    rounded: {
      none: "rounded-none",
      default: "rounded-md",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    rounded: "none",
  },
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "prefix">,
    ButtonVariants {
  /** Prefixo antes do label. Padrão: "$" para primary/secondary/link. Passe `false` para desativar. */
  prefix?: string | false;
  /** Sufixo exibido após o label (ex: ">>") */
  suffix?: string;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size,
  rounded,
  prefix,
  suffix,
  className,
  children,
  ...props
}: ButtonProps) {
  // Variantes que seguem o padrão "$ label" do Pencil por padrão
  const defaultPrefix =
    prefix === false
      ? null
      : (prefix ?? (variant === "primary" || variant === "secondary" || variant === "link"))
        ? "$"
        : null;

  return (
    <button className={button({ variant, size, rounded, class: className })} {...props}>
      {defaultPrefix && <span aria-hidden="true">{defaultPrefix}</span>}
      {children}
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </button>
  );
}
