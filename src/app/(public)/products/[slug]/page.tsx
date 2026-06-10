import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Package, ShoppingCart, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  currencyForCountry,
  detectCountry,
  formatMoney,
  resolvePrice,
} from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 1800;

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      prices: true,
      supplier: {
        include: { country: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.title,
    description: (p.description ?? p.title).slice(0, 160),
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.title, description: (p.description ?? "").slice(0, 160), type: "website" },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const country = await detectCountry();
  const currency = currencyForCountry(country);
  const override = p.prices.find((pr) => pr.country === country);
  const price = resolvePrice(
    { price: Number(p.basePrice), currency: p.baseCurrency },
    currency,
    override ? { price: Number(override.price), currency: override.currency } : null,
  );

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ];
  if (p.category?.parent)
    crumbs.push({ label: p.category.parent.name, href: `/categories/${p.category.parent.slug}` });
  if (p.category)
    crumbs.push({ label: p.category.name, href: `/categories/${p.category.slug}` });
  crumbs.push({ label: p.title });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.description ?? undefined,
          category: p.category?.name,
          brand: { "@type": "Brand", name: p.supplier.companyName },
          offers: {
            "@type": "Offer",
            priceCurrency: price.currency,
            price: price.amount.toFixed(2),
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: p.supplier.companyName },
          },
        }}
      />
      <Breadcrumb items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid aspect-square place-items-center rounded-2xl border bg-gradient-to-br from-secondary to-secondary/40">
          <Package className="size-24 text-muted-foreground/30" />
        </div>

        {/* Details */}
        <div>
          {p.category && (
            <Badge variant="secondary" className="mb-3">
              <Tag className="size-3.5" /> {p.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>

          <Link
            href={`/suppliers/${p.supplier.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            by <span className="font-medium text-foreground">{p.supplier.companyName}</span>
            {p.supplier.verifiedBadge && <BadgeCheck className="size-4 text-success" />}
            {p.supplier.country && <span>· {p.supplier.country.name}</span>}
          </Link>

          <div className="mt-6 rounded-xl border bg-card p-5">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatMoney(price.amount, price.currency)}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">/ unit</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              MOQ {p.moq} units
              {price.converted && (
                <> · approx., converted from {formatMoney(Number(p.basePrice), p.baseCurrency)}</>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href={`/register?intent=rfq&product=${p.slug}`}>
                  <ShoppingCart className="size-4" /> Request a quote
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/suppliers/${p.supplier.slug}`}>View supplier</Link>
              </Button>
            </div>
          </div>

          {p.description && (
            <section className="mt-8">
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground">{p.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
