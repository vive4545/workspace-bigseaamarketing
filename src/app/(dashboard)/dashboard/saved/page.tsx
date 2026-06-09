import type { Metadata } from "next";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { removeSaved } from "@/server/actions/saved";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default async function SavedPage() {
  const user = await requireUser();
  const items = await prisma.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const ids = (t: string) => items.filter((i) => i.type === t).map((i) => i.targetId);
  const [suppliers, products, rfqs] = await Promise.all([
    prisma.supplierProfile.findMany({ where: { id: { in: ids("SUPPLIER") } }, include: { country: true } }),
    prisma.product.findMany({ where: { id: { in: ids("PRODUCT") } }, include: { supplier: { select: { companyName: true } } } }),
    prisma.rfq.findMany({ where: { id: { in: ids("RFQ") } } }),
  ]);

  const rows = items
    .map((it) => {
      if (it.type === "SUPPLIER") {
        const s = suppliers.find((x) => x.id === it.targetId);
        return s && { id: it.id, label: s.companyName, sub: s.country?.name ?? "Supplier", href: `/suppliers/${s.slug}`, tag: "Supplier" };
      }
      if (it.type === "PRODUCT") {
        const p = products.find((x) => x.id === it.targetId);
        return p && { id: it.id, label: p.title, sub: p.supplier.companyName, href: `/products/${p.slug}`, tag: "Product" };
      }
      const r = rfqs.find((x) => x.id === it.targetId);
      return r && { id: it.id, label: r.title, sub: "Request for quotation", href: `/dashboard/rfqs/${r.id}`, tag: "RFQ" };
    })
    .filter(Boolean) as { id: string; label: string; sub: string; href: string; tag: string }[];

  return (
    <div>
      <PageHeader title="Saved" description="Suppliers, products and RFQs you’ve bookmarked." />

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Heart className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nothing saved yet.</p>
            <Link href="/suppliers" className="text-sm font-medium text-primary hover:underline">
              Browse suppliers →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <Link href={r.href} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {r.tag}
                    </span>
                    <h3 className="truncate font-medium">{r.label}</h3>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{r.sub}</p>
                </Link>
                <form action={removeSaved.bind(null, r.id)}>
                  <SubmitButton variant="ghost" size="icon" aria-label="Remove">
                    <X className="size-4" />
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
