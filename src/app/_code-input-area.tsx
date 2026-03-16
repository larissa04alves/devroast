"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { LanguageSelect } from "@/components/ui/language-select";
import { Toggle } from "@/components/ui/toggle";
import { useLanguageDetection } from "@/lib/use-language-detection";

export function CodeInputArea() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  const { lang, isManual, setLangManual, clearManual } = useLanguageDetection(code);

  function handleCodeChange(newCode: string) {
    setCode(newCode);
    // If the textarea is cleared, reset manual override
    if (newCode.trim() === "") clearManual();
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

        {/* Right: language selector + roast button */}
        <div className="flex items-center gap-3">
          <LanguageSelect value={lang} onValueChange={setLangManual} isManual={isManual} />
          <Button variant="primary" size="md">
            roast_my_code
          </Button>
        </div>
      </div>
    </div>
  );
}
