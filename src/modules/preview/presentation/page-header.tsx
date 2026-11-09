import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  /** Única acción principal de la vista. Un `Button` variant default. */
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className="flex items-center justify-between gap-4"
    >
      <h1 className="text-2xl font-bold leading-tight text-foreground">
        {title}
      </h1>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
