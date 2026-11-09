"use client";

import type { ReactNode } from "react";
import { PreviewHeader } from "./preview-header";
import { PreviewSidebar } from "./preview-sidebar";
import { previewFontFamily } from "./typography";

export function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot="preview-shell"
      className="min-h-screen bg-background text-foreground antialiased"
      style={{ fontFamily: previewFontFamily }}
    >
      <PreviewSidebar />
      <div className="min-w-0 pl-[240px]">
        <PreviewHeader />
        <main data-slot="preview-main" className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
