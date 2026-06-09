"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { slugify } from "@/lib/utils";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

async function uniqueSupplierSlug(base: string): Promise<string> {
  const root = slugify(base) || "supplier";
  let slug = root;
  let n = 1;
  while (await prisma.supplierProfile.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    if (data.role === "SUPPLIER") {
      const country = await prisma.country.findUnique({
        where: { code: data.countryCode },
      });
      const slug = await uniqueSupplierSlug(data.companyName);
      await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: "SUPPLIER",
          activeMode: "SUPPLIER",
          status: "ACTIVE",
          creditAccount: { create: { balance: 5 } },
          notifSettings: { create: {} },
          supplierProfile: {
            create: {
              companyName: data.companyName,
              slug,
              about: data.about,
              countryId: country?.id,
              contactEmail: data.email,
              verificationStatus: "PENDING",
            },
          },
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: "BUYER",
          activeMode: "BUYER",
          status: "ACTIVE",
          creditAccount: { create: { balance: 5 } },
          notifSettings: { create: {} },
          buyerProfile: { create: { company: data.company } },
        },
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not create the account. Please try again." };
  }
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email" };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always succeed (don't leak which emails exist).
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        email: parsed.data.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 min
      },
    });
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    // No email provider in dev — log the link. Swap for Resend in production.
    console.info(`[password-reset] ${parsed.data.email} → ${link}`);
  }
  return { ok: true };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { email: record.email } }),
  ]);
  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
