import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  FileText,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const [credit, account] = await Promise.all([
    prisma.creditAccount.findUnique({ where: { userId: user.id } }),
    prisma.user.findUnique({
      where: { id: user.id },
      include: { supplierProfile: true, _count: { select: { rfqs: true } } },
    }),
  ]);

  const isSupplier = user.role === "SUPPLIER";

  const tiles = isSupplier
    ? [
        { label: "Browse RFQs", href: "/dashboard/rfq-feed", icon: FileText, desc: "Find buyer requests to quote" },
        { label: "My products", href: "/dashboard/products", icon: Package, desc: "Manage your catalog" },
        { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck, desc: account?.supplierProfile?.verificationStatus ?? "—" },
      ]
    : [
        { label: "Post an RFQ", href: "/dashboard/rfqs/new", icon: FileText, desc: "Request quotations" },
        { label: "My RFQs", href: "/dashboard/rfqs", icon: FileText, desc: `${account?._count.rfqs ?? 0} posted` },
        { label: "Browse suppliers", href: "/suppliers", icon: Package, desc: "Find verified suppliers" },
      ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here’s your {isSupplier ? "supplier" : "buyer"} workspace.
          </p>
        </div>
        <Badge variant={isSupplier ? "accent" : "default"}>
          {isSupplier ? "Supplier account" : "Buyer account"}
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Coins className="size-5" />
            </span>
            <div>
              <div className="text-2xl font-bold">{credit?.balance ?? 0}</div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-lg bg-accent/15 text-accent">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="text-2xl font-bold capitalize">{user.activeMode.toLowerCase()}</div>
              <div className="text-xs text-muted-foreground">Active mode</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-lg bg-success/15 text-success">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <div className="text-2xl font-bold capitalize">{user.status.toLowerCase()}</div>
              <div className="text-xs text-muted-foreground">Account status</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <h2 className="mt-10 mb-4 text-lg font-semibold">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <t.icon className="mb-3 size-6 text-primary" />
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold group-hover:text-primary">{t.label}</h3>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1 text-sm capitalize text-muted-foreground">
                  {t.desc.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-10 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Full buyer &amp; supplier dashboards (RFQs, quotations, products, company
        profile) arrive in the next phase.
      </p>
    </div>
  );
}
