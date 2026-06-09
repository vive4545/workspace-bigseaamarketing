import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveCategory, deleteCategory } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { CategoryForm } from "@/components/admin/content-forms";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Categories", robots: { index: false } };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });
  const parents = categories.filter((c) => !c.parentId);

  return (
    <div>
      <PageHeader title="Categories" description="Manage the category tree." />

      <Card className="mb-6">
        <CardContent className="p-5">
          <CategoryForm action={saveCategory.bind(null, null)} parents={parents} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y p-0">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {c.parent ? `in ${c.parent.name}` : "top level"} · {c._count.children} sub · {c._count.products} products
                </span>
              </div>
              <form action={deleteCategory.bind(null, c.id)}>
                <SubmitButton size="sm" variant="ghost" confirm={`Delete “${c.name}”?`} aria-label="Delete">
                  <Trash2 className="size-4" />
                </SubmitButton>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
