"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Upload, X, CloudUpload } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { cn } from "@/ui/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export function FileDropzone({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  maxSize = DEFAULT_MAX_SIZE,
  disabled,
}: FileDropzoneProps) {
  const t = useTranslations("imports.upload");
  const tFlow = useTranslations("imports.wizardFlow");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      if (file.size > maxSize) {
        setError(t("maxSize"));
        return;
      }

      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      const validExts = accept.split(",").map((e) => e.trim());
      if (!validExts.includes(ext)) {
        setError(t("acceptedFormats"));
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [accept, maxSize, onFileSelect, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [disabled, validateAndSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect]);

  // Selected file card — rendered once a file is picked
  if (selectedFile) {
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{t("dropLabel")}</Label>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4">
          <p className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
            {selectedFile.name}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            aria-label={tFlow("replaceFile")}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{t("dropLabel")}</Label>
      <label
        htmlFor={inputId}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-accent"
            : "border-border bg-card hover:border-primary",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <motion.div
          initial={false}
          animate={{
            y: isDragOver ? -4 : 0,
            scale: isDragOver ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className={cn(
            "rounded-2xl p-3 transition-colors",
            isDragOver
              ? "bg-primary-600 text-white"
              : "bg-white text-neutral-500 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700",
          )}
        >
          {isDragOver ? (
            <CloudUpload className="h-8 w-8" aria-hidden />
          ) : (
            <Upload className="h-8 w-8" aria-hidden />
          )}
        </motion.div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {isDragOver ? tFlow("dropHint") : t("dragDrop")}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {tFlow("supports", { mb: Math.round(maxSize / (1024 * 1024)) })}
          </p>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

