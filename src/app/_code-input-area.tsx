"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { LanguageSelect } from "@/components/ui/language-select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";
import { useLanguageDetection } from "@/lib/use-language-detection";

const MAX_LINES = 1500;

export function CodeInputArea() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  const { lang, isManual, setLangManual, clearManual } = useLanguageDetection(code);

  const lineCount = code === "" ? 0 : code.split("\n").length;
  const ratio = lineCount / MAX_LINES;
  const isAtLimit = lineCount >= MAX_LINES;
  const isNearLimit = ratio >= 0.8;

  function handleCodeChange(newCode: string) {
    // Hard-block: reject input that would exceed the limit
    if (newCode.split("\n").length > MAX_LINES) return;
    setCode(newCode);
    if (newCode.trim() === "") clearManual();
  }

  function handleLangChange(newLang: typeof lang) {
    if (newLang === null) {
      clearManual();
    } else {
      setLangManual(newLang);
    }
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Code editor — 780px wide, 360px height */}
      <CodeEditor
        value={code}
        onValueChange={handleCodeChange}
        lang={lang}
        placeholder="// paste your code here..."
        className="w-[780px] h-[360px]"
      />

      {/* Actions bar — 780px wide */}
      <div className="flex w-[780px] items-center justify-between border border-t-0 border-border-primary bg-bg-surface px-4 py-3">
        {/* Left: toggle + hint */}
        <div className="flex items-center gap-3">
          <Toggle label="roast mode" checked={roastMode} onCheckedChange={setRoastMode} />
          <span className="font-mono text-[12px] text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>

        {/* Right: line counter + language selector + roast button */}
        <div className="flex items-center gap-3">
          {/* Line limit indicator — only shown once the user starts typing */}
          {lineCount > 0 && (
            <span
              className={cn(
                "font-mono text-[11px] tabular-nums transition-colors duration-200",
                isAtLimit
                  ? "text-accent-red"
                  : isNearLimit
                    ? "text-accent-amber"
                    : "text-text-tertiary"
              )}
              aria-live="polite"
            >
              <span className="sr-only">
                {lineCount} de {MAX_LINES} linhas
              </span>
              <span aria-hidden="true">
                {lineCount}
                <span className="text-text-tertiary">/{MAX_LINES}</span>
              </span>
            </span>
          )}

          <LanguageSelect value={lang} onValueChange={handleLangChange} isManual={isManual} />
          <Button variant="primary" size="md" disabled={isAtLimit || lineCount === 0}>
            roast_my_code
          </Button>
        </div>
      </div>
    </div>
  );
}
