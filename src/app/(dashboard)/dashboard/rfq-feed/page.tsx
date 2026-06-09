import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "RFQ feed", robots: { index: false } };

export default async function RfqFeedPage() {
  const { profile } = await requireSupplierProfile();

  const rfqs = await prisma.rfq.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      category: true,
      country: true,
      _count: { select: { quotations: true } },
      quotations: { where: { supplierId: profile.id }, select: { id: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="RFQ feed"
        description="Open buyer requests you can quote on."
      />

      {rfqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Inbox className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No open RFQs right now. Check back soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rfqs.map((rfq) => {
            const quoted = rfq.quotations.length > 0;
            return (
              <Link key={rfq.id} href={`/dashboard/rfq-feed/${rfq.id}`} className="block">
                <Card className="transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{rfq.title}</h3>
                        {quoted && <Badge variant="success">Quoted</Badge>}
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {rfq.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {rfq.category && <span>{rfq.category.name}</span>}
                        {rfq.country && <span>{rfq.country.name}</span>}
                        {rfq.budget != null && (
                          <span>Budget {formatMoney(Number(rfq.budget), rfq.currency)}</span>
                        )}
                        {rfq.quantity != null && <span>Qty {rfq.quantity}</span>}
                        <span>{rfq._count.quotations} quotes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
