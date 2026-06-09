import type { Metadata } from "next";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { Pagination } from "@/components/marketplace/pagination";
import { SupplierCard } from "@/components/marketplace/supplier-card";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Verified Suppliers Directory",
  description:
    "Browse verified manufacturers and suppliers across industries and countries on " +
    siteConfig.name +
    ". Filter by country and verification status, then request a quote.",
  alternates: { canonical: "/suppliers" },
};

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  country?: string;
  verified?: string;
  page?: string;
}>;

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.SupplierProfileWhereInput = {};
  if (sp.q) {
    where.OR = [
      { companyName: { contains: sp.q, mode: "insensitive" } },
      { about: { contains: sp.q, mode: "insensitive" } },
      { strength: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.country) where.country = { code: sp.country };
  if (sp.verified === "1") where.verifiedBadge = true;

  const [countries, total, suppliers] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.supplierProfile.count({ where }),
    prisma.supplierProfile.findMany({
      where,
      orderBy: [{ verifiedBadge: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { country: true, _count: { select: { products: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Verified Suppliers Directory",
          url: `${siteConfig.url}/suppliers`,
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Suppliers" }]} />

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <p className="mt-2 text-muted-foreground">
          {total} suppliers{sp.q ? ` matching “${sp.q}”` : ""}. Filter and request quotes.
        </p>
      </div>

      <FilterBar
        action="/suppliers"
        query={sp.q}
        searchPlaceholder="Search suppliers by name or strength…"
        selects={[
          {
            name: "country",
            label: "All countries",
            value: sp.country,
            options: countries.map((c) => ({ value: c.code, label: c.name })),
          },
          {
            name: "verified",
            label: "Any status",
            value: sp.verified,
            options: [{ value: "1", label: "Verified only" }],
          },
        ]}
      />

      {suppliers.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No suppliers match your filters.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {suppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      )}

      <Pagination
        basePath="/suppliers"
        params={sp}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
