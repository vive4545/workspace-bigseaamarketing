import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${siteConfig.name} team. We're here to help buyers and suppliers succeed.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  { icon: Mail, label: "Email", value: "support@bigseaa.com" },
  { icon: Phone, label: "Phone", value: "+1 (555) 010-2030" },
  { icon: MapPin, label: "Office", value: "Global · Remote-first" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-muted-foreground">
            Questions about sourcing, supplier verification, or your account?
            Our team typically replies within one business day.
          </p>
          <div className="mt-8 space-y-4">
            {channels.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-medium">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4 text-primary" /> Send us a message
            </div>
            {/* Wired to a server action / route handler in a later phase. */}
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
                    Name
                  </label>
                  <Input id="name" name="name" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="jane@company.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="subject">
                  Subject
                </label>
                <Input id="subject" name="subject" placeholder="How can we help?" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us a bit more…"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full">
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
