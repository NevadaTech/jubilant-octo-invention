"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Warehouse,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import {
  useTransfer,
  useUpdateTransferStatus,
} from "../../hooks/use-transfers";
import { useUser } from "@/modules/users/presentation/hooks/use-users";
import { TransferStatusBadge } from "./transfer-status-badge";
import { TransferTimeline } from "./transfer-timeline";
import { TransferReceiveModal } from "./transfer-receive-modal";

interface TransferDetailProps {
  transferId: string;
}

function UserName({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  if (!user) {
    return (
      <span className="font-mono text-sm text-muted-foreground">
        {userId.slice(0, 8)}...
      </span>
    );
  }
  return (
    <span>
      {user.firstName} {user.lastName}
    </span>
  );
}

export function TransferDetail({ transferId }: TransferDetailProps) {
  const t = useTranslations("inventory.transfers");
  const { data: transfer, isLoading, isError } = useTransfer(transferId);
  const updateStatus = useUpdateTransferStatus();
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  const handleStartTransit = async () => {
    await updateStatus.mutateAsync({ id: transferId, status: "IN_TRANSIT" });
  };

  const handleReject = async () => {
    await updateStatus.mutateAsync({ id: transferId, status: "REJECTED" });
  };

  const handleCancel = async () => {
    await updateStatus.mutateAsync({ id: transferId, status: "CANCELED" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !transfer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/transfers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("detail.notFound")}
            </h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {t("detail.notFoundDescription")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/transfers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("detail.title")}
              </h1>
              <TransferStatusBadge status={transfer.status} />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("detail.subtitle", { id: transfer.id.slice(0, 8) })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {transfer.canStartTransit && (
            <Button
              onClick={handleStartTransit}
              disabled={updateStatus.isPending}
            >
              {t("actions.startTransit")}
            </Button>
          )}
          {transfer.canReceive && (
            <Button
              onClick={() => setReceiveModalOpen(true)}
              disabled={updateStatus.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("actions.receive")}
            </Button>
          )}
          {transfer.canReject && (
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={updateStatus.isPending}
            >
              {t("actions.reject")}
            </Button>
          )}
          {transfer.canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={updateStatus.isPending}
            >
              {t("actions.cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warehouses */}
            <div className="flex items-center gap-3">
              <Warehouse className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-1 items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("fields.from")}
                  </p>
                  <p className="font-medium">{transfer.fromWarehouseName}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("fields.to")}
                  </p>
                  <p className="font-medium">{transfer.toWarehouseName}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("detail.summary")}
                </p>
                <p className="text-2xl font-bold">
                  {t("detail.summaryValue", {
                    items: transfer.totalItems,
                    quantity: transfer.totalQuantity,
                  })}
                </p>
              </div>
            </div>

            {/* Notes */}
            {transfer.notes && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("fields.notes")}
                  </p>
                  <p>{transfer.notes}</p>
                </div>
              </div>
            )}

            {/* Created By */}
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.createdBy")}
                </p>
                <UserName userId={transfer.createdBy} />
              </div>
            </div>

            {/* Received By */}
            {transfer.receivedBy && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("fields.receivedBy")}
                  </p>
                  <UserName userId={transfer.receivedBy} />
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("fields.createdAt")}
                </p>
                <p>{formatDate(transfer.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferTimeline
              status={transfer.status}
              createdAt={transfer.createdAt}
              completedAt={transfer.completedAt}
            />
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.products")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3 pr-4">{t("fields.product")}</th>
                  <th className="pb-3 pr-4">{t("fields.sku")}</th>
                  <th className="pb-3 pr-4 text-right">
                    {t("fields.quantity")}
                  </th>
                  {transfer.isReceived || transfer.isPartial ? (
                    <th className="pb-3 text-right">
                      {t("fields.receivedQuantity")}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {transfer.lines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="py-4 pr-4 font-medium">
                      {line.productName}
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {line.productSku}
                    </td>
                    <td className="py-4 pr-4 text-right">{line.quantity}</td>
                    {transfer.isReceived || transfer.isPartial ? (
                      <td className="py-4 text-right">
                        <span
                          className={
                            line.receivedQuantity !== null &&
                            line.receivedQuantity < line.quantity
                              ? "text-orange-600"
                              : "text-green-600"
                          }
                        >
                          {line.receivedQuantity ?? "-"}
                        </span>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receive Modal */}
      {transfer.canReceive && (
        <TransferReceiveModal
          transfer={transfer}
          open={receiveModalOpen}
          onOpenChange={setReceiveModalOpen}
        />
      )}
    </div>
  );
}
