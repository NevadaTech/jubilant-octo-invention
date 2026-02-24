"use client";

import { useTranslations } from "next-intl";
import {
  Check,
  FileEdit,
  CheckCircle2,
  PackageSearch,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/ui/lib/utils";
import type { SaleStatus } from "../../domain/entities/sale.entity";
import styles from "./sale-timeline.module.css";

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  date?: Date | null;
  byName?: string | null;
  isActive: boolean;
  isCompleted: boolean;
  isCancelled?: boolean;
}

interface SaleTimelineProps {
  status: SaleStatus;
  pickingEnabled: boolean;
  createdAt: Date;
  createdByName: string | null;
  confirmedAt: Date | null;
  confirmedByName: string | null;
  pickedAt: Date | null;
  pickedByName: string | null;
  shippedAt: Date | null;
  shippedByName: string | null;
  completedAt: Date | null;
  completedByName: string | null;
  cancelledAt: Date | null;
  cancelledByName: string | null;
}

export function SaleTimeline({
  status,
  pickingEnabled,
  createdAt,
  createdByName,
  confirmedAt,
  confirmedByName,
  pickedAt,
  pickedByName,
  shippedAt,
  shippedByName,
  completedAt,
  completedByName,
  cancelledAt,
  cancelledByName,
}: SaleTimelineProps) {
  const t = useTranslations("sales");

  const statusOrder: SaleStatus[] = pickingEnabled
    ? ["DRAFT", "CONFIRMED", "PICKING", "SHIPPED", "COMPLETED"]
    : ["DRAFT", "CONFIRMED"];

  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === "CANCELLED";
  const isTerminal = status === "COMPLETED" || isCancelled;

  const getSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        key: "DRAFT",
        label: t("timeline.draft"),
        description: t("timeline.draftDescription"),
        date: createdAt,
        byName: createdByName,
        isActive: status === "DRAFT",
        isCompleted: currentIndex > 0 || isCancelled,
      },
      {
        key: "CONFIRMED",
        label: t("timeline.confirmed"),
        description: t("timeline.confirmedDescription"),
        date: confirmedAt,
        byName: confirmedByName,
        isActive: status === "CONFIRMED",
        isCompleted: currentIndex > 1,
      },
    ];

    if (pickingEnabled) {
      steps.push(
        {
          key: "PICKING",
          label: t("timeline.picking"),
          description: t("timeline.pickingDescription"),
          date: pickedAt,
          byName: pickedByName,
          isActive: status === "PICKING",
          isCompleted: currentIndex > 2,
        },
        {
          key: "SHIPPED",
          label: t("timeline.shipped"),
          description: t("timeline.shippedDescription"),
          date: shippedAt,
          byName: shippedByName,
          isActive: status === "SHIPPED",
          isCompleted: currentIndex > 3,
        },
        {
          key: "COMPLETED",
          label: t("timeline.completed"),
          description: t("timeline.completedDescription"),
          date: completedAt,
          byName: completedByName,
          isActive: false,
          isCompleted: status === "COMPLETED",
        },
      );
    }

    if (isCancelled) {
      const lastCompletedIdx = steps.findIndex((s) => !s.isCompleted);
      if (lastCompletedIdx >= 0) {
        steps.splice(lastCompletedIdx);
      }
      steps.push({
        key: "CANCELLED",
        label: t("timeline.cancelled"),
        description: t("timeline.cancelledDescription"),
        date: cancelledAt,
        byName: cancelledByName,
        isActive: false,
        isCompleted: false,
        isCancelled: true,
      });
    }

    return steps;
  };

  const steps = getSteps();

  const getIcon = (step: TimelineStep) => {
    if (step.isCancelled) {
      return <XCircle className="h-5 w-5" />;
    }
    if (step.isCompleted) {
      return <Check className="h-5 w-5" />;
    }
    if (step.isActive) {
      switch (step.key) {
        case "DRAFT":
          return <FileEdit className="h-5 w-5" />;
        case "CONFIRMED":
          return <CheckCircle2 className="h-5 w-5" />;
        case "PICKING":
          return <PackageSearch className="h-5 w-5" />;
        case "SHIPPED":
          return <Truck className="h-5 w-5" />;
        case "COMPLETED":
          return <PackageCheck className="h-5 w-5" />;
        default:
          return <FileEdit className="h-5 w-5" />;
      }
    }
    return <div className="h-2 w-2 rounded-full bg-current" />;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="relative">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;
          const shouldAnimateConnector =
            step.isActive && !isTerminal && !isLastStep;

          return (
            <div key={step.key} className="relative flex gap-4">
              {/* Connector line */}
              {!isLastStep && (
                <div className="absolute left-[15px] top-[30px] h-[calc(100%+8px)] w-0.5">
                  <div
                    className={cn(
                      "h-full w-full",
                      step.isCompleted
                        ? "bg-primary"
                        : step.isCancelled
                          ? "bg-red-500"
                          : "bg-muted",
                    )}
                  />
                  {shouldAnimateConnector && (
                    <div
                      className={cn(
                        "absolute inset-0 w-full rounded-full",
                        styles.connectorAnimated,
                      )}
                    />
                  )}
                </div>
              )}

              {/* Icon */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                {step.isActive && !isTerminal && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full border-2 border-primary",
                      styles.pulseRing,
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    step.isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : step.isActive
                        ? "border-primary bg-background text-primary"
                        : step.isCancelled
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-muted bg-background text-muted-foreground",
                  )}
                >
                  {getIcon(step)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      "font-medium",
                      step.isActive
                        ? "text-primary"
                        : step.isCancelled
                          ? "text-red-500"
                          : step.isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.date && (
                    <span className="text-sm text-muted-foreground">
                      {formatDate(step.date)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.byName && (
                  <p className="text-xs text-muted-foreground">
                    {t("detail.by")} {step.byName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
