"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  Boxes,
  FileText,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site";

const Hero3D = dynamic(() => import("./hero-3d"), {
  ssr: false,
  loading: () => null,
});

gsap.registerPlugin(useGSAP);

const HEADLINE = ["Source", "smarter", "from"];

export function HeroSection({
  supplierCount,
  productCount,
  rfqCount,
  countryCount,
}: {
  supplierCount: number;
  productCount: number;
  rfqCount: number;
  countryCount: number;
}) {
  const scope = useRef<HTMLElement>(null);

  const stats = [
    { label: "Verified suppliers", value: `${supplierCount}+`, icon: ShieldCheck },
    { label: "Products listed", value: `${productCount}+`, icon: Boxes },
    { label: "RFQs posted", value: `${rfqCount}+`, icon: FileText },
    { label: "Countries", value: `${countryCount}+`, icon: Globe2 },
  ];

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.6 })
        .from(
          ".hero-word",
          { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.09 },
          "-=0.3",
        )
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.45")
        .from(".hero-form", { y: 22, opacity: 0, duration: 0.7 }, "-=0.4")
        .from(".hero-trust", { y: 16, opacity: 0, duration: 0.6 }, "-=0.45")
        .from(
          ".hero-stat",
          { y: 26, opacity: 0, duration: 0.6, stagger: 0.08 },
          "-=0.25",
        );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden bg-ocean-mesh">
      {/* Blueprint grid + 3D backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_70%_at_60%_40%,black,transparent)]">
        <Hero3D />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hero-badge inline-block">
            <Badge variant="accent" className="mb-5">
              <Sparkles className="size-3.5" /> Trusted by global trade teams
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="flex flex-wrap justify-center gap-x-3">
              {HEADLINE.map((w) => (
                <span key={w} className="inline-block overflow-hidden pb-1">
                  <span className="hero-word inline-block">{w}</span>
                </span>
              ))}
            </span>
            <span className="mt-1 inline-block overflow-hidden pb-1">
              <span className="hero-word inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                verified suppliers
              </span>
            </span>{" "}
            <span className="inline-block overflow-hidden pb-1">
              <span className="hero-word inline-block">worldwide</span>
            </span>
          </h1>

          <p className="hero-sub mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            {siteConfig.name} connects serious buyers with vetted manufacturers.
            Browse products with live currency conversion, post an RFQ, and get
            competitive quotations — fast.
          </p>

          <form
            action="/products"
            className="hero-form mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur"
          >
            <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search products, suppliers, categories…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="hero-trust mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-success" /> Verified badges
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="size-4 text-primary" /> Country-based pricing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-4 text-accent" /> Competitive quotes
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="hero-stat card-hover border-border/60 bg-card/70 backdrop-blur"
            >
              <CardContent className="flex flex-col items-center gap-1 p-6 text-center">
                <span className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </span>
                <div className="text-2xl font-bold tabular-nums tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
