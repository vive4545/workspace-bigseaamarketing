import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Check, Clock, Pencil, Trash2, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { closeRfq, reopenRfq, deleteRfq } from "@/server/actions/rfq";
import { acceptQuotation, rejectQuotation } from "@/server/actions/quotation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "RFQ", robots: { index: false } };

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: {
      category: true,
      country: true,
      quotations: {
        orderBy: [{ status: "asc" }, { price: "asc" }],
        include: {
          supplier: { select: { companyName: true, slug: true, verifiedBadge: true } },
        },
      },
    },
  });
  if (!rfq || rfq.buyerId !== user.id) notFound();

  const isOpen = rfq.status === "OPEN";
  const facts = [
    rfq.category && { label: "Category", value: rfq.category.name },
    rfq.country && { label: "Delivery", value: rfq.country.name },
    rfq.budget != null && { label: "Budget", value: formatMoney(Number(rfq.budget), rfq.currency) },
    rfq.quantity != null && { label: "Quantity", value: String(rfq.quantity) },
    rfq.moq != null && { label: "Target MOQ", value: String(rfq.moq) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/rfqs" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to RFQs
      </Link>

      <PageHeader
        title={rfq.title}
        action={
          <div className="flex items-center gap-2">
            {isOpen && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/rfqs/${rfq.id}/edit`}>
                  <Pencil className="size-4" /> Edit
                </Link>
              </Button>
            )}
            <form action={isOpen ? closeRfq.bind(null, rfq.id) : reopenRfq.bind(null, rfq.id)}>
              <SubmitButton variant="outline" size="sm">
                {isOpen ? "Close" : "Reopen"}
              </SubmitButton>
            </form>
            <form action={deleteRfq.bind(null, rfq.id)}>
              <SubmitButton variant="ghost" size="sm" confirm="Delete this RFQ permanently?">
                <Trash2 className="size-4" />
              </SubmitButton>
            </form>
          </div>
        }
      />

      <div className="mb-3 flex items-center gap-3">
        <StatusBadge status={rfq.status} />
        <span className="text-sm text-muted-foreground">
          Posted {new Date(rfq.createdAt).toLocaleDateString()}
        </span>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="whitespace-pre-wrap text-muted-foreground">{rfq.description}</p>
          {facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Quotations */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">
        Quotations ({rfq.quotations.length})
      </h2>

      {rfq.quotations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Clock className="size-8 opacity-40" />
            No quotations yet. Verified suppliers will respond soon.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rfq.quotations.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/suppliers/${q.supplier.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {q.supplier.companyName}
                    </Link>
                    {q.supplier.verifiedBadge && (
                      <BadgeCheck className="size-4 text-success" />
                    )}
                    <StatusBadge status={q.status} />
                  </div>
                  {q.message && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{q.message}</p>
                  )}
                  {q.leadTime && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lead time: {q.leadTime}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {formatMoney(Number(q.price), q.currency)}
                    </div>
                  </div>
                  {isOpen && q.status === "PENDING" && (
                    <div className="flex gap-2">
                      <form action={acceptQuotation.bind(null, q.id)}>
                        <SubmitButton size="sm">
                          <Check className="size-4" /> Accept
                        </SubmitButton>
                      </form>
                      <form action={rejectQuotation.bind(null, q.id)}>
                        <SubmitButton size="sm" variant="outline">
                          <X className="size-4" />
                        </SubmitButton>
                      </form>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
