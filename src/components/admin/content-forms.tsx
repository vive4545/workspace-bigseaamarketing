"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type State = { error?: string; success?: string } | undefined;
type Action = (prev: State, formData: FormData) => Promise<State>;

function Feedback({ state }: { state: State }) {
  if (state?.error)
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <AlertCircle className="size-4" /> {state.error}
      </div>
    );
  if (state?.success)
    return (
      <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
        <CheckCircle2 className="size-4" /> {state.success}
      </div>
    );
  return null;
}

export function CategoryForm({
  action,
  parents,
  defaults,
  submitLabel = "Add category",
}: {
  action: Action;
  parents: { id: string; name: string }[];
  defaults?: { name?: string; parentId?: string | null };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaults?.name} placeholder="Category name" required />
      </div>
      <div className="w-52">
        <Label htmlFor="parentId">Parent</Label>
        <Select id="parentId" name="parentId" defaultValue={defaults?.parentId ?? ""}>
          <option value="">Top level</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
      </Button>
      <div className="w-full"><Feedback state={state} /></div>
    </form>
  );
}

export function FaqForm({
  action,
  defaults,
  submitLabel = "Add FAQ",
}: {
  action: Action;
  defaults?: { question?: string; answer?: string; category?: string | null; published?: boolean };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-3">
      <Feedback state={state} />
      <div>
        <Label htmlFor="question">Question</Label>
        <Input id="question" name="question" defaultValue={defaults?.question} required />
      </div>
      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea id="answer" name="answer" rows={3} defaultValue={defaults?.answer} required />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={defaults?.category ?? ""} placeholder="General" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={defaults?.published ?? true} className="size-4 accent-[var(--primary)]" />
          Published
        </label>
        <Button type="submit" disabled={pending} className="ml-auto">
          {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function CmsForm({
  action,
  defaults,
  submitLabel = "Save page",
}: {
  action: Action;
  defaults?: { title?: string; slug?: string; body?: string; published?: boolean };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaults?.title} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaults?.slug} placeholder="privacy-policy" required />
        </div>
      </div>
      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea id="body" name="body" rows={12} defaultValue={defaults?.body} required />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={defaults?.published ?? false} className="size-4 accent-[var(--primary)]" />
          Published
        </label>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} {submitLabel}
        </Button>
      </div>
    </form>
  );
}
