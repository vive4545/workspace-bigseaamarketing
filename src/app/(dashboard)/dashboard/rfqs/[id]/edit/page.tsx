import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { updateRfq } from "@/server/actions/rfq";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RfqForm } from "@/components/dashboard/rfq-form";

export const metadata: Metadata = { title: "Edit RFQ", robots: { index: false } };

export default async function EditRfqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const [rfq, categories, countries] = await Promise.all([
    prisma.rfq.findUnique({ where: { id }, include: { country: true } }),
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
  if (!rfq || rfq.buyerId !== user.id) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit RFQ" description="Update the details of your request." />
      <Card>
        <CardContent className="p-6">
          <RfqForm
            action={updateRfq.bind(null, id)}
            categories={categories}
            countries={countries}
            submitLabel="Save changes"
            defaults={{
              title: rfq.title,
              description: rfq.description,
              categoryId: rfq.categoryId,
              countryCode: rfq.country?.code ?? "",
              budget: rfq.budget != null ? Number(rfq.budget) : null,
              currency: rfq.currency,
              quantity: rfq.quantity,
              moq: rfq.moq,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
