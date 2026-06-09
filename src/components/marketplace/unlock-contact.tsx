"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlockSupplier } from "@/server/actions/credits";

export function UnlockContact({
  supplierId,
  cost,
}: {
  supplierId: string;
  cost: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function unlock() {
    setError(null);
    start(async () => {
      const res = await unlockSupplier(supplierId);
      if (res.ok) {
        router.refresh();
      } else if (res.needCredits) {
        router.push("/dashboard/credits");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <Button className="w-full" onClick={unlock} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        Unlock contact ({cost} credit{cost > 1 ? "s" : ""})
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
