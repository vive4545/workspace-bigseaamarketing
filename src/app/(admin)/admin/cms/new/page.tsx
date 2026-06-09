import type { Metadata } from "next";
import { saveCmsPage } from "@/server/actions/admin-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CmsForm } from "@/components/admin/content-forms";

export const metadata: Metadata = { title: "New CMS page", robots: { index: false } };

export default function NewCmsPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="New content page" />
      <Card>
        <CardContent className="p-6">
          <CmsForm action={saveCmsPage.bind(null, null)} submitLabel="Create page" />
        </CardContent>
      </Card>
    </div>
  );
}
