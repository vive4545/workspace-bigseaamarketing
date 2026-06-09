"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth-helpers";
import { logAudit } from "@/server/audit";

export async function approveSupplier(supplierId: string) {
  const admin = await requireRole("ADMIN");
  const supplier = await prisma.supplierProfile.findUnique({ where: { id: supplierId } });
  if (!supplier) return;

  await prisma.$transaction([
    prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { verificationStatus: "VERIFIED", verifiedBadge: true },
    }),
    prisma.companyDocument.updateMany({
      where: { supplierId, status: "PENDING" },
      data: { status: "APPROVED" },
    }),
    prisma.notification.create({
      data: {
        userId: supplier.userId,
        type: "VERIFICATION_APPROVED",
        title: "You’re verified! ✅",
        body: "Your company has been verified. Buyers now see your verified badge.",
      },
    }),
  ]);
  await logAudit({ actorId: admin.id, action: "supplier.verify", entity: "Supplier", entityId: supplierId });
  revalidatePath("/admin/verification");
}

export async function rejectSupplier(supplierId: string) {
  const admin = await requireRole("ADMIN");
  const supplier = await prisma.supplierProfile.findUnique({ where: { id: supplierId } });
  if (!supplier) return;

  await prisma.$transaction([
    prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { verificationStatus: "REJECTED", verifiedBadge: false },
    }),
    prisma.notification.create({
      data: {
        userId: supplier.userId,
        type: "VERIFICATION_REJECTED",
        title: "Verification update",
        body: "Your verification was not approved. Please review and resubmit your documents.",
      },
    }),
  ]);
  await logAudit({ actorId: admin.id, action: "supplier.reject", entity: "Supplier", entityId: supplierId });
  revalidatePath("/admin/verification");
}

export async function setDocumentStatus(
  documentId: string,
  status: "APPROVED" | "REJECTED",
) {
  const admin = await requireRole("ADMIN");
  await prisma.companyDocument.update({ where: { id: documentId }, data: { status } });
  await logAudit({ actorId: admin.id, action: `document.${status.toLowerCase()}`, entity: "Document", entityId: documentId });
  revalidatePath("/admin/verification");
}
