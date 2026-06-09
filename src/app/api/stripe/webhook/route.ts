import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits ?? 0);
    const ref = session.id;

    if (userId && credits > 0) {
      // Idempotency: skip if we've already recorded this session.
      const seen = await prisma.transaction.findFirst({ where: { stripeRef: ref } });
      if (!seen) {
        await prisma.$transaction([
          prisma.creditAccount.upsert({
            where: { userId },
            update: { balance: { increment: credits } },
            create: { userId, balance: credits },
          }),
          prisma.transaction.create({
            data: {
              userId,
              type: "PURCHASE",
              amount: credits,
              description: `Credit purchase`,
              stripeRef: ref,
            },
          }),
        ]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
