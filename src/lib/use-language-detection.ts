"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";

// Supported languages: hljs ID → Shiki ID
// hljs IDs mostly match Shiki IDs; only edge cases need explicit mapping
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
  // edge cases where hljs ID ≠ shiki ID (none currently in this set)
};

export const SUPPORTED_LANGUAGES = Object.keys(HLJS_TO_SHIKI) as string[];

export type SupportedLanguage = BundledLanguage;

const MIN_RELEVANCE = 5;
const DEBOUNCE_MS = 500;
const MIN_CHARS = 20;

type HljsModule = typeof import("highlight.js/lib/core").default;

// Lazily initialized hljs instance (tree-shakeable subset)
let hljsPromise: Promise<HljsModule> | null = null;

function getHljs(): Promise<HljsModule> {
  if (!hljsPromise) {
    hljsPromise = (async () => {
      const [
        { default: hljs },
        { default: javascript },
        { default: typescript },
        { default: python },
        { default: rust },
        { default: go },
        { default: java },
        { default: c },
        { default: cpp },
        { default: csharp },
        { default: php },
        { default: ruby },
        { default: sql },
        { default: xml },
        { default: css },
        { default: bash },
        { default: json },
        { default: yaml },
        { default: markdown },
        { default: swift },
        { default: kotlin },
        { default: scala },
      ] = await Promise.all([
        import("highlight.js/lib/core"),
        import("highlight.js/lib/languages/javascript"),
        import("highlight.js/lib/languages/typescript"),
        import("highlight.js/lib/languages/python"),
        import("highlight.js/lib/languages/rust"),
        import("highlight.js/lib/languages/go"),
        import("highlight.js/lib/languages/java"),
        import("highlight.js/lib/languages/c"),
        import("highlight.js/lib/languages/cpp"),
        import("highlight.js/lib/languages/csharp"),
        import("highlight.js/lib/languages/php"),
        import("highlight.js/lib/languages/ruby"),
        import("highlight.js/lib/languages/sql"),
        import("highlight.js/lib/languages/xml"),
        import("highlight.js/lib/languages/css"),
        import("highlight.js/lib/languages/bash"),
        import("highlight.js/lib/languages/json"),
        import("highlight.js/lib/languages/yaml"),
        import("highlight.js/lib/languages/markdown"),
        import("highlight.js/lib/languages/swift"),
        import("highlight.js/lib/languages/kotlin"),
        import("highlight.js/lib/languages/scala"),
      ]);

      hljs.registerLanguage("javascript", javascript);
      hljs.registerLanguage("typescript", typescript);
      hljs.registerLanguage("python", python);
      hljs.registerLanguage("rust", rust);
      hljs.registerLanguage("go", go);
      hljs.registerLanguage("java", java);
      hljs.registerLanguage("c", c);
      hljs.registerLanguage("cpp", cpp);
      hljs.registerLanguage("csharp", csharp);
      hljs.registerLanguage("php", php);
      hljs.registerLanguage("ruby", ruby);
      hljs.registerLanguage("sql", sql);
      hljs.registerLanguage("xml", xml);
      hljs.registerLanguage("css", css);
      hljs.registerLanguage("bash", bash);
      hljs.registerLanguage("shell", bash); // alias
      hljs.registerLanguage("json", json);
      hljs.registerLanguage("yaml", yaml);
      hljs.registerLanguage("markdown", markdown);
      hljs.registerLanguage("swift", swift);
      hljs.registerLanguage("kotlin", kotlin);
      hljs.registerLanguage("scala", scala);

      return hljs;
    })();
  }
  return hljsPromise;
}

function detectWithHljs(hljs: HljsModule, code: string): BundledLanguage | null {
  const result = hljs.highlightAuto(code, Object.keys(HLJS_TO_SHIKI));
  if (!result.language || result.relevance < MIN_RELEVANCE) return null;
  return HLJS_TO_SHIKI[result.language] ?? null;
}

export interface UseLanguageDetectionReturn {
  /** Currently active language (detected or manually overridden) */
  lang: BundledLanguage;
  /** Whether the language was set manually by the user */
  isManual: boolean;
  /** Set language manually — suspends auto-detection */
  setLangManual: (lang: BundledLanguage) => void;
  /** Clear manual override and re-run detection on current code */
  clearManual: () => void;
}

export function useLanguageDetection(
  code: string,
  defaultLang: BundledLanguage = "javascript"
): UseLanguageDetectionReturn {
  const [lang, setLang] = useState<BundledLanguage>(defaultLang);
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
    setIsManual(false);
    // Re-run detection immediately on current code
    runDetection(code);
  }, [code, runDetection]);

  return { lang, isManual, setLangManual, clearManual };
}
