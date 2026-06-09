import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { updateProduct } from "@/server/actions/product";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Edit product", robots: { index: false } };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireSupplierProfile();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product || product.supplierId !== profile.id) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit product" description={product.title} />
      <Card>
        <CardContent className="p-6">
          <ProductForm
            action={updateProduct.bind(null, id)}
            categories={categories}
            submitLabel="Save changes"
            defaults={{
              title: product.title,
              description: product.description,
              categoryId: product.categoryId,
              moq: product.moq,
              basePrice: Number(product.basePrice),
              baseCurrency: product.baseCurrency,
              status: product.status,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
