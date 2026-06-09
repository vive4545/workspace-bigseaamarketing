"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import type { SavedItemType } from "@/generated/prisma/enums";

/** Toggle a saved supplier / RFQ / product for the current user. */
export async function toggleSave(type: SavedItemType, targetId: string) {
  const user = await requireUser();
  const existing = await prisma.savedItem.findUnique({
    where: { userId_type_targetId: { userId: user.id, type, targetId } },
  });

  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedItem.create({ data: { userId: user.id, type, targetId } });
  }

  revalidatePath("/dashboard/saved");
  return { saved: !existing };
}

export async function removeSaved(id: string) {
  const user = await requireUser();
  const item = await prisma.savedItem.findUnique({ where: { id } });
  if (!item || item.userId !== user.id) return;
  await prisma.savedItem.delete({ where: { id } });
  revalidatePath("/dashboard/saved");
}
