"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/ui/components/button";
import { IntegrationList } from "./integration-list";
import { VtexConnectionForm } from "./vtex-connection-form";

export function IntegrationsPage() {
  const t = useTranslations("integrations");
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("title")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("description")}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("list.addVtex")}
        </Button>
      </div>

      <IntegrationList />

      <VtexConnectionForm
        open={showForm}
        onOpenChange={setShowForm}
        mode="create"
      />
    </div>
  );
}
