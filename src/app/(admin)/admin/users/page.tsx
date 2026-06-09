import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  approveUser,
  blockUser,
  unblockUser,
  impersonateUser,
} from "@/server/actions/admin-users";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Users", robots: { index: false } };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplierProfile: { select: { companyName: true } } },
  });

  return (
    <div>
      <PageHeader title="User management" description={`${users.length} users`} />

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{u.role}</Badge>
                  <StatusBadge status={u.status} />
                </div>

                <div className="flex items-center gap-1.5">
                  {u.status === "PENDING" && (
                    <form action={approveUser.bind(null, u.id)}>
                      <SubmitButton size="sm">Approve</SubmitButton>
                    </form>
                  )}
                  {u.status === "BLOCKED" ? (
                    <form action={unblockUser.bind(null, u.id)}>
                      <SubmitButton size="sm" variant="outline">Unblock</SubmitButton>
                    </form>
                  ) : (
                    u.role !== "ADMIN" && (
                      <form action={blockUser.bind(null, u.id)}>
                        <SubmitButton size="sm" variant="ghost" confirm={`Block ${u.email}?`}>
                          Block
                        </SubmitButton>
                      </form>
                    )
                  )}
                  {u.role !== "ADMIN" && (
                    <form action={impersonateUser.bind(null, u.id)}>
                      <SubmitButton size="sm" variant="ghost" confirm={`Log in as ${u.email}?`} aria-label="Impersonate">
                        <LogIn className="size-4" />
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
