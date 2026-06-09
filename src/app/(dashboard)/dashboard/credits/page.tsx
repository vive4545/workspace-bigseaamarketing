import type { Metadata } from "next";
import { ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { isStripeEnabled } from "@/lib/stripe";
import { PageHeader } from "@/components/dashboard/page-header";
import { BuyCredits } from "@/components/dashboard/buy-credits";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Credits", robots: { index: false } };

export default async function CreditsPage() {
  const user = await requireUser();
  const [account, transactions] = await Promise.all([
    prisma.creditAccount.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Credits"
        description="Use credits to unlock supplier contact details."
      />

      <Card className="mb-8 overflow-hidden">
        <CardContent className="flex items-center gap-4 bg-ocean-mesh p-6">
          <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Coins className="size-7" />
          </span>
          <div>
            <div className="text-3xl font-bold">{account?.balance ?? 0}</div>
            <div className="text-sm text-muted-foreground">credits available</div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Buy credits</h2>
      <BuyCredits />
      {!isStripeEnabled() && (
        <p className="mt-3 text-xs text-muted-foreground">
          Demo mode: purchases are simulated (no card charged). Add a Stripe key
          to enable real checkout.
        </p>
      )}

      <h2 className="mb-4 mt-10 text-lg font-semibold">Transaction history</h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {transactions.map((t, i) => {
            const credit = t.amount >= 0;
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center justify-between gap-4 p-4",
                  i > 0 && "border-t",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full",
                      credit ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.description ?? t.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={cn("font-semibold", credit ? "text-success" : "text-foreground")}>
                  {credit ? "+" : ""}
                  {t.amount}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
