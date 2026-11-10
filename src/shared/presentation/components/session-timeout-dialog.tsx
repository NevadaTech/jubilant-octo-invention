"use client";

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";

interface SessionTimeoutDialogProps {
  open: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutDialog({
  open,
  remainingSeconds,
  onExtend,
  onLogout,
}: SessionTimeoutDialogProps) {
  const t = useTranslations("auth");

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-[480px] gap-3 rounded-2xl border-border bg-card p-6 shadow-none sm:max-w-[480px] sm:rounded-2xl sm:p-6">
        <AlertDialogHeader className="space-y-3 text-left">
          <AlertDialogTitle className="text-[22px] font-semibold leading-tight text-foreground">
            {t("sessionTimeout.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] leading-normal text-muted-foreground">
            {t("sessionTimeout.description", { time: timeDisplay })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-2 sm:space-x-0">
          <AlertDialogCancel
            onClick={onLogout}
            className="mt-0 h-auto rounded-lg border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground"
          >
            {t("sessionTimeout.logout")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onExtend}
            className="h-auto rounded-lg px-3.5 py-2.5 text-sm font-semibold"
          >
            {t("sessionTimeout.extend")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
