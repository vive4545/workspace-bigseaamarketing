import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-ocean-mesh grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <Logo className="mb-8 justify-center" />
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/suppliers">Browse suppliers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
