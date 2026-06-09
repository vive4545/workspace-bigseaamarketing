"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/server/actions/profile";

type State = { error?: string; success?: string } | undefined;

export function ProfileForm({
  role,
  defaults,
}: {
  role: string;
  defaults: { name: string; phone: string; company: string; about: string };
}) {
  const [state, action, pending] = useActionState<State, FormData>(updateProfile, undefined);

  return (
    <form action={action} className="space-y-4">
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

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={defaults.name} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={defaults.phone} placeholder="+1 555 000 0000" />
      </div>
      {role === "SUPPLIER" ? (
        <div>
          <Label htmlFor="about">Company description</Label>
          <Textarea id="about" name="about" rows={4} defaultValue={defaults.about} />
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={defaults.company} />
          </div>
          <div>
            <Label htmlFor="about">About</Label>
            <Textarea id="about" name="about" rows={3} defaultValue={defaults.about} />
          </div>
        </>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Save changes
      </Button>
    </form>
  );
}
