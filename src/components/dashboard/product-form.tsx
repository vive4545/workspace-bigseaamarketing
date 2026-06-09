"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type State = { error?: string } | undefined;

export function ProductForm({
  action,
  categories,
  defaults,
  submitLabel = "Add product",
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
  categories: { id: string; name: string }[];
  defaults?: {
    title?: string;
    description?: string | null;
    categoryId?: string | null;
    moq?: number;
    basePrice?: number;
    baseCurrency?: string;
    status?: string;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="title">Product title</Label>
        <Input id="title" name="title" defaultValue={defaults?.title} placeholder="High-Pressure Centrifugal Pump HP-450" required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={defaults?.description ?? ""} placeholder="Specs, materials, certifications, customization options…" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={defaults?.categoryId ?? ""}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={defaults?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active (visible)</option>
            <option value="DRAFT">Draft (hidden)</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="basePrice">Unit price</Label>
          <Input id="basePrice" name="basePrice" type="number" min={0} step="0.01" defaultValue={defaults?.basePrice} placeholder="1240" required />
        </div>
        <div>
          <Label htmlFor="baseCurrency">Currency</Label>
          <Select id="baseCurrency" name="baseCurrency" defaultValue={defaults?.baseCurrency ?? "USD"}>
            {["USD", "EUR", "GBP", "CNY", "INR", "AED"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="moq">MOQ</Label>
          <Input id="moq" name="moq" type="number" min={1} defaultValue={defaults?.moq ?? 1} required />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
      </Button>
    </form>
  );
}
