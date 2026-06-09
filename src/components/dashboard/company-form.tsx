"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateCompany } from "@/server/actions/company";

type State = { error?: string; success?: string } | undefined;

export function CompanyForm({
  countries,
  defaults,
}: {
  countries: { code: string; name: string }[];
  defaults: {
    companyName: string;
    about: string;
    strength: string;
    websiteUrl: string;
    contactEmail: string;
    contactPhone: string;
    countryCode: string;
    paymentTerms: string;
    shippingTerms: string;
  };
}) {
  const [state, action, pending] = useActionState<State, FormData>(updateCompany, undefined);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4" /> {state.success}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" defaultValue={defaults.companyName} required />
        </div>
        <div>
          <Label htmlFor="countryCode">Country</Label>
          <Select id="countryCode" name="countryCode" defaultValue={defaults.countryCode}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="about">About</Label>
        <Textarea id="about" name="about" rows={4} defaultValue={defaults.about} placeholder="What you manufacture, history, markets served…" />
      </div>

      <div>
        <Label htmlFor="strength">Key strengths</Label>
        <Input id="strength" name="strength" defaultValue={defaults.strength} placeholder="ISO certified · 5,000 sqm factory · 200 staff" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={defaults.websiteUrl} placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={defaults.contactEmail} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" name="contactPhone" defaultValue={defaults.contactPhone} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="paymentTerms">Payment terms</Label>
          <Input id="paymentTerms" name="paymentTerms" defaultValue={defaults.paymentTerms} placeholder="T/T, L/C at sight" />
        </div>
        <div>
          <Label htmlFor="shippingTerms">Shipping terms</Label>
          <Input id="shippingTerms" name="shippingTerms" defaultValue={defaults.shippingTerms} placeholder="FOB / CIF" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Save company profile
      </Button>
    </form>
  );
}
