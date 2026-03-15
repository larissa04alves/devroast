"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Toggle } from "@/components/ui/toggle";

const PLACEHOLDER_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  // TODO: handle tax calculation
  // TODO: handle currency conversion
  return total
}`;

export function CodeInputArea() {
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [roastMode, setRoastMode] = useState(true);

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Code editor — 780px wide, 360px height */}
      <CodeEditor
        value={code}
        onValueChange={setCode}
        lang="javascript"
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

        {/* Right: roast button */}
        <Button variant="primary" size="md">
          roast_my_code
        </Button>
      </div>
    </div>
  );
}
