"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addDocument } from "@/server/actions/company";

type State = { error?: string; success?: string } | undefined;

const DOC_TYPES = [
  "Business license",
  "Tax certificate",
  "ISO certificate",
  "Export license",
  "Quality certification",
  "Other",
];

export function DocumentForm() {
  const [state, action, pending] = useActionState<State, FormData>(addDocument, undefined);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="type">Document type</Label>
          <Select id="type" name="type" required>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="fileUrl">Document URL</Label>
          <Input id="fileUrl" name="fileUrl" type="url" placeholder="https://…/license.pdf" required />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a link to your document. Direct file uploads (Cloudflare R2) are
        wired in at deployment.
      </p>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        <Upload className="size-4" /> Submit document
      </Button>
    </form>
  );
}
