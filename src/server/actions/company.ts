"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { companySchema, documentSchema } from "@/lib/validations/supplier";

type State = { error?: string; success?: string } | undefined;

export async function updateCompany(_prev: State, formData: FormData): Promise<State> {
  const { profile } = await requireSupplierProfile();
  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const country = d.countryCode
    ? await prisma.country.findUnique({ where: { code: d.countryCode } })
    : null;

  await prisma.supplierProfile.update({
    where: { id: profile.id },
    data: {
      companyName: d.companyName,
      about: d.about || null,
      strength: d.strength || null,
      websiteUrl: d.websiteUrl || null,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone || null,
      countryId: country?.id ?? profile.countryId,
      paymentTerms: d.paymentTerms || null,
      shippingTerms: d.shippingTerms || null,
    },
  });

  revalidatePath("/dashboard/company");
  return { success: "Company profile updated." };
}

export async function addDocument(_prev: State, formData: FormData): Promise<State> {
  const { profile } = await requireSupplierProfile();
  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.$transaction([
    prisma.companyDocument.create({
      data: {
        supplierId: profile.id,
        type: parsed.data.type,
        fileUrl: parsed.data.fileUrl,
        status: "PENDING",
      },
    }),
    // Submitting docs moves verification into review (unless already verified).
    prisma.supplierProfile.update({
      where: { id: profile.id },
      data:
        profile.verificationStatus === "VERIFIED"
          ? {}
          : { verificationStatus: "PENDING" },
    }),
  ]);

  revalidatePath("/dashboard/verification");
  return { success: "Document submitted for review." };
}

export async function deleteDocument(id: string) {
  const { profile } = await requireSupplierProfile();
  const doc = await prisma.companyDocument.findUnique({ where: { id } });
  if (!doc || doc.supplierId !== profile.id) return;
  await prisma.companyDocument.delete({ where: { id } });
  revalidatePath("/dashboard/verification");
}
