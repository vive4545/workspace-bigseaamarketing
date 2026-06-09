import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/dashboard/quote-form";

export const metadata: Metadata = { title: "RFQ", robots: { index: false } };

export default async function RfqFeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireSupplierProfile();

  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: {
      category: true,
      country: true,
      quotations: { where: { supplierId: profile.id } },
    },
  });
  if (!rfq) notFound();

  const myQuote = rfq.quotations[0];
  const canQuote = rfq.status === "OPEN" && !myQuote;

  const facts = [
    rfq.category && { label: "Category", value: rfq.category.name },
    rfq.country && { label: "Delivery", value: rfq.country.name },
    rfq.budget != null && { label: "Budget", value: formatMoney(Number(rfq.budget), rfq.currency) },
    rfq.quantity != null && { label: "Quantity", value: String(rfq.quantity) },
    rfq.moq != null && { label: "Target MOQ", value: String(rfq.moq) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/rfq-feed" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to RFQ feed
      </Link>

      <PageHeader title={rfq.title} />
      <div className="mb-3">
        <StatusBadge status={rfq.status} />
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

      <h2 className="mb-4 mt-10 text-lg font-semibold">Your quotation</h2>

      {myQuote ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <CheckCircle2 className="size-6 text-success" />
            <div>
              <p className="font-medium">
                You quoted {formatMoney(Number(myQuote.price), myQuote.currency)}
                {myQuote.leadTime && ` · ${myQuote.leadTime}`}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: <StatusBadge status={myQuote.status} />
              </p>
            </div>
          </CardContent>
        </Card>
      ) : canQuote ? (
        <Card>
          <CardContent className="p-6">
            <QuoteForm rfqId={rfq.id} defaultCurrency={rfq.currency} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This RFQ is closed and no longer accepting quotes.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
