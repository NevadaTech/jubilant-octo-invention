"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/ui/components/button";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  maxSize = 10 * 1024 * 1024,
  disabled,
}: FileDropzoneProps) {
  const t = useTranslations("imports.upload");
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
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {selectedFile.name}
              </p>
              <p className="text-sm text-neutral-500">
                {t("fileSize")}: {formatSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <Upload className="h-10 w-10 text-neutral-400" />
        <div className="text-center">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            {t("dragDrop")}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {t("acceptedFormats")}
          </p>
          <p className="text-sm text-neutral-500">{t("maxSize")}</p>
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
