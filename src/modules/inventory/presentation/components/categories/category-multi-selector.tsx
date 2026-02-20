"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import { useCategories } from "../../hooks/use-categories";

interface CategoryMultiSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function CategoryMultiSelector({
  value,
  onChange,
  disabled = false,
}: CategoryMultiSelectorProps) {
  const t = useTranslations("inventory.categories");
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useCategories({ limit: 100, isActive: true });

  const allCategories = data?.data ?? [];
  const selected = allCategories.filter((c) => value.includes(c.id));
  const available = allCategories.filter((c) => !value.includes(c.id));

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const handleAdd = (id: string) => {
    onChange([...value, id]);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected badges */}
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {selected.map((cat) => (
          <Badge key={cat.id} variant="secondary" className="gap-1 pr-1">
            {cat.name}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(cat.id)}
                className="ml-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {selected.length === 0 && !open && (
          <span className="text-sm text-muted-foreground">{t("selector.none")}</span>
        )}
      </div>

      {/* Add dropdown */}
      {!disabled && available.length > 0 && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? t("selector.loading") : t("selector.add")}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-popover shadow-md">
              <ul className="max-h-48 overflow-y-auto py-1">
                {available.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(cat.id)}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Click-away overlay */}
          {open && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
