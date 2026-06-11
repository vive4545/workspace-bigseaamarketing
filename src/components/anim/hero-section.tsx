"use client";

import { useEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site";

import { HeroAurora } from "./hero-aurora";

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
  // Pause the cursor aurora's animation loop whenever the hero scrolls out of
  // view, so it doesn't keep running while the rest of the page is scrolled.
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stats = [
    { label: "Verified suppliers", value: `${supplierCount}+`, icon: ShieldCheck },
    { label: "Products listed", value: `${productCount}+`, icon: Boxes },
    { label: "RFQs posted", value: `${rfqCount}+`, icon: FileText },
    { label: "Countries", value: `${countryCount}+`, icon: Globe2 },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ocean-mesh">
      {/* Blueprint grid backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      {/* Interactive cursor-following aurora glow */}
      <HeroAurora active={inView} />
      {/* Legibility scrim — keeps copy readable over the 3D blob + aurora */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 50% at 50% 38%, color-mix(in oklch, var(--background) 80%, transparent), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hero-rise inline-block">
            <Badge
              variant="accent"
              className="mb-5 bg-background/85 px-3 py-1 text-accent shadow-xs ring-accent/25 backdrop-blur"
            >
              <Sparkles className="size-3.5" /> Trusted by global trade teams
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="flex flex-wrap justify-center gap-x-3">
              {HEADLINE.map((w, i) => (
                <span key={w} className="inline-block overflow-hidden pb-1">
                  <span
                    className="hero-word-anim inline-block"
                    style={{ animationDelay: `${0.12 + i * 0.08}s` }}
                  >
                    {w}
                  </span>
                </span>
              ))}
            </span>
            <span className="mt-1 inline-block overflow-hidden pb-1">
              <span
                className="hero-word-anim inline-block bg-gradient-to-r from-primary to-[oklch(0.58_0.18_38)] bg-clip-text text-transparent"
                style={{ animationDelay: "0.36s" }}
              >
                verified suppliers
              </span>
            </span>{" "}
            <span className="inline-block overflow-hidden pb-1">
              <span
                className="hero-word-anim inline-block"
                style={{ animationDelay: "0.44s" }}
              >
                worldwide
              </span>
            </span>
          </h1>

          <p
            className="hero-rise mx-auto mt-6 max-w-2xl text-pretty text-lg text-foreground/80"
            style={{ animationDelay: "0.5s" }}
          >
            {siteConfig.name} connects serious buyers with vetted manufacturers.
            Browse products with live currency conversion, post an RFQ, and get
            competitive quotations — fast.
          </p>

          <form
            action="/products"
            className="hero-rise mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur"
            style={{ animationDelay: "0.6s" }}
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

          <div
            className="hero-rise mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground/75"
            style={{ animationDelay: "0.7s" }}
          >
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
          {stats.map((s, i) => (
            <Card
              key={s.label}
              className="hero-rise card-hover border-border/60 bg-card/70 backdrop-blur"
              style={{ animationDelay: `${0.8 + i * 0.08}s` }}
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
