import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { saveFaq, deleteFaq } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { FaqForm } from "@/components/admin/content-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "FAQs", robots: { index: false } };

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  return (
    <div>
      <PageHeader title="FAQ management" description="Questions shown on the public FAQ page." />

      <Card className="mb-6">
        <CardContent className="p-5">
          <FaqForm action={saveFaq.bind(null, null)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y p-0">
          {faqs.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{f.question}</p>
                  {!f.published && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{f.answer}</p>
                {f.category && <span className="text-xs text-muted-foreground">{f.category}</span>}
              </div>
              <form action={deleteFaq.bind(null, f.id)}>
                <SubmitButton size="sm" variant="ghost" confirm="Delete this FAQ?" aria-label="Delete">
                  <Trash2 className="size-4" />
                </SubmitButton>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
