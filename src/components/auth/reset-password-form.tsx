"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/server/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    const confirm = String(data.get("confirm"));
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    start(async () => {
      const res = await resetPassword({ token, password });
      if (!res.ok) setError(res.error);
      else {
        setDone(true);
        setTimeout(() => router.push("/login"), 1500);
      }
    });
  }

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is missing or invalid.
        </p>
        <Button variant="outline" asChild className="mt-6 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password you’ll remember.</p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="password">New password</label>
          <Input id="password" name="password" type="password" required placeholder="At least 8 characters" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="confirm">Confirm password</label>
          <Input id="confirm" name="confirm" type="password" required placeholder="Re-enter password" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Update password
        </Button>
      </form>
    </div>
  );
}
