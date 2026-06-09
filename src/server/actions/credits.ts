"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { getPack, UNLOCK_COST } from "@/lib/credit-packs";

type UnlockResult =
  | { ok: true; already?: boolean }
  | { ok: false; error: string; needCredits?: boolean };

/** Spend credits to unlock a supplier's contact details. Atomic. */
export async function unlockSupplier(supplierId: string): Promise<UnlockResult> {
  const user = await requireUser();

  const supplier = await prisma.supplierProfile.findUnique({ where: { id: supplierId } });
  if (!supplier) return { ok: false, error: "Supplier not found." };
  if (supplier.userId === user.id) return { ok: true, already: true };

  const existing = await prisma.supplierUnlock.findUnique({
    where: { buyerId_supplierId: { buyerId: user.id, supplierId } },
  });
  if (existing) return { ok: true, already: true };

  const account = await prisma.creditAccount.findUnique({ where: { userId: user.id } });
  if (!account || account.balance < UNLOCK_COST) {
    return { ok: false, error: "Not enough credits.", needCredits: true };
  }

  await prisma.$transaction([
    prisma.creditAccount.update({
      where: { userId: user.id },
      data: { balance: { decrement: UNLOCK_COST } },
    }),
    prisma.supplierUnlock.create({
      data: { buyerId: user.id, supplierId, creditCost: UNLOCK_COST },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "SPEND",
        amount: -UNLOCK_COST,
        description: `Unlocked ${supplier.companyName}`,
      },
    }),
  ]);

  revalidatePath(`/suppliers/${supplier.slug}`);
  return { ok: true };
}

type CheckoutResult =
  | { url: string }
  | { ok: true; simulated: true }
  | { error: string };

/** Buy a credit pack. Uses Stripe Checkout, or simulates in dev (no keys). */
export async function startCheckout(packId: string): Promise<CheckoutResult> {
  const user = await requireUser();
  const pack = getPack(packId);
  if (!pack) return { error: "Invalid pack." };

  const stripe = getStripe();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pack.priceCents,
            product_data: { name: `${pack.name} — ${pack.credits} credits` },
          },
        },
      ],
      metadata: { userId: user.id, credits: String(pack.credits), packId: pack.id },
      success_url: `${base}/dashboard/credits?success=1`,
      cancel_url: `${base}/dashboard/credits?canceled=1`,
    });
    return { url: session.url! };
  }

  // Dev/demo fallback: grant credits immediately (no real charge).
  await prisma.$transaction([
    prisma.creditAccount.upsert({
      where: { userId: user.id },
      update: { balance: { increment: pack.credits } },
      create: { userId: user.id, balance: pack.credits },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "PURCHASE",
        amount: pack.credits,
        description: `${pack.name} pack (simulated)`,
      },
    }),
  ]);
  revalidatePath("/dashboard/credits");
  return { ok: true, simulated: true };
}
