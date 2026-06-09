import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { deleteProduct } from "@/server/actions/product";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Products", robots: { index: false } };

export default async function ProductsPage() {
  const { profile } = await requireSupplierProfile();
  const products = await prisma.product.findMany({
    where: { supplierId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        action={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="size-4" /> Add product
            </Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Boxes className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No products yet.</p>
            <Button asChild>
              <Link href="/dashboard/products/new">Add your first product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{p.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                    {p.category && <span>{p.category.name}</span>}
                    <span>MOQ {p.moq}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right font-bold text-primary">
                    {formatMoney(Number(p.basePrice), p.baseCurrency)}
                  </div>
                  <Button variant="ghost" size="icon" asChild aria-label="Edit">
                    <Link href={`/dashboard/products/${p.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <form action={deleteProduct.bind(null, p.id)}>
                    <SubmitButton variant="ghost" size="icon" confirm="Delete this product?" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </SubmitButton>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
