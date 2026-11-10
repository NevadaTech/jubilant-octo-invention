"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReportTypeValue } from "@/modules/reports/application/dto/report.dto";
import { reportTypeToSlug } from "@/modules/reports/presentation/utils/report-utils";

interface ReportCardProps {
  type: ReportTypeValue;
  title: string;
  description: string;
  category: string;
  locale: string;
}

export function ReportCard({
  type,
  title,
  description,
  category,
  locale,
}: ReportCardProps) {
  const t = useTranslations("reports");
  const slug = reportTypeToSlug(type);
  const alert = type === "LOW_STOCK";

  return (
    <div
      data-testid="card"
      className={
        alert
          ? "rounded-xl border border-orange-200 bg-card"
          : "rounded-xl border border-border bg-card"
      }
    >
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={`/${locale}/dashboard/reports/${slug}` as any}
        className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <span className="min-w-0">
          <span
            data-testid="badge"
            className="mb-1 block text-xs font-semibold text-muted-foreground"
          >
            {t(`categories.${category}`)}
          </span>
          <span className="block text-base font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-semibold text-primary sm:inline-flex sm:h-9 sm:items-center sm:rounded-md sm:bg-primary sm:px-3 sm:text-sm sm:text-primary-foreground">
          {t("viewReport")}
        </span>
      </Link>
    </div>
  );
}
