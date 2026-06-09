import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Package, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminOverviewPage() {
  const [users, pendingUsers, suppliers, pendingVerif, rfqs, products, recent] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.supplierProfile.count(),
      prisma.supplierProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.rfq.count(),
      prisma.product.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { actor: { select: { name: true, email: true } } },
      }),
    ]);

  const stats = [
    { label: "Total users", value: users, sub: `${pendingUsers} pending`, icon: Users, href: "/admin/users" },
    { label: "Suppliers", value: suppliers, sub: `${pendingVerif} to verify`, icon: ShieldCheck, href: "/admin/verification" },
    { label: "RFQs", value: rfqs, sub: "all time", icon: FileText, href: "/admin/rfqs" },
    { label: "Products", value: products, sub: "listed", icon: Package, href: "/admin/categories" },
  ];

  return (
    <div>
      <PageHeader title="Admin overview" description="Platform health at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <s.icon className="size-6 text-primary" />
                </div>
                <div className="mt-3 text-3xl font-bold">{s.value}</div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Recent activity</h2>
      <Card>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul>
              {recent.map((log, i) => (
                <li key={log.id} className={i > 0 ? "border-t" : ""}>
                  <div className="flex items-center justify-between gap-4 p-4 text-sm">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      {log.entity && (
                        <span className="text-muted-foreground"> · {log.entity}</span>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{log.actor?.name ?? log.actor?.email ?? "system"}</div>
                      <div>{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
