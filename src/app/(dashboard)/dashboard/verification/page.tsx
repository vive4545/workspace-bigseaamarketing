import type { Metadata } from "next";
import { BadgeCheck, FileText, ShieldCheck, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { deleteDocument } from "@/server/actions/company";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { DocumentForm } from "@/components/dashboard/document-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Verification", robots: { index: false } };

const STATUS_COPY: Record<string, string> = {
  UNVERIFIED: "Submit your company documents to start verification.",
  PENDING: "Your documents are under review by our team.",
  VERIFIED: "Your company is verified. Buyers see your verified badge.",
  REJECTED: "Some documents were rejected. Please resubmit.",
};

export default async function VerificationPage() {
  const { profile } = await requireSupplierProfile();
  const documents = await prisma.companyDocument.findMany({
    where: { supplierId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Verification" description="Build trust with buyers by getting verified." />

      {/* Status banner */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {profile.verifiedBadge ? <BadgeCheck className="size-6" /> : <ShieldCheck className="size-6" />}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Verification status</h3>
              <StatusBadge status={profile.verificationStatus} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {STATUS_COPY[profile.verificationStatus]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit document */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submit a document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm />
        </CardContent>
      </Card>

      {/* Submitted documents */}
      <h2 className="mb-3 text-lg font-semibold">Submitted documents</h2>
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <div>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">
                      {doc.type}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      doc.status === "APPROVED" ? "success" : doc.status === "REJECTED" ? "destructive" : "warning"
                    }
                    className="capitalize"
                  >
                    {doc.status.toLowerCase()}
                  </Badge>
                  <form action={deleteDocument.bind(null, doc.id)}>
                    <SubmitButton variant="ghost" size="icon" confirm="Remove this document?" aria-label="Remove">
                      <Trash2 className="size-4" />
                    </SubmitButton>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
