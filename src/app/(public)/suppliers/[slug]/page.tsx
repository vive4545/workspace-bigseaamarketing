import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Boxes,
  Globe2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Ship,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { siteConfig } from "@/lib/site";
import {
  currencyForCountry,
  detectCountry,
  resolvePrice,
} from "@/lib/currency";
import { UNLOCK_COST } from "@/lib/credit-packs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { UnlockContact } from "@/components/marketplace/unlock-contact";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 1800;

async function getSupplier(slug: string) {
  return prisma.supplierProfile.findUnique({
    where: { slug },
    include: {
      country: true,
      port: true,
      products: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          prices: true,
          supplier: { select: { companyName: true, verifiedBadge: true } },
        },
      },
      _count: { select: { products: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSupplier(slug);
  if (!s) return { title: "Supplier not found" };
  const desc =
    s.about ??
    `${s.companyName} — verified supplier on ${siteConfig.name}.`;
  return {
    title: s.companyName,
    description: desc.slice(0, 160),
    alternates: { canonical: `/suppliers/${s.slug}` },
    openGraph: {
      title: `${s.companyName} · ${siteConfig.name}`,
      description: desc.slice(0, 160),
      type: "profile",
    },
  };
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getSupplier(slug);
  if (!s) notFound();

  const country = await detectCountry();
  const currency = currencyForCountry(country);

  const products = s.products.map((p) => {
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

  // Has the current viewer unlocked this supplier's contact details?
  const session = await auth();
  const viewer = session?.user;
  let unlocked = false;
  if (viewer) {
    if (viewer.id === s.userId) {
      unlocked = true;
    } else {
      const u = await prisma.supplierUnlock.findUnique({
        where: { buyerId_supplierId: { buyerId: viewer.id, supplierId: s.id } },
      });
      unlocked = Boolean(u);
    }
  }
  const hasContact = Boolean(s.contactEmail || s.contactPhone);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: s.companyName,
          description: s.about ?? undefined,
          url: `${siteConfig.url}/suppliers/${s.slug}`,
          address: s.country
            ? { "@type": "PostalAddress", addressCountry: s.country.code }
            : undefined,
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Suppliers", href: "/suppliers" },
          { label: s.companyName },
        ]}
      />

      {/* Header */}
      <div className="mt-4 overflow-hidden rounded-2xl border bg-ocean-mesh">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-card text-2xl font-bold text-primary shadow-sm">
            {s.companyName.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {s.companyName}
              </h1>
              {s.verifiedBadge && (
                <Badge variant="success">
                  <BadgeCheck className="size-3.5" /> Verified
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {s.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" /> {s.country.name}
                </span>
              )}
              {s.port && (
                <span className="inline-flex items-center gap-1">
                  <Ship className="size-4" /> {s.port.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Boxes className="size-4" /> {s._count.products} products
              </span>
            </div>
            {s.strength && (
              <p className="mt-3 text-sm text-foreground/80">{s.strength}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:w-52">
            {unlocked ? (
              <div className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
                <BadgeCheck className="size-4" /> Contact unlocked
              </div>
            ) : viewer ? (
              <UnlockContact supplierId={s.id} cost={UNLOCK_COST} />
            ) : (
              <Button asChild>
                <Link href={`/login?callbackUrl=/suppliers/${s.slug}`}>
                  <Lock className="size-4" /> Log in to unlock
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/register?intent=rfq`}>Request a quote</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {s.about && (
            <section className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">About</h2>
              <p className="text-muted-foreground">{s.about}</p>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Products ({products.length})
            </h2>
            {products.length === 0 ? (
              <p className="text-muted-foreground">No active products listed yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <h3 className="font-semibold">Contact</h3>
              {unlocked ? (
                hasContact ? (
                  <>
                    {s.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-primary" />
                        <a href={`mailto:${s.contactEmail}`} className="hover:text-primary">
                          {s.contactEmail}
                        </a>
                      </div>
                    )}
                    {s.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-primary" />
                        {s.contactPhone}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    This supplier hasn’t added contact details yet.
                  </p>
                )
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="size-4" /> Unlock to view email &amp; phone
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <h3 className="font-semibold">Trade terms</h3>
              {s.paymentTerms && (
                <div className="flex items-start gap-2">
                  <Wallet className="mt-0.5 size-4 text-primary" />
                  <div>
                    <div className="text-muted-foreground">Payment</div>
                    <div>{s.paymentTerms}</div>
                  </div>
                </div>
              )}
              {s.shippingTerms && (
                <div className="flex items-start gap-2">
                  <Ship className="mt-0.5 size-4 text-primary" />
                  <div>
                    <div className="text-muted-foreground">Shipping</div>
                    <div>{s.shippingTerms}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Globe2 className="mt-0.5 size-4 text-primary" />
                <div>
                  <div className="text-muted-foreground">Prices shown in</div>
                  <div>{currency} (localized)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
