import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Categories",
  description: `Explore all product and supplier categories on ${siteConfig.name}.`,
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse suppliers and products across every industry.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parents.map((parent) => (
          <Card key={parent.id}>
            <CardContent className="p-6">
              <Link
                href={`/categories/${parent.slug}`}
                className="group flex items-center justify-between"
              >
                <h2 className="text-lg font-semibold group-hover:text-primary">
                  {parent.name}
                </h2>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
              <ul className="mt-4 space-y-2">
                {parent.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${parent.slug}/${child.slug}`}
                      className="flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>{child.name}</span>
                      <span className="text-xs">{child._count.products}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
