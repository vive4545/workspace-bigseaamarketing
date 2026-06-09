"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";

type State = { error?: string; success?: string } | undefined;

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().optional(),
  company: z.string().optional(),
  about: z.string().max(2000).optional(),
});

export async function updateProfile(_prev: State, formData: FormData): Promise<State> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: { name: d.name, phone: d.phone || null },
  });

  if (user.role === "SUPPLIER") {
    await prisma.supplierProfile.updateMany({
      where: { userId: user.id },
      data: { about: d.about || null },
    });
  } else {
    await prisma.buyerProfile.upsert({
      where: { userId: user.id },
      update: { company: d.company || null, about: d.about || null },
      create: { userId: user.id, company: d.company || null, about: d.about || null },
    });
  }

  revalidatePath("/dashboard/profile");
  return { success: "Profile updated." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number"),
  });

export async function changePassword(_prev: State, formData: FormData): Promise<State> {
  const sessionUser = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.passwordHash) {
    return { error: "Password change isn’t available for social logins." };
  }
  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return { error: "Your current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.next, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { success: "Password updated." };
}
