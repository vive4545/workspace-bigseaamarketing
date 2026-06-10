import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Main nav bar ── */}
      <div className="border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: logo */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Center: nav with dropdowns */}
          <MainNav className="hidden md:flex" />

          {/* Right: auth / CTA */}
          <div className="flex flex-1 items-center justify-end gap-2">
            {user ? (
              <UserMenu name={user.name ?? null} email={user.email ?? null} role={user.role} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
