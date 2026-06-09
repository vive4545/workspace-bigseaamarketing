import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Build a URL preserving existing search params with an overridden page. */
function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "page") sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors";

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={pageHref(basePath, params, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(base, page === 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={pageHref(basePath, params, p)}
              className={cn(
                base,
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-secondary",
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      <Link
        href={pageHref(basePath, params, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(base, page === totalPages && "pointer-events-none opacity-40")}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
