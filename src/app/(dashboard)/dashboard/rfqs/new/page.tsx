import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RfqForm } from "@/components/dashboard/rfq-form";
import { createRfq } from "@/server/actions/rfq";

export const metadata: Metadata = { title: "Post an RFQ", robots: { index: false } };

export default async function NewRfqPage() {
  const [categories, countries] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { code: true, name: true },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Post a Request for Quotation"
        description="Describe what you need — verified suppliers will send you competitive quotes."
      />
      <Card>
        <CardContent className="p-6">
          <RfqForm action={createRfq} categories={categories} countries={countries} />
        </CardContent>
      </Card>
    </div>
  );
}
