import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveCmsPage } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CmsForm } from "@/components/admin/content-forms";

export const metadata: Metadata = { title: "Edit CMS page", robots: { index: false } };

export default async function EditCmsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title={`Edit: ${page.title}`} />
      <Card>
        <CardContent className="p-6">
          <CmsForm
            action={saveCmsPage.bind(null, id)}
            submitLabel="Save changes"
            defaults={{
              title: page.title,
              slug: page.slug,
              body: page.body,
              published: page.published,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
