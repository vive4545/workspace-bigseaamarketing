import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileText, Globe2, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn how ${siteConfig.name} connects verified suppliers with global buyers through a trusted B2B marketplace.`,
  alternates: { canonical: "/about" },
};

const values = [
  { icon: ShieldCheck, title: "Trust first", body: "Every supplier is manually reviewed before earning a verified badge." },
  { icon: Globe2, title: "Built for global trade", body: "Localized pricing, multi-currency, and cross-border logistics in mind." },
  { icon: BadgeCheck, title: "Quality connections", body: "We match serious buyers with capable manufacturers — no noise." },
];

const steps = [
  { icon: Search, title: "Discover", body: "Search a global directory of verified suppliers and products." },
  { icon: FileText, title: "Request", body: "Post an RFQ and let suppliers compete with their best quotes." },
  { icon: Users, title: "Connect", body: "Unlock contacts and close deals with confidence." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section className="mt-6 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          We make global sourcing simple and trustworthy
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
          {siteConfig.name} is a B2B marketplace built to connect buyers with verified
          suppliers worldwide. We remove the friction from sourcing — from discovery to
          quotation to deal — so trade teams can move faster with less risk.
        </p>
      </section>

      <section className="mt-14 grid gap-5 sm:grid-cols-3">
        {values.map((v) => (
          <Card key={v.title}>
            <CardContent className="p-6">
              <v.icon className="mb-3 size-7 text-primary" />
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="size-6" />
              </div>
              <h3 className="font-semibold">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border bg-ocean-mesh p-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Join the marketplace</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Whether you’re sourcing or selling, get started in minutes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/register">Create an account</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/suppliers">Browse suppliers</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
