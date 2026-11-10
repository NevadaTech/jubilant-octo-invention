import type { ReactNode } from "react";
import { Sidebar } from "@/ui/layout/sidebar";
import { DashboardHeader } from "@/ui/layout/header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pt-14 lg:pt-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
