import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import {
  currencyForCountry,
  detectCountry,
  resolvePrice,
} from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { JsonLd } from "@/components/seo/json-ld";

// Dynamic SSR: pricing is localized per visitor country (uses headers()).
// Fully crawlable; cached at the CDN/edge in production.

async function resolveCategory(slug: string[]) {
  const leaf = slug[slug.length - 1];
  return prisma.category.findUnique({
    where: { slug: leaf },
    include: {
      parent: true,
      children: { orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await resolveCategory(slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} suppliers & products`,
    description: `Browse verified ${cat.name} suppliers and products with localized pricing on ${siteConfig.name}.`,
    alternates: { canonical: `/categories/${slug.join("/")}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const cat = await resolveCategory(slug);
  if (!cat) notFound();

  const childIds = cat.children.map((c) => c.id);
  const categoryIds = [cat.id, ...childIds];

  const [country, rows] = await Promise.all([
    detectCountry(),
    prisma.product.findMany({
      where: { status: "ACTIVE", categoryId: { in: categoryIds } },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: {
        category: true,
        prices: true,
        supplier: { select: { companyName: true, verifiedBadge: true } },
      },
    }),
  ]);

  const currency = currencyForCountry(country);
  const products = rows.map((p) => {
    const override = p.prices.find((pr) => pr.country === country);
    return {
      slug: p.slug,
      title: p.title,
      moq: p.moq,
      category: p.category,
      supplier: p.supplier,
      price: resolvePrice(
        { price: Number(p.basePrice), currency: p.baseCurrency },
        currency,
        override ? { price: Number(override.price), currency: override.currency } : null,
      ),
    };
  });

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
  ];
  if (cat.parent)
    crumbs.push({ label: cat.parent.name, href: `/categories/${cat.parent.slug}` });
  crumbs.push({ label: cat.name });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: c.href ? `${siteConfig.url}${c.href}` : undefined,
          })),
        }}
      />
      <Breadcrumb items={crumbs} />

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{cat.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} products · prices in {currency}
        </p>
      </div>

      {cat.children.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {cat.children.map((child) => (
            <Link key={child.id} href={`/categories/${cat.slug}/${child.slug}`}>
              <Badge variant="outline" className="cursor-pointer px-3 py-1 hover:bg-secondary">
                {child.name}
                <span className="ml-1 text-muted-foreground">{child._count.products}</span>
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
