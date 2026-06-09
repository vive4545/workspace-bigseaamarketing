"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { CREDIT_PACKS } from "@/lib/credit-packs";
import { startCheckout } from "@/server/actions/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BuyCredits() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<string | null>(null);

  function buy(packId: string) {
    setActive(packId);
    start(async () => {
      const res = await startCheckout(packId);
      if ("url" in res) {
        window.location.href = res.url;
      } else if ("ok" in res) {
        router.refresh();
      }
      setActive(null);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CREDIT_PACKS.map((pack) => (
        <Card
          key={pack.id}
          className={cn("relative", pack.popular && "border-primary shadow-md")}
        >
          {pack.popular && (
            <Badge className="absolute -top-2 left-4">Most popular</Badge>
          )}
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">{pack.name}</h3>
            <div className="mt-3 text-3xl font-bold">{pack.credits}</div>
            <div className="text-xs text-muted-foreground">credits</div>
            <div className="mt-3 text-lg font-semibold text-primary">
              ${(pack.priceCents / 100).toFixed(0)}
            </div>
            <Button
              className="mt-4 w-full"
              variant={pack.popular ? "default" : "outline"}
              disabled={pending}
              onClick={() => buy(pack.id)}
            >
              {pending && active === pack.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Buy
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
