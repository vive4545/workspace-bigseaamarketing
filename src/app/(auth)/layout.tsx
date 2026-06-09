import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-ocean-mesh relative hidden flex-col justify-between p-10 lg:flex">
        <Logo />
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold tracking-tight">
            Source smarter from verified suppliers worldwide.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of buyers and suppliers trading with confidence.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
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
