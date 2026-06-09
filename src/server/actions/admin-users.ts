"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth-helpers";
import { logAudit } from "@/server/audit";
import { signIn, impersonationToken } from "@/auth";

async function setUserStatus(
  userId: string,
  status: "ACTIVE" | "PENDING" | "BLOCKED",
  action: string,
) {
  const admin = await requireRole("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await logAudit({ actorId: admin.id, action, entity: "User", entityId: userId });
  revalidatePath("/admin/users");
}

export async function approveUser(userId: string) {
  await setUserStatus(userId, "ACTIVE", "user.approve");
}
export async function rejectUser(userId: string) {
  await setUserStatus(userId, "PENDING", "user.reject");
}
export async function blockUser(userId: string) {
  await setUserStatus(userId, "BLOCKED", "user.block");
}
export async function unblockUser(userId: string) {
  await setUserStatus(userId, "ACTIVE", "user.unblock");
}

export async function adjustCredits(userId: string, formData: FormData) {
  const admin = await requireRole("ADMIN");
  const amount = Math.trunc(Number(formData.get("amount")));
  const reason = String(formData.get("reason") ?? "Admin adjustment");
  if (!amount || Number.isNaN(amount)) return;

  await prisma.$transaction([
    prisma.creditAccount.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: Math.max(0, amount) },
    }),
    prisma.transaction.create({
      data: { userId, type: "ADMIN_ADJUST", amount, description: reason },
    }),
  ]);
  await logAudit({
    actorId: admin.id,
    action: "credits.adjust",
    entity: "User",
    entityId: userId,
    meta: { amount, reason },
  });
  revalidatePath("/admin/credits");
}

/** Admin "log in as" a user via an HMAC-signed impersonation token. */
export async function impersonateUser(userId: string) {
  const admin = await requireRole("ADMIN");
  await logAudit({
    actorId: admin.id,
    action: "user.impersonate",
    entity: "User",
    entityId: userId,
  });
  await signIn("impersonate", {
    userId,
    token: impersonationToken(userId),
    redirectTo: "/dashboard",
  });
}
