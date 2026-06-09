import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const buyerRegisterSchema = z.object({
  role: z.literal("BUYER"),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: passwordField,
  company: z.string().optional(),
});

export const supplierRegisterSchema = z.object({
  role: z.literal("SUPPLIER"),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: passwordField,
  companyName: z.string().min(2, "Company name is required"),
  countryCode: z.string().min(2, "Select a country"),
  about: z.string().max(2000).optional(),
});

export const registerSchema = z.discriminatedUnion("role", [
  buyerRegisterSchema,
  supplierRegisterSchema,
]);

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordField,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
