"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { Button } from "@/ui/components/button";
import { FileDropzone } from "./file-dropzone";
import { ImportPreviewResults } from "./import-preview-results";
import { ImportProgress } from "./import-progress";
import {
  usePreviewImport,
  useExecuteImport,
} from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportType } from "@/modules/imports/domain/entities";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";

interface ImportWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType: ImportType | null;
}

type WizardStep = "upload" | "preview" | "execute";

export function ImportWizardDialog({
  open,
  onOpenChange,
  importType,
}: ImportWizardDialogProps) {
  const t = useTranslations("imports");
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const previewMutation = usePreviewImport();
  const executeMutation = useExecuteImport();

  const handleClose = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setBatchId(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleValidate = useCallback(async () => {
    if (!file || !importType) return;
    const result = await previewMutation.mutateAsync({
      file,
      type: importType,
    });
    setPreview(result);
    setStep("preview");
  }, [file, importType, previewMutation]);

  const handleExecute = useCallback(async () => {
    if (!file || !importType) return;
    const result = await executeMutation.mutateAsync({
      file,
      type: importType,
    });
    setBatchId(result.id);
    setStep("execute");
  }, [file, importType, executeMutation]);

  if (!importType) return null;

  const steps: { key: WizardStep; label: string }[] = [
    { key: "upload", label: t("wizard.step1") },
    { key: "preview", label: t("wizard.step2") },
    { key: "execute", label: t("wizard.step3") },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("wizard.title", {
              type: t(`types.${importType.toLowerCase()}`),
            })}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= currentStepIndex
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i <= currentStepIndex
                    ? "font-medium text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="mx-2 h-px w-8 bg-neutral-300 dark:bg-neutral-600" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === "upload" && (
          <div className="space-y-4">
            <FileDropzone onFileSelect={setFile} />
            <div className="flex justify-end">
              <Button
                onClick={handleValidate}
                disabled={!file || previewMutation.isPending}
              >
                {previewMutation.isPending
                  ? t("wizard.validate") + "..."
                  : t("wizard.validate")}
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4">
            <ImportPreviewResults preview={preview} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                {t("wizard.back")}
              </Button>
              <Button
                onClick={handleExecute}
                disabled={!preview.canBeProcessed || executeMutation.isPending}
              >
                {executeMutation.isPending
                  ? t("wizard.execute") + "..."
                  : t("wizard.execute")}
              </Button>
            </div>
          </div>
        )}

        {step === "execute" && batchId && (
          <div className="space-y-4">
            <ImportProgress batchId={batchId} />
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                {t("wizard.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
