"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, ShoppingBag, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerUser } from "@/server/actions/auth";

type Role = "BUYER" | "SUPPLIER";

const labelCls = "mb-1.5 block text-sm font-medium";
const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RegisterForm({
  countries,
}: {
  countries: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("BUYER");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    companyName: "",
    countryCode: "",
    about: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function validateAccountStep(): boolean {
    if (f.name.trim().length < 2) return fail("Enter your full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return fail("Enter a valid email.");
    if (f.password.length < 8) return fail("Password must be at least 8 characters.");
    setError(null);
    return true;
  }
  function fail(msg: string) {
    setError(msg);
    return false;
  }

  function submit() {
    setError(null);
    const input =
      role === "SUPPLIER"
        ? {
            role: "SUPPLIER" as const,
            name: f.name,
            email: f.email,
            password: f.password,
            companyName: f.companyName,
            countryCode: f.countryCode,
            about: f.about || undefined,
          }
        : {
            role: "BUYER" as const,
            name: f.name,
            email: f.email,
            password: f.password,
            company: f.company || undefined,
          };

    start(async () => {
      const res = await registerUser(input);
      if (!res.ok) {
        setError(res.error);
        if (role === "SUPPLIER") setStep(1);
        return;
      }
      const signin = await signIn("credentials", {
        email: f.email,
        password: f.password,
        redirect: false,
      });
      if (signin?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "SUPPLIER" && step === 1) {
      if (validateAccountStep()) setStep(2);
      return;
    }
    submit();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Join as a buyer or supplier — it’s free to start.
      </p>

      {/* Role selector */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {([
          { value: "BUYER", label: "I'm buying", icon: ShoppingBag },
          { value: "SUPPLIER", label: "I'm selling", icon: Store },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setRole(opt.value);
              setStep(1);
              setError(null);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors",
              role === opt.value
                ? "border-primary bg-primary/5 text-primary"
                : "hover:bg-secondary",
            )}
          >
            <opt.icon className="size-5" />
            {opt.label}
          </button>
        ))}
      </div>

      {role === "SUPPLIER" && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("font-medium", step === 1 && "text-primary")}>1. Account</span>
          <span className="h-px flex-1 bg-border" />
          <span className={cn("font-medium", step === 2 && "text-primary")}>2. Company</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {(role === "BUYER" || step === 1) && (
          <>
            <div>
              <label className={labelCls} htmlFor="name">Full name</label>
              <Input id="name" value={f.name} onChange={set("name")} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className={labelCls} htmlFor="email">Work email</label>
              <Input id="email" type="email" value={f.email} onChange={set("email")} placeholder="you@company.com" required />
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <Input id="password" type="password" value={f.password} onChange={set("password")} placeholder="At least 8 characters" required />
              <p className="mt-1 text-xs text-muted-foreground">
                8+ characters with upper, lower and a number.
              </p>
            </div>
            {role === "BUYER" && (
              <div>
                <label className={labelCls} htmlFor="company">Company (optional)</label>
                <Input id="company" value={f.company} onChange={set("company")} placeholder="Atlas Retail Group" />
              </div>
            )}
          </>
        )}

        {role === "SUPPLIER" && step === 2 && (
          <>
            <div>
              <label className={labelCls} htmlFor="companyName">Company name</label>
              <Input id="companyName" value={f.companyName} onChange={set("companyName")} placeholder="Acme Industrial Co." required />
            </div>
            <div>
              <label className={labelCls} htmlFor="countryCode">Country</label>
              <select id="countryCode" value={f.countryCode} onChange={set("countryCode")} className={selectCls} required>
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="about">About your company (optional)</label>
              <textarea
                id="about"
                value={f.about}
                onChange={set("about")}
                rows={3}
                placeholder="What you manufacture, certifications, capacity…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          {role === "SUPPLIER" && step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={pending}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {role === "SUPPLIER" && step === 1 ? (
              <>Continue <ArrowRight className="size-4" /></>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>

      {role === "BUYER" && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
