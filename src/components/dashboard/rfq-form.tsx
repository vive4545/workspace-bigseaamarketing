"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type State = { error?: string } | undefined;

export interface RfqFormProps {
  action: (prev: State, formData: FormData) => Promise<State>;
  categories: { id: string; name: string }[];
  countries: { code: string; name: string }[];
  defaults?: {
    title?: string;
    description?: string;
    categoryId?: string | null;
    countryCode?: string | null;
    budget?: number | null;
    currency?: string;
    quantity?: number | null;
    moq?: number | null;
  };
  submitLabel?: string;
}

export function RfqForm({
  action,
  categories,
  countries,
  defaults,
  submitLabel = "Post RFQ",
}: RfqFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. Bulk order: organic cotton t-shirts (5,000 units)"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={defaults?.description}
          placeholder="Specs, certifications, delivery location and timeline…"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={defaults?.categoryId ?? ""}>
            <option value="">Any category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="countryCode">Delivery country</Label>
          <Select id="countryCode" name="countryCode" defaultValue={defaults?.countryCode ?? ""}>
            <option value="">Any country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="budget">Budget (total)</Label>
          <Input id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={defaults?.budget ?? ""} placeholder="24000" />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" defaultValue={defaults?.currency ?? "USD"}>
            {["USD", "EUR", "GBP", "CNY", "INR", "AED"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={1} defaultValue={defaults?.quantity ?? ""} placeholder="5000" />
        </div>
      </div>

      <div className="sm:w-1/4">
        <Label htmlFor="moq">Target MOQ</Label>
        <Input id="moq" name="moq" type="number" min={1} defaultValue={defaults?.moq ?? ""} placeholder="300" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
      </Button>
    </form>
  );
}
