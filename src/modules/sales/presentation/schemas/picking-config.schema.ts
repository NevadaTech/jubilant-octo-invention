import { z } from "zod";

export const pickingConfigSchema = z.object({
  mode: z.enum(["OFF", "OPTIONAL", "REQUIRED_FULL", "REQUIRED_PARTIAL"]),
});

export type PickingConfigFormValues = z.infer<typeof pickingConfigSchema>;
