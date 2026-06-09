import Link from "next/link";
import { BadgeCheck, Globe2, TrendingUp } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  { icon: BadgeCheck, text: "Vetted, verified supplier directory" },
  { icon: TrendingUp, text: "Post RFQs, receive competitive quotes" },
  { icon: Globe2, text: "Country-based pricing & currency conversion" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-ocean-mesh relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Source smarter from{" "}
            <span className="text-gradient">verified suppliers</span> worldwide.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of buyers and suppliers trading with confidence.
          </p>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                  <h.icon className="size-4" />
                </span>
                <span className="text-foreground/80">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} BigSeaa
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="p-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
