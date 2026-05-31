"use client";
import { Suspense } from "react";
import LangSwitch from "@/src/components/navigation/LangSwitch";
import ThemeToggle from "@/src/components/navigation/ThemeToggle";

export default function HeaderControls() {
  return (
    <div className="flex items-center gap-1 text-md">
      <Suspense fallback={null}>
        <LangSwitch />
      </Suspense>
      <ThemeToggle />
    </div>
  );
}
