import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Give the product a title (3+ characters)"),
  description: z.string().max(4000).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  moq: z.coerce.number().int().positive().default(1),
  basePrice: z.coerce.number().positive("Enter a price"),
  baseCurrency: z.string().default("USD"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const quotationSchema = z.object({
  rfqId: z.string().min(1),
  price: z.coerce.number().positive("Enter your quoted price"),
  currency: z.string().default("USD"),
  leadTime: z.string().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});
export type QuotationInput = z.infer<typeof quotationSchema>;

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  about: z.string().max(4000).optional().or(z.literal("")),
  strength: z.string().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  countryCode: z.string().optional().or(z.literal("")),
  paymentTerms: z.string().max(500).optional().or(z.literal("")),
  shippingTerms: z.string().max(500).optional().or(z.literal("")),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const documentSchema = z.object({
  type: z.string().min(2, "Document type is required"),
  fileUrl: z.string().url("Enter a valid document URL"),
});
