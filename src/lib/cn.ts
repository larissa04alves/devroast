import { twMerge } from "tailwind-merge";

/** Merge de classes Tailwind sem conflitos */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
