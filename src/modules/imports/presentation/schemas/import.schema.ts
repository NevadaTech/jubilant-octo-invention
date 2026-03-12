import { z } from "zod";
import type { ImportType } from "@/modules/imports/domain/entities";

export const IMPORT_TYPES: { value: ImportType; labelKey: string }[] = [
  { value: "PRODUCTS", labelKey: "imports.types.products" },
  { value: "MOVEMENTS", labelKey: "imports.types.movements" },
  { value: "WAREHOUSES", labelKey: "imports.types.warehouses" },
  { value: "STOCK", labelKey: "imports.types.stock" },
  { value: "TRANSFERS", labelKey: "imports.types.transfers" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export const importFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "imports.errors.fileTooLarge",
    })
    .refine(
      (file) => {
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        return ACCEPTED_EXTENSIONS.includes(ext);
      },
      {
        message: "imports.errors.invalidFileType",
      },
    ),
});

export type ImportFileFormData = z.infer<typeof importFileSchema>;
