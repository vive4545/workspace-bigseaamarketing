import { cn } from "@/lib/utils";

/**
 * Fancy branded loading state — a spinning ocean-gradient ring around the
 * pulsing wave mark, a glow, an indeterminate progress bar, and a label.
 * Used by route-level loading.tsx files (App Router Suspense fallbacks).
 */
export function BrandLoader({
  label = "Loading…",
  className,
  fullscreen = false,
}: {
  label?: string;
  className?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid w-full place-items-center",
        fullscreen ? "min-h-screen" : "min-h-[60vh]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative size-20">
          {/* Soft brand glow */}
          <div className="absolute inset-1 animate-pulse rounded-2xl bg-primary/25 blur-2xl" />
          {/* Spinning gradient ring */}
          <div className="loader-ring absolute inset-0 animate-spin rounded-full [animation-duration:1.1s]" />
          {/* Inner disc + pulsing wave mark */}
          <div className="absolute inset-[5px] grid place-items-center rounded-full border border-border/60 bg-card shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="size-8 animate-pulse text-primary"
              aria-hidden
              fill="none"
            >
              <path
                d="M2 15c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M2 19c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <circle cx="17" cy="7" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Indeterminate progress bar */}
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="animate-loader-slide absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>

        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
