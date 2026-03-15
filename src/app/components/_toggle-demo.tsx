"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

export function ToggleDemo() {
  const [roastMode, setRoastMode] = useState(true);
  const [brutality, setBrutality] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <Toggle checked={roastMode} onCheckedChange={setRoastMode} label="roast mode" />
      <Toggle checked={brutality} onCheckedChange={setBrutality} label="full brutality" />
      <Toggle checked={false} onCheckedChange={() => {}} label="disabled" disabled />
    </div>
  );
}
