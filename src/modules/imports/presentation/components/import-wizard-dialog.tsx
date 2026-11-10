"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { Button } from "@/ui/components/button";
import { cn } from "@/ui/lib/utils";
import {
  usePreviewImport,
  useExecuteImport,
} from "@/modules/imports/presentation/hooks/use-imports";
import type { ImportCompanyBind } from "@/modules/imports/application/ports/import.repository.port";
import type {
  ImportBatch,
  ImportTypeSchema,
} from "@/modules/imports/domain/entities";
import type { ImportPreview } from "@/modules/imports/domain/entities/import-preview.entity";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useCompany } from "@/modules/companies/presentation/hooks/use-companies";
import { CompanyRequiredGuard } from "@/modules/companies/presentation/components/company-required-guard";
import { FileDropzone } from "./file-dropzone";
import { ImportPreviewResults } from "./import-preview-results";
import { ImportProgress } from "./import-progress";

interface ImportWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: ImportTypeSchema | null;
}

type WizardStep = "upload" | "preview" | "execute";

const STEPS: readonly WizardStep[] = ["upload", "preview", "execute"];

export function ImportWizardDialog({
  open,
  onOpenChange,
  schema,
}: ImportWizardDialogProps) {
  const t = useTranslations("imports");
  const tFlow = useTranslations("imports.wizardFlow");

  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [batch, setBatch] = useState<ImportBatch | null>(null);

  const previewMutation = usePreviewImport();
  const executeMutation = useExecuteImport();

  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const requiresCompany =
    schema?.type === "STOCK" ||
    schema?.type === "SALES" ||
    schema?.type === "MOVEMENTS";
  const { data: selectedCompany, isLoading: isCompanyLoading } = useCompany(
    selectedCompanyId ?? "",
  );

  const companyBind: ImportCompanyBind | undefined = useMemo(() => {
    if (!requiresCompany || !selectedCompanyId || !selectedCompany?.code) {
      return undefined;
    }
    return {
      companyId: selectedCompanyId,
      companyCode: selectedCompany.code,
    };
  }, [requiresCompany, selectedCompanyId, selectedCompany?.code]);

  const stockBlocked =
    requiresCompany &&
    (!selectedCompanyId || isCompanyLoading || !companyBind?.companyCode);

  const handleClose = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setBatch(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleValidate = useCallback(async () => {
    if (!file || !schema) return;
    if (requiresCompany && !companyBind) return;
    const result = await previewMutation.mutateAsync({
      file,
      type: schema.type,
      company: companyBind,
    });
    setPreview(result);
    setStep("preview");
  }, [file, schema, previewMutation, requiresCompany, companyBind]);

  const handleExecute = useCallback(async () => {
    if (!file || !schema) return;
    if (requiresCompany && !companyBind) return;
    const result = await executeMutation.mutateAsync({
      file,
      type: schema.type,
      company: companyBind,
    });
    setBatch(result);
    setStep("execute");
  }, [file, schema, executeMutation, requiresCompany, companyBind]);

  if (!schema) return null;

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : handleClose())}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-hidden rounded-2xl p-0">
        <CompanyRequiredGuard active={requiresCompany}>
          <div className="flex max-h-[88vh] flex-col">
            {/* Header with title + step indicator */}
            <div className="border-b border-border px-5 py-5">
              <DialogHeader className="space-y-2 text-left">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t("module")}
                </p>
                <DialogTitle className="text-lg font-semibold">
                  {step === "preview"
                    ? tFlow("runDryRun")
                    : t("wizard.title", { type: schema.displayName })}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {schema.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <StepIndicator
                  steps={STEPS.map((key, index) => ({
                    key,
                    label: t(`wizard.step${index + 1}`),
                  }))}
                  currentIndex={currentStepIndex}
                />
              </div>
            </div>

            {/* Body — scrollable, step-specific */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FileDropzone onFileSelect={setFile} />
                </motion.div>
              )}

              {step === "preview" && preview && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImportPreviewResults
                    preview={preview}
                    fileName={file?.name}
                  />
                </motion.div>
              )}

              {step === "execute" && batch && (
                <motion.div
                  key="execute"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <ImportProgress batchId={batch.id} initialBatch={batch} />
                </motion.div>
              )}
            </div>

            {/* Footer — action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
              {step === "upload" && (
                <>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {tFlow("stepShort", {
                      step: currentStepIndex + 1,
                      total: STEPS.length,
                    })}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      {t("wizard.cancel")}
                    </Button>
                    <Button
                      onClick={handleValidate}
                      disabled={
                        !file || previewMutation.isPending || stockBlocked
                      }
                    >
                      {previewMutation.isPending
                        ? tFlow("validating")
                        : tFlow("runDryRun")}
                      {!previewMutation.isPending && (
                        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                </>
              )}

              {step === "preview" && (
                <>
                  <Button variant="ghost" onClick={() => setStep("upload")}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
                    {tFlow("prevStep")}
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      {t("wizard.cancel")}
                    </Button>
                    <Button
                      onClick={handleExecute}
                      disabled={
                        !preview?.canBeProcessed ||
                        executeMutation.isPending ||
                        stockBlocked
                      }
                    >
                      {executeMutation.isPending
                        ? tFlow("importing")
                        : tFlow("importValid")}
                    </Button>
                  </div>
                </>
              )}

              {step === "execute" && (
                <Button className="ml-auto" onClick={handleClose}>
                  {t("wizard.close")}
                </Button>
              )}
            </div>
          </div>
        </CompanyRequiredGuard>
      </DialogContent>
    </Dialog>
  );
}

interface StepIndicatorProps {
  steps: ReadonlyArray<{ key: string; label: string }>;
  currentIndex: number;
}

function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2 md:gap-3" aria-label="Wizard steps">
      {steps.map((s, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-2">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: isDone || isCurrent ? "#2563eb" : undefined,
                color: isDone || isCurrent ? "#fff" : undefined,
                scale: isCurrent ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                !isDone &&
                  !isCurrent &&
                  "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
            </motion.div>

            <span
              className={cn(
                "hidden truncate text-xs font-medium md:inline-block",
                isDone || isCurrent
                  ? "text-neutral-900 dark:text-neutral-50"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
            >
              {s.label}
            </span>

            {i < steps.length - 1 && (
              <div className="relative mx-1 h-px flex-1 overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                <motion.div
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 origin-left bg-primary-600 dark:bg-primary-400"
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
