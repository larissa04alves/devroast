"use client";

import { Field } from "@base-ui/react/field";
import { Switch } from "@base-ui/react/switch";
import { cn } from "@/lib/cn";

export interface ToggleProps {
  /** Label exibido ao lado do switch */
  label?: string;
  /** Estado controlado */
  checked: boolean;
  /** Callback quando o estado muda */
  onCheckedChange: (checked: boolean) => void;
  /** Desabilitar interação */
  disabled?: boolean;
  /** Nome para submit de formulário */
  name?: string;
  className?: string;
}

export function Toggle({
  label,
  checked,
  onCheckedChange,
  disabled,
  name,
  className,
}: ToggleProps) {
  return (
    <Field.Root className={cn("inline-flex items-center gap-3", className)}>
      <Field.Label
        className={cn(
          "inline-flex cursor-pointer select-none items-center gap-3",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        {/* Switch track */}
        <Switch.Root
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          name={name}
          className={cn(
            // track: w-10 h-[22px] rounded-[11px] padding 3px — fiel ao Pencil
            "relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-[11px] p-[3px]",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
            "bg-border-primary focus-visible:ring-border-primary",
            "data-[checked]:bg-accent-green data-[checked]:focus-visible:ring-accent-green",
            "data-[disabled]:cursor-not-allowed"
          )}
        >
          {/* knob 16x16 */}
          <Switch.Thumb
            className={cn(
              "block size-4 rounded-full transition-transform duration-200",
              "bg-text-secondary",
              "data-[checked]:translate-x-[18px] data-[checked]:bg-bg-page"
            )}
          />
        </Switch.Root>

        {/* label */}
        {label && (
          <span
            className="font-mono text-[12px] leading-none"
            // Base UI não propaga data-checked no label — cor via JS é necessária aqui
            style={{
              color: checked ? "var(--color-accent-green)" : "var(--color-text-secondary)",
            }}
          >
            {label}
          </span>
        )}
      </Field.Label>
    </Field.Root>
  );
}
