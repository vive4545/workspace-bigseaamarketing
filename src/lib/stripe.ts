import Stripe from "stripe";

/** Lazily-created Stripe client. Null when no key is configured (dev/demo). */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const isStripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
