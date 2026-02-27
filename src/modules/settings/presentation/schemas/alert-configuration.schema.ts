import { z } from "zod";

export const alertConfigurationSchema = z.object({
  isEnabled: z.boolean(),
  cronFrequency: z.enum([
    "EVERY_HOUR",
    "EVERY_6_HOURS",
    "EVERY_12_HOURS",
    "EVERY_DAY",
    "EVERY_WEEK",
    "EVERY_2_WEEKS",
    "EVERY_MONTH",
  ]),
  notifyLowStock: z.boolean(),
  notifyCriticalStock: z.boolean(),
  notifyOutOfStock: z.boolean(),
  recipientEmails: z.string().optional().or(z.literal("")),
});

export type AlertConfigurationFormValues = z.infer<
  typeof alertConfigurationSchema
>;
