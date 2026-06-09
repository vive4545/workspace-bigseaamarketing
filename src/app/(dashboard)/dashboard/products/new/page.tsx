import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { createProduct } from "@/server/actions/product";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Add product", robots: { index: false } };

export default async function NewProductPage() {
  await requireSupplierProfile();
  const categories = await prisma.category.findMany({
    where: { parentId: { not: null } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Add a product" description="List a product in your catalog." />
      <Card>
        <CardContent className="p-6">
          <ProductForm action={createProduct} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
