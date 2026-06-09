import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyForm } from "@/components/dashboard/company-form";

export const metadata: Metadata = { title: "Company profile", robots: { index: false } };

export default async function CompanyPage() {
  const { profile } = await requireSupplierProfile();
  const [countries, country] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" }, select: { code: true, name: true } }),
    profile.countryId
      ? prisma.country.findUnique({ where: { id: profile.countryId } })
      : null,
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Company profile"
        description="This information appears on your public supplier page."
      />
      <Card>
        <CardContent className="p-6">
          <CompanyForm
            countries={countries}
            defaults={{
              companyName: profile.companyName,
              about: profile.about ?? "",
              strength: profile.strength ?? "",
              websiteUrl: profile.websiteUrl ?? "",
              contactEmail: profile.contactEmail ?? "",
              contactPhone: profile.contactPhone ?? "",
              countryCode: country?.code ?? "",
              paymentTerms: profile.paymentTerms ?? "",
              shippingTerms: profile.shippingTerms ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
