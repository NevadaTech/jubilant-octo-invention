import { z } from "zod";
import type { ImportType } from "@/modules/imports/domain/entities";
import { MAX_UPLOAD_BYTES } from "@/shared/domain/upload-limits";

export const IMPORT_TYPES: { value: ImportType; labelKey: string }[] = [
  { value: "PRODUCTS", labelKey: "imports.types.products" },
  { value: "MOVEMENTS", labelKey: "imports.types.movements" },
  { value: "WAREHOUSES", labelKey: "imports.types.warehouses" },
  { value: "STOCK", labelKey: "imports.types.stock" },
  { value: "TRANSFERS", labelKey: "imports.types.transfers" },
  { value: "SALES", labelKey: "imports.types.sales" },
];

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export const importFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_UPLOAD_BYTES, {
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
