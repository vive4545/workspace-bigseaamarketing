import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import {
  currencyForCountry,
  detectCountry,
  resolvePrice,
} from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/marketplace/pagination";
import { ProductCard } from "@/components/marketplace/product-card";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Products — Wholesale & B2B Catalog",
  description:
    "Browse B2B products from verified suppliers with localized pricing on " +
    siteConfig.name +
    ". Filter by category, minimum order quantity and budget.",
  alternates: { canonical: "/products" },
};

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  maxMoq?: string;
  maxBudget?: string;
  page?: string;
}>;

const selectClass =
  "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.category) where.category = { slug: sp.category };
  if (sp.maxMoq) where.moq = { lte: Number(sp.maxMoq) };
  if (sp.maxBudget) where.basePrice = { lte: new Prisma.Decimal(sp.maxBudget) };

  const [country, categories, total, rows] = await Promise.all([
    detectCountry(),
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        prices: true,
        supplier: { select: { companyName: true, verifiedBadge: true } },
      },
    }),
  ]);

  const currency = currencyForCountry(country);
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
        override
          ? { price: Number(override.price), currency: override.currency }
          : null,
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Product catalog",
          url: `${siteConfig.url}/products`,
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">
          {total} products · prices localized to {currency}
        </p>
      </div>

      {/* Advanced filters */}
      <form
        action="/products"
        method="get"
        className="grid gap-3 rounded-xl border bg-card p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={sp.q}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={selectClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          name="maxMoq"
          type="number"
          min={1}
          defaultValue={sp.maxMoq}
          placeholder="Max MOQ"
          className="sm:w-32"
        />
        <Input
          name="maxBudget"
          type="number"
          min={0}
          defaultValue={sp.maxBudget}
          placeholder="Max budget (USD)"
          className="sm:w-40"
        />
        <Button type="submit">Apply</Button>
      </form>

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No products match your filters.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      <Pagination basePath="/products" params={sp} page={page} totalPages={totalPages} />
    </div>
  );
}
