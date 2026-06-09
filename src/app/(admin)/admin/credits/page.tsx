import type { Metadata } from "next";
import { Coins } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adjustCredits } from "@/server/actions/admin-users";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Credit management", robots: { index: false } };

export default async function AdminCreditsPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    include: { creditAccount: true },
  });

  return (
    <div>
      <PageHeader title="Credit management" description="Add or remove credits for any account." />
      <Card>
        <CardContent className="divide-y p-0">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{u.name ?? u.email}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  <Coins className="size-4" /> {u.creditAccount?.balance ?? 0}
                </span>
                <form action={adjustCredits.bind(null, u.id)} className="flex items-center gap-2">
                  <Input name="amount" type="number" placeholder="±credits" className="h-9 w-28" required />
                  <Input name="reason" placeholder="Reason" className="hidden h-9 w-40 sm:block" />
                  <SubmitButton size="sm" variant="outline">Apply</SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
