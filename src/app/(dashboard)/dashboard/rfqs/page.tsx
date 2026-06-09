import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { formatMoney } from "@/lib/currency";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "My RFQs", robots: { index: false } };

export default async function RfqsPage() {
  const user = await requireUser();
  const rfqs = await prisma.rfq.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { quotations: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="My RFQs"
        description="Track your requests and the quotes they’ve received."
        action={
          <Button asChild>
            <Link href="/dashboard/rfqs/new">
              <Plus className="size-4" /> Post RFQ
            </Link>
          </Button>
        }
      />

      {rfqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">You haven’t posted any RFQs yet.</p>
            <Button asChild>
              <Link href="/dashboard/rfqs/new">Post your first RFQ</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rfqs.map((rfq) => (
            <Link key={rfq.id} href={`/dashboard/rfqs/${rfq.id}`} className="block">
              <Card className="transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{rfq.title}</h3>
                      <StatusBadge status={rfq.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {rfq.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {rfq.category && <span>{rfq.category.name}</span>}
                      {rfq.budget != null && (
                        <span>Budget {formatMoney(Number(rfq.budget), rfq.currency)}</span>
                      )}
                      {rfq.quantity != null && <span>Qty {rfq.quantity}</span>}
                      <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {rfq._count.quotations}
                    </div>
                    <div className="text-xs text-muted-foreground">quotes</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
