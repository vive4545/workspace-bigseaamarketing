import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileText, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  approveSupplier,
  rejectSupplier,
  setDocumentStatus,
} from "@/server/actions/admin-verification";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Verification", robots: { index: false } };

export default async function AdminVerificationPage() {
  const suppliers = await prisma.supplierProfile.findMany({
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
    include: { documents: { orderBy: { createdAt: "desc" } }, country: true },
  });

  const pending = suppliers.filter((s) => s.verificationStatus === "PENDING");
  const others = suppliers.filter((s) => s.verificationStatus !== "PENDING");

  function Row({ s }: { s: (typeof suppliers)[number] }) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/suppliers/${s.slug}`} className="font-semibold hover:text-primary">
                  {s.companyName}
                </Link>
                <StatusBadge status={s.verificationStatus} />
              </div>
              <p className="text-xs text-muted-foreground">{s.country?.name ?? "—"}</p>
            </div>
            <div className="flex gap-2">
              <form action={approveSupplier.bind(null, s.id)}>
                <SubmitButton size="sm"><Check className="size-4" /> Verify</SubmitButton>
              </form>
              <form action={rejectSupplier.bind(null, s.id)}>
                <SubmitButton size="sm" variant="outline"><X className="size-4" /> Reject</SubmitButton>
              </form>
            </div>
          </div>

          {s.documents.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              {s.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 text-sm">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                    <FileText className="size-4 text-muted-foreground" /> {doc.type}
                  </a>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={doc.status} />
                    <form action={setDocumentStatus.bind(null, doc.id, "APPROVED")}>
                      <SubmitButton size="sm" variant="ghost" aria-label="Approve document"><Check className="size-4" /></SubmitButton>
                    </form>
                    <form action={setDocumentStatus.bind(null, doc.id, "REJECTED")}>
                      <SubmitButton size="sm" variant="ghost" aria-label="Reject document"><X className="size-4" /></SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Supplier verification" description={`${pending.length} awaiting review`} />

      {pending.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Pending review</h2>
          {pending.map((s) => <Row key={s.id} s={s} />)}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All suppliers</h2>
        {others.map((s) => <Row key={s.id} s={s} />)}
      </div>
    </div>
  );
}
