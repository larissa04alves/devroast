"use client";

import { useEffect, useRef, useState } from "react";
import { type BundledLanguage, createHighlighter } from "shiki";
import { cn } from "@/lib/cn";

const FALLBACK_LANG: BundledLanguage = "javascript";

export interface CodeEditorProps {
  value: string;
  onValueChange: (v: string) => void;
  /** Active language for syntax highlighting. `null` = not yet detected, falls back to plain text. */
  lang: BundledLanguage | null;
  placeholder?: string;
  className?: string;
}

// Larguras variadas para o skeleton simular linhas de código
const SKELETON_LINES = ["w-3/4", "w-1/2", "w-5/6", "w-2/5", "w-3/5", "w-4/6", "w-1/3", "w-2/3"];

function CodeSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse" aria-hidden="true">
      {SKELETON_LINES.map((w, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: ordem fixa, sem reordenação
        <div key={i} className={cn("h-3 rounded-sm bg-bg-elevated", w)} />
      ))}
    </div>
  );
}

export function CodeEditor({
  value,
  onValueChange,
  lang,
  placeholder,
  className,
}: CodeEditorProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const highlighterRef = useRef<Awaited<ReturnType<typeof createHighlighter>> | null>(null);

  // Resolve the effective language — fall back to FALLBACK_LANG when null (not yet detected)
  const effectiveLang = lang ?? FALLBACK_LANG;

  // Refs to access current value/lang inside the init effect without adding them as deps
  const effectiveLangRef = useRef(effectiveLang);
  const valueRef = useRef(value);
  effectiveLangRef.current = effectiveLang;
  valueRef.current = value;

  // Inicializa o highlighter uma única vez no mount
  useEffect(() => {
    let cancelled = false;

    createHighlighter({
      themes: ["vesper"],
      langs: [effectiveLangRef.current],
    }).then((hl) => {
      if (cancelled) return;
      highlighterRef.current = hl;
      setHighlighted(
        hl.codeToHtml(valueRef.current, { lang: effectiveLangRef.current, theme: "vesper" })
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Atualiza o highlight a cada mudança de value ou lang.
  // Carrega o lang dinamicamente se ainda não estiver registrado no highlighter.
  useEffect(() => {
    const hl = highlighterRef.current;
    if (!hl) return;

    const loaded = hl.getLoadedLanguages();
    if (!loaded.includes(effectiveLang)) {
      hl.loadLanguage(effectiveLang).then(() => {
        setHighlighted(hl.codeToHtml(value, { lang: effectiveLang, theme: "vesper" }));
      });
    } else {
      setHighlighted(hl.codeToHtml(value, { lang: effectiveLang, theme: "vesper" }));
    }
  }, [value, effectiveLang]);

  const lines = value.split("\n");
  const lineCount = Math.max(value === "" ? 1 : lines.length, 8);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border-primary bg-bg-input",
        className
      )}
    >
      {/* ── Window header: dots ── */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border-primary px-4">
        <span className="size-3 rounded-full bg-accent-red" aria-hidden="true" />
        <span className="size-3 rounded-full bg-accent-amber" aria-hidden="true" />
        <span className="size-3 rounded-full bg-accent-green" aria-hidden="true" />
      </div>

      {/* ── Corpo: números de linha + editor ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Números de linha */}
        <div
          className="flex flex-col items-end gap-2 bg-bg-surface border-r border-border-primary px-3 py-4 select-none shrink-0"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: ordem fixa, sem reordenação
              key={i}
              className="font-mono text-[12px] leading-5 text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Área de edição — highlight + textarea sobrepostos */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
          {highlighted === null ? (
            /* Skeleton enquanto o Shiki inicializa */
            <CodeSkeleton />
          ) : (
            /* HTML do Shiki — pointer-events-none, aria-hidden */
            <div
              className={cn(
                "pointer-events-none select-none",
                // sobrescreve o <pre> gerado pelo Shiki
                "[&>pre]:m-0 [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:leading-5",
                "[&>pre]:bg-transparent! [&>pre]:min-h-full",
                // evita scroll horizontal — linhas longas quebram
                "[&>pre]:overflow-x-hidden [&>pre]:whitespace-pre-wrap [&>pre]:break-all"
              )}
              aria-hidden="true"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: gerado pelo Shiki, sem input direto do usuário no HTML
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          )}

          {/* Textarea transparente — captura o input do usuário */}
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "absolute inset-0 w-full h-full resize-none",
              "bg-transparent font-mono text-[13px] leading-5",
              "p-4 text-transparent",
              "outline-none border-none",
              "overflow-hidden whitespace-pre-wrap break-all",
              // cursor verde do tema
              "[caret-color:var(--color-accent-green)]",
              // placeholder styling — visible only when empty
              "placeholder:text-text-tertiary placeholder:text-opacity-60"
            )}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="código"
          />
        </div>
      </div>
    </div>
  );
}
