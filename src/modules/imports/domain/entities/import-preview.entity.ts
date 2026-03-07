export interface ImportRowError {
  rowNumber: number;
  column?: string;
  value?: string;
  error: string;
  severity: "error" | "warning";
}

export interface ImportStructureError {
  message: string;
}

export class ImportPreview {
  constructor(
    public readonly totalRows: number,
    public readonly validRows: number,
    public readonly invalidRows: number,
    public readonly structureErrors: ImportStructureError[],
    public readonly rowErrors: ImportRowError[],
    public readonly warnings: string[],
  ) {}

  get canBeProcessed(): boolean {
    return this.structureErrors.length === 0 && this.invalidRows === 0;
  }

  get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
}
