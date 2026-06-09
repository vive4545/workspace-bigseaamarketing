/** Credit packs available for purchase. Price in USD cents. */
export const CREDIT_PACKS = [
  { id: "starter", name: "Starter", credits: 10, priceCents: 2900, popular: false },
  { id: "growth", name: "Growth", credits: 30, priceCents: 6900, popular: true },
  { id: "scale", name: "Scale", credits: 75, priceCents: 14900, popular: false },
] as const;

export type CreditPack = (typeof CREDIT_PACKS)[number];

export function getPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

/** Cost in credits to unlock a supplier's contact details. */
export const UNLOCK_COST = 1;
