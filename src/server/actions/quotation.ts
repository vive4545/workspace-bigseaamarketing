"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";

/** Buyer accepts a quotation: marks it accepted, rejects the rest, closes RFQ. */
export async function acceptQuotation(quotationId: string) {
  const user = await requireUser();
  const quote = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  });
  if (!quote || quote.rfq.buyerId !== user.id) return;

  await prisma.$transaction([
    prisma.quotation.update({
      where: { id: quotationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.quotation.updateMany({
      where: { rfqId: quote.rfqId, id: { not: quotationId }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
    prisma.rfq.update({ where: { id: quote.rfqId }, data: { status: "CLOSED" } }),
    prisma.notification.create({
      data: {
        userId: quote.userId,
        type: "QUOTE_ACCEPTED",
        title: "Your quotation was accepted",
        body: `Your quote on “${quote.rfq.title}” was accepted.`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/rfqs/${quote.rfqId}`);
}

export async function rejectQuotation(quotationId: string) {
  const user = await requireUser();
  const quote = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  });
  if (!quote || quote.rfq.buyerId !== user.id) return;

  await prisma.$transaction([
    prisma.quotation.update({
      where: { id: quotationId },
      data: { status: "REJECTED" },
    }),
    prisma.notification.create({
      data: {
        userId: quote.userId,
        type: "QUOTE_REJECTED",
        title: "Quotation update",
        body: `Your quote on “${quote.rfq.title}” was not selected.`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/rfqs/${quote.rfqId}`);
}
