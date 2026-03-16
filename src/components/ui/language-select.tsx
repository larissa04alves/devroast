"use client";

import { Select } from "@base-ui/react/select";
import type { BundledLanguage } from "shiki";
import { cn } from "@/lib/cn";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/use-language-detection";

// Sentinel value used internally by the Select to represent "auto-detect"
const AUTO_VALUE = "__auto__";

export interface LanguageSelectProps {
  /** Currently detected/selected language. `null` means auto-detect is active. */
  value: BundledLanguage | null;
  onValueChange: (lang: BundledLanguage | null) => void;
  /** When true, shows a dot indicating manual override is active */
  isManual?: boolean;
  className?: string;
}

export function LanguageSelect({
  value,
  onValueChange,
  isManual = false,
  className,
}: LanguageSelectProps) {
  // Map null → sentinel string so Base UI Select works with a controlled string value
  const selectValue = value ?? AUTO_VALUE;

  function handleValueChange(v: string | null) {
    if (v === null || v === AUTO_VALUE) {
      onValueChange(null);
    } else {
      onValueChange(v as SupportedLanguage);
    }
  }

  return (
    <Select.Root value={selectValue} onValueChange={handleValueChange}>
      <Select.Trigger
        className={cn(
          "inline-flex items-center gap-1.5",
          "font-mono text-[12px] leading-none",
          "text-text-secondary border border-border-primary bg-transparent",
          "px-2.5 py-1.5",
          "cursor-pointer transition-colors duration-150",
          "enabled:hover:border-border-hover enabled:hover:text-text-primary",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus",
          "data-[popup-open]:border-border-hover data-[popup-open]:text-text-primary",
          className
        )}
        aria-label="linguagem de detecção"
      >
        {/* dot indicator when manually overridden */}
        {isManual && (
          <span className="size-1.5 rounded-full bg-accent-amber shrink-0" aria-hidden="true" />
        )}
        <Select.Value
          placeholder={<span className="text-text-tertiary italic">auto-detect</span>}
        />
        {/* chevron icon */}
        <Select.Icon>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
            className="shrink-0 opacity-50"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={4} align="start">
          <Select.Popup
            className={cn(
              "min-w-[140px] max-h-[240px] overflow-y-auto",
              "bg-bg-elevated border border-border-primary",
              "py-1",
              "outline-none",
              // entrance animation
              "origin-[var(--transform-origin)]",
              "transition-[opacity,scale] duration-100 ease-out",
              "data-[open]:opacity-100 data-[open]:scale-100",
              "data-[closed]:opacity-0 data-[closed]:scale-95"
            )}
          >
            {/* Auto-detect option — always first */}
            <Select.Item
              value={AUTO_VALUE}
              className={cn(
                "flex items-center gap-2",
                "px-3 py-1.5",
                "font-mono text-[12px] text-text-secondary",
                "cursor-pointer select-none outline-none",
                "transition-colors duration-100",
                "data-[highlighted]:bg-bg-surface data-[highlighted]:text-text-primary",
                "data-[selected]:text-accent-green"
              )}
            >
              <Select.ItemIndicator className="size-1.5 rounded-full bg-accent-green shrink-0 data-[hidden]:invisible" />
              <Select.ItemText>
                <span className="italic">auto-detect</span>
              </Select.ItemText>
            </Select.Item>

            {/* Divider */}
            <hr className="my-1 border-border-primary" />

            {SUPPORTED_LANGUAGES.map((lang) => (
              <Select.Item
                key={lang}
                value={lang}
                className={cn(
                  "flex items-center gap-2",
                  "px-3 py-1.5",
                  "font-mono text-[12px] text-text-secondary",
                  "cursor-pointer select-none outline-none",
                  "transition-colors duration-100",
                  "data-[highlighted]:bg-bg-surface data-[highlighted]:text-text-primary",
                  "data-[selected]:text-accent-green"
                )}
              >
                <Select.ItemIndicator className="size-1.5 rounded-full bg-accent-green shrink-0 data-[hidden]:invisible" />
                <Select.ItemText>{lang}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
