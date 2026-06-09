"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/notifications");
}

export async function updateNotificationSettings(formData: FormData) {
  const user = await requireUser();
  await prisma.notificationSettings.upsert({
    where: { userId: user.id },
    update: {
      email: formData.get("email") === "on",
      sms: formData.get("sms") === "on",
      whatsapp: formData.get("whatsapp") === "on",
      telegram: formData.get("telegram") === "on",
    },
    create: {
      userId: user.id,
      email: formData.get("email") === "on",
      sms: formData.get("sms") === "on",
      whatsapp: formData.get("whatsapp") === "on",
      telegram: formData.get("telegram") === "on",
    },
  });
  revalidatePath("/dashboard/notifications");
}
