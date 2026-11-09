import type { ReactNode } from "react";
import type { Route } from "next";
import { Link } from "@/i18n/navigation";
import { cn } from "@/ui/lib/utils";
import { previewFocusClassName } from "@/modules/preview";

export function PreviewTextLink({
  href,
  children,
}: {
  href: Route;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-sm text-sm font-semibold text-primary-600 underline-offset-4 hover:underline",
        previewFocusClassName,
      )}
    >
      {children}
    </Link>
  );
}
