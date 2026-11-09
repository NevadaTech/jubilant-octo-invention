import type { ReactNode } from "react";

export default function AccesoPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-background text-foreground">
      {children}
    </div>
  );
}
