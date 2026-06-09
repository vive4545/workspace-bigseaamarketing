import { z } from "zod";

export const rfqSchema = z.object({
  title: z.string().min(5, "Give your RFQ a clear title (5+ characters)"),
  description: z.string().min(10, "Describe what you need (10+ characters)"),
  categoryId: z.string().optional().or(z.literal("")),
  countryCode: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().nonnegative().optional().or(z.literal("")),
  currency: z.string().default("USD"),
  quantity: z.coerce.number().int().positive().optional().or(z.literal("")),
  moq: z.coerce.number().int().positive().optional().or(z.literal("")),
});

export type RfqInput = z.infer<typeof rfqSchema>;
