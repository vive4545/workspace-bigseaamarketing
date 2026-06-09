"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { quotationSchema } from "@/lib/validations/supplier";

type State = { error?: string } | undefined;

export async function submitQuotation(_prev: State, formData: FormData): Promise<State> {
  const { user, profile } = await requireSupplierProfile();
  const parsed = quotationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const rfq = await prisma.rfq.findUnique({ where: { id: d.rfqId } });
  if (!rfq || rfq.status !== "OPEN") {
    return { error: "This RFQ is no longer open for quotes." };
  }

  const existing = await prisma.quotation.findUnique({
    where: { rfqId_supplierId: { rfqId: d.rfqId, supplierId: profile.id } },
  });
  if (existing) {
    return { error: "You’ve already submitted a quote for this RFQ." };
  }

  await prisma.$transaction([
    prisma.quotation.create({
      data: {
        rfqId: d.rfqId,
        supplierId: profile.id,
        userId: user.id,
        price: d.price,
        currency: d.currency || "USD",
        leadTime: d.leadTime || null,
        message: d.message || null,
        status: "PENDING",
      },
    }),
    prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        type: "QUOTE_RECEIVED",
        title: "New quotation received",
        body: `${profile.companyName} sent a quote on “${rfq.title}”.`,
      },
    }),
  ]);

  revalidatePath("/dashboard/quotations");
  redirect("/dashboard/quotations");
}

export async function withdrawQuotation(id: string) {
  const { profile } = await requireSupplierProfile();
  const quote = await prisma.quotation.findUnique({ where: { id } });
  if (!quote || quote.supplierId !== profile.id) return;
  await prisma.quotation.update({
    where: { id },
    data: { status: "WITHDRAWN" },
  });
  revalidatePath("/dashboard/quotations");
}
