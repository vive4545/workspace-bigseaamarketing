import type { Metadata } from "next";
import { Flag, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminDeleteRfq, adminFlagRfq } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "RFQ moderation", robots: { index: false } };

export default async function AdminRfqsPage() {
  const rfqs = await prisma.rfq.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      buyer: { select: { name: true, email: true } },
      _count: { select: { quotations: true } },
    },
  });

  return (
    <div>
      <PageHeader title="RFQ moderation" description={`${rfqs.length} requests`} />
      <Card>
        <CardContent className="divide-y p-0">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{rfq.title}</h3>
                  <StatusBadge status={rfq.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {rfq.buyer.name ?? rfq.buyer.email} · {rfq._count.quotations} quotes ·{" "}
                  {new Date(rfq.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {rfq.status !== "FLAGGED" && (
                  <form action={adminFlagRfq.bind(null, rfq.id)}>
                    <SubmitButton size="sm" variant="ghost" aria-label="Flag"><Flag className="size-4" /></SubmitButton>
                  </form>
                )}
                <form action={adminDeleteRfq.bind(null, rfq.id)}>
                  <SubmitButton size="sm" variant="ghost" confirm="Delete this RFQ?" aria-label="Delete"><Trash2 className="size-4" /></SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
