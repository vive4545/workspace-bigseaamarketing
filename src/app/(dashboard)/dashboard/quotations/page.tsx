import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { withdrawQuotation } from "@/server/actions/supplier-quote";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My quotations", robots: { index: false } };

export default async function QuotationsPage() {
  const { profile } = await requireSupplierProfile();
  const quotes = await prisma.quotation.findMany({
    where: { supplierId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { rfq: { select: { id: true, title: true, status: true } } },
  });

  return (
    <div>
      <PageHeader title="My quotations" description="Quotes you’ve submitted to buyers." />

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">You haven’t submitted any quotes yet.</p>
            <Link href="/dashboard/rfq-feed" className="text-sm font-medium text-primary hover:underline">
              Browse the RFQ feed →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/rfq-feed/${q.rfq.id}`} className="truncate font-semibold hover:text-primary">
                      {q.rfq.title}
                    </Link>
                    <StatusBadge status={q.status} />
                  </div>
                  {q.message && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{q.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.leadTime ? `Lead time ${q.leadTime} · ` : ""}
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-lg font-bold text-primary">
                    {formatMoney(Number(q.price), q.currency)}
                  </div>
                  {q.status === "PENDING" && (
                    <form action={withdrawQuotation.bind(null, q.id)}>
                      <SubmitButton variant="ghost" size="sm" confirm="Withdraw this quotation?">
                        Withdraw
                      </SubmitButton>
                    </form>
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
