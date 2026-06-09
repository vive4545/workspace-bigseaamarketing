/**
 * Currency conversion & localized pricing.
 *
 * Dev uses a static USD-based rate table. In production, swap `getRates()`
 * for a cached call to an FX API (EXCHANGE_RATE_API_KEY) refreshed daily by a
 * background job — the rest of the app is unaffected.
 */
import { headers } from "next/headers";

export type Currency = string;

// USD-based static rates (1 USD = X). Swap for a live, cached source in prod.
const STATIC_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CNY: 7.24,
  INR: 83.3,
  AED: 3.67,
  VND: 25400,
  JPY: 157,
  AUD: 1.52,
  CAD: 1.37,
  SGD: 1.35,
};

// ISO country code → preferred display currency.
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  CN: "CNY",
  IN: "INR",
  AE: "AED",
  VN: "VND",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
};

export function getRates() {
  return STATIC_RATES;
}

/** Detect the visitor's country from edge/CDN headers; fallback to US. */
export async function detectCountry(): Promise<string> {
  try {
    const h = await headers();
    const cc =
      h.get("x-vercel-ip-country") ??
      h.get("cf-ipcountry") ??
      h.get("x-country") ??
      "US";
    return cc.toUpperCase();
  } catch {
    return "US";
  }
}

export function currencyForCountry(country: string): string {
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "USD";
}

/** Convert an amount between currencies using USD as the pivot. */
export function convert(amount: number, from: Currency, to: Currency): number {
  const rates = getRates();
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  const usd = amount / fromRate;
  return usd * toRate;
}

export function formatMoney(
  amount: number,
  currency: Currency,
  locale = "en-US",
): string {
  // Zero-decimal currencies look odd with cents.
  const zeroDecimal = ["VND", "JPY"].includes(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
    minimumFractionDigits: zeroDecimal ? 0 : 0,
  }).format(amount);
}

/**
 * Resolve a product's price for a target country.
 * Prefers an explicit ProductPrice override; otherwise converts the base price.
 */
export function resolvePrice(
  base: { price: number; currency: string },
  targetCurrency: string,
  override?: { price: number; currency: string } | null,
): { amount: number; currency: string; converted: boolean } {
  if (override) {
    return { amount: override.price, currency: override.currency, converted: false };
  }
  if (targetCurrency === base.currency) {
    return { amount: base.price, currency: base.currency, converted: false };
  }
  return {
    amount: convert(base.price, base.currency, targetCurrency),
    currency: targetCurrency,
    converted: true,
  };
}
