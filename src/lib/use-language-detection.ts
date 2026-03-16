"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";

// Supported languages: hljs ID → Shiki ID
const HLJS_TO_SHIKI: Record<string, BundledLanguage> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  rust: "rust",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  sql: "sql",
  html: "html",
  css: "css",
  bash: "bash",
  shell: "bash",
  xml: "xml",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  r: "r",
  perl: "perl",
  lua: "lua",
};

export const SUPPORTED_LANGUAGES = Object.keys(HLJS_TO_SHIKI).filter(
  (l) => l !== "shell" // deduplica o alias
) as string[];

export type SupportedLanguage = BundledLanguage;

const MIN_RELEVANCE = 3;
const DEBOUNCE_MS = 400;
const MIN_CHARS = 15;

// Lazily load the full hljs bundle — runs only on the client, so bundle size is not a concern.
// Using the full build avoids Turbopack chunk-splitting issues with granular ES language imports.
let hljsPromise: Promise<typeof import("highlight.js").default> | null = null;

function getHljs() {
  if (!hljsPromise) {
    hljsPromise = import("highlight.js").then((m) => m.default);
  }
  return hljsPromise;
}

function detectWithHljs(
  hljs: Awaited<ReturnType<typeof getHljs>>,
  code: string
): BundledLanguage | null {
  const candidates = Object.keys(HLJS_TO_SHIKI);
  const result = hljs.highlightAuto(code, candidates);
  if (!result.language || (result.relevance ?? 0) < MIN_RELEVANCE) return null;
  return HLJS_TO_SHIKI[result.language] ?? null;
}

export interface UseLanguageDetectionReturn {
  /**
   * The language to use for highlighting.
   * `null` means "not yet detected" — callers should fall back to a safe default.
   */
  lang: BundledLanguage | null;
  /** Whether the language was set manually by the user */
  isManual: boolean;
  /** Set language manually — suspends auto-detection */
  setLangManual: (lang: BundledLanguage) => void;
  /** Clear manual override and reset to auto-detect */
  clearManual: () => void;
}

export function useLanguageDetection(code: string): UseLanguageDetectionReturn {
  const [lang, setLang] = useState<BundledLanguage | null>(null);
  const [isManual, setIsManual] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runDetection = useCallback(async (text: string) => {
    if (text.trim().length < MIN_CHARS) return;
    const hljs = await getHljs();
    const detected = detectWithHljs(hljs, text);
    if (detected) setLang(detected);
  }, []);

  // Debounced auto-detection — skipped when user has overridden manually
  useEffect(() => {
    if (isManual) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runDetection(code);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, isManual, runDetection]);

  const setLangManual = useCallback((newLang: BundledLanguage) => {
    setLang(newLang);
    setIsManual(true);
  }, []);

  const clearManual = useCallback(() => {
    setLang(null);
    setIsManual(false);
    runDetection(code);
  }, [code, runDetection]);

  return { lang, isManual, setLangManual, clearManual };
}
