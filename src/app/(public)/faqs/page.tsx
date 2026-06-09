import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: `Answers to common questions about buying, selling, verification and credits on ${siteConfig.name}.`,
  alternates: { canonical: "/faqs" },
};

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  // Group by category for display.
  const groups = new Map<string, typeof faqs>();
  for (const f of faqs) {
    const key = f.category ?? "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Frequently asked questions</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know about using {siteConfig.name}.
        </p>
      </div>

      <div className="space-y-10">
        {[...groups.entries()].map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              {category}
            </h2>
            <div className="divide-y rounded-xl border bg-card">
              {items.map((f) => (
                <details key={f.id} className="group p-5 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between font-medium marker:content-none">
                    {f.question}
                    <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
