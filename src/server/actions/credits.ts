"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { getPack, UNLOCK_COST } from "@/lib/credit-packs";

class InsufficientCreditsError extends Error {}

/** Prisma unique-constraint violation (P2002), regardless of client version shape. */
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

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

  try {
    await prisma.$transaction(async (tx) => {
      // Atomic guarded debit: the `balance >= cost` predicate lives in the UPDATE
      // itself, so two concurrent unlocks can't both pass a stale read and drive
      // the balance negative (TOCTOU over-spend). 0 rows updated ⇒ insufficient.
      const debit = await tx.creditAccount.updateMany({
        where: { userId: user.id, balance: { gte: UNLOCK_COST } },
        data: { balance: { decrement: UNLOCK_COST } },
      });
      if (debit.count === 0) throw new InsufficientCreditsError();

      await tx.supplierUnlock.create({
        data: { buyerId: user.id, supplierId, creditCost: UNLOCK_COST },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "SPEND",
          amount: -UNLOCK_COST,
          description: `Unlocked ${supplier.companyName}`,
        },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { ok: false, error: "Not enough credits.", needCredits: true };
    }
    // Lost a race to unlock this same supplier (unique [buyerId, supplierId]).
    if (isUniqueViolation(err)) return { ok: true, already: true };
    throw err;
  }

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
