import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCmsPage } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "CMS pages", robots: { index: false } };

export default async function AdminCmsPage() {
  const pages = await prisma.cmsPage.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Content pages"
        description="Manage legal & informational pages."
        action={
          <Button asChild>
            <Link href="/admin/cms/new"><Plus className="size-4" /> New page</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="divide-y p-0">
          {pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.title}</span>
                  {p.published ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">/legal/{p.slug}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" asChild aria-label="Edit">
                  <Link href={`/admin/cms/${p.id}`}><Pencil className="size-4" /></Link>
                </Button>
                <form action={deleteCmsPage.bind(null, p.id)}>
                  <SubmitButton size="icon" variant="ghost" confirm={`Delete “${p.title}”?`} aria-label="Delete">
                    <Trash2 className="size-4" />
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
