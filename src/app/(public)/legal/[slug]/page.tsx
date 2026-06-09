import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.cmsPage.findFirst({
    where: { slug, published: true },
  });
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: `${page.title} — ${siteConfig.name}.`,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.cmsPage.findFirst({
    where: { slug, published: true },
  });
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: page.title }]}
      />
      <article className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated{" "}
          {page.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {/* CMS body is plain text/markdown-ish; rendered with preserved breaks. */}
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {page.body}
        </div>
      </article>
    </div>
  );
}
