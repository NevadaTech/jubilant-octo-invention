"use client";

import { useTranslations } from "next-intl";
import { Check, FileEdit, Truck, XCircle, Package, Ban } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

interface TimelineStep {
  status: TransferStatus | "CREATED";
  label: string;
  description: string;
  date?: Date | null;
  isActive: boolean;
  isCompleted: boolean;
  isCanceled?: boolean;
  isRejected?: boolean;
}

interface TransferTimelineProps {
  status: TransferStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export function TransferTimeline({
  status,
  createdAt,
  completedAt,
}: TransferTimelineProps) {
  const t = useTranslations("inventory.transfers");

  const getSteps = (): TimelineStep[] => {
    const isCanceled = status === "CANCELED";
    const isRejected = status === "REJECTED";
    const isReceived = status === "RECEIVED" || status === "PARTIAL";

    const steps: TimelineStep[] = [
      {
        status: "CREATED",
        label: t("timeline.created"),
        description: t("timeline.createdDescription"),
        date: createdAt,
        isActive: false,
        isCompleted: true,
      },
      {
        status: "DRAFT",
        label: t("timeline.draft"),
        description: t("timeline.draftDescription"),
        date: createdAt,
        isActive: status === "DRAFT",
        isCompleted: status !== "DRAFT" && !isCanceled && !isRejected,
      },
      {
        status: "IN_TRANSIT",
        label: t("timeline.inTransit"),
        description: t("timeline.inTransitDescription"),
        date: null,
        isActive: status === "IN_TRANSIT",
        isCompleted: isReceived,
      },
      {
        status: "RECEIVED",
        label: t("timeline.received"),
        description: t("timeline.receivedDescription"),
        date: completedAt,
        isActive: false,
        isCompleted: isReceived,
      },
    ];

    // Handle terminal states
    if (isCanceled) {
      steps.pop();
      steps.push({
        status: "CANCELED",
        label: t("timeline.canceled"),
        description: t("timeline.canceledDescription"),
        date: null,
        isActive: false,
        isCompleted: false,
        isCanceled: true,
      });
    } else if (isRejected) {
      steps.pop();
      steps.push({
        status: "REJECTED",
        label: t("timeline.rejected"),
        description: t("timeline.rejectedDescription"),
        date: null,
        isActive: false,
        isCompleted: false,
        isRejected: true,
      });
    }

    return steps;
  };

  const steps = getSteps();

  const getIcon = (step: TimelineStep) => {
    if (step.isCanceled) {
      return <Ban className="h-5 w-5" />;
    }
    if (step.isRejected) {
      return <XCircle className="h-5 w-5" />;
    }
    if (step.isCompleted) {
      return <Check className="h-5 w-5" />;
    }
    if (step.isActive) {
      switch (step.status) {
        case "DRAFT":
          return <FileEdit className="h-5 w-5" />;
        case "IN_TRANSIT":
          return <Truck className="h-5 w-5" />;
        default:
          return <Package className="h-5 w-5" />;
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
        {steps.map((step, index) => (
          <div key={step.status} className="relative flex gap-4">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[15px] top-[30px] h-[calc(100%+8px)] w-0.5",
                  step.isCompleted
                    ? "bg-primary"
                    : step.isCanceled || step.isRejected
                      ? "bg-red-500"
                      : "bg-muted",
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                step.isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : step.isActive
                    ? "border-primary bg-background text-primary"
                    : step.isCanceled || step.isRejected
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-muted bg-background text-muted-foreground",
              )}
            >
              {getIcon(step)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-medium",
                    step.isActive
                      ? "text-primary"
                      : step.isCanceled || step.isRejected
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
