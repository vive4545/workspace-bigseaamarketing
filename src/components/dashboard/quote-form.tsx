"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitQuotation } from "@/server/actions/supplier-quote";

type State = { error?: string } | undefined;

export function QuoteForm({
  rfqId,
  defaultCurrency = "USD",
}: {
  rfqId: string;
  defaultCurrency?: string;
}) {
  const [state, action, pending] = useActionState<State, FormData>(submitQuotation, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="rfqId" value={rfqId} />
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="price">Your price</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" placeholder="23500" required />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" defaultValue={defaultCurrency}>
            {["USD", "EUR", "GBP", "CNY", "INR", "AED"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="leadTime">Lead time</Label>
        <Input id="leadTime" name="leadTime" placeholder="e.g. 45 days" />
      </div>

      <div>
        <Label htmlFor="message">Message to buyer</Label>
        <Textarea id="message" name="message" rows={4} placeholder="Certifications, what’s included, terms…" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Submit quotation
      </Button>
    </form>
  );
}
