import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Globe2,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { HeroSection } from "@/components/anim/hero-section";
import { PageOrbs } from "@/components/anim/page-orbs";
import { Reveal } from "@/components/anim/reveal";
import { SupplierCard } from "@/components/marketplace/supplier-card";

export const revalidate = 3600; // ISR

async function getHomeData() {
  const [parentCategories, suppliers, counts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true, children: true } } },
    }),
    prisma.supplierProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      take: 4,
      orderBy: { createdAt: "asc" },
      include: {
        country: true,
        _count: { select: { products: true } },
      },
    }),
    Promise.all([
      prisma.supplierProfile.count(),
      prisma.product.count(),
      prisma.rfq.count(),
      prisma.country.count(),
    ]),
  ]);
  const [supplierCount, productCount, rfqCount, countryCount] = counts;
  return { parentCategories, suppliers, supplierCount, productCount, rfqCount, countryCount };
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <PageOrbs />

      <HeroSection
        supplierCount={data.supplierCount}
        productCount={data.productCount}
        rfqCount={data.rfqCount}
        countryCount={data.countryCount}
      />

      {/* ─────────────────────── Trust strip ─────────────────────── */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:justify-between">
            {[
              { icon: ShieldCheck, label: "Verified suppliers only" },
              { icon: Star, label: "Hand-vetted manufacturers" },
              { icon: Globe2, label: `${data.countryCount}+ countries` },
              { icon: Truck, label: "Secure RFQ workflow" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <item.icon className="size-4 text-primary" />
                {item.label}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── Categories ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Categories
            </span>
            <h2 className="mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explore verified suppliers across leading industries.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/categories">
              All categories <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.parentCategories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
              <Card className="card-hover card-accent h-full">
                <CardContent className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cat._count.children} subcategories · {cat._count.products} products
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ─────────────────────── How it works ─────────────────────── */}
      <section className="relative border-y border-border/60 bg-secondary/30">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl">
              From discovery to deal in three steps
            </h2>
            <p className="mt-2 text-muted-foreground">
              {siteConfig.name} makes global sourcing simple, fast, and verified.
            </p>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Discover suppliers",
                body: "Search a global directory of verified manufacturers and browse their product catalogs with localized pricing.",
              },
              {
                icon: FileText,
                title: "Post an RFQ",
                body: "Describe what you need. Verified suppliers compete to send you their best quotations.",
              },
              {
                icon: BadgeCheck,
                title: "Compare & connect",
                body: "Review quotes side by side, unlock supplier contacts, and close the deal with confidence.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="card-hover card-accent relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-sm"
              >
                <div className="pointer-events-none absolute -right-1 -top-4 text-7xl font-bold tabular-nums text-primary/[0.07]">
                  0{i + 1}
                </div>
                <div className="relative mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-brand">
                  <step.icon className="size-6" />
                </div>
                <h3 className="relative text-lg font-semibold">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── Featured suppliers ─────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Featured
            </span>
            <h2 className="mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl">
              Verified suppliers
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-vetted manufacturers ready to quote.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/suppliers">
              All suppliers <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.suppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} />
          ))}
        </Reveal>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
          <div className="bg-ocean-mesh pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to find your next supplier?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join {siteConfig.name} free. Post your first RFQ in minutes and start
              receiving competitive quotations from verified suppliers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href="/register">
                  Get started free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/suppliers">Browse suppliers</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
