import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SelectFilter {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
}

/**
 * URL-driven filter bar (GET form). Server-rendered and crawlable — filters
 * become query params, keeping listing pages SEO-friendly and shareable.
 */
export function FilterBar({
  action,
  query,
  searchPlaceholder = "Search…",
  selects = [],
}: {
  action: string;
  query?: string;
  searchPlaceholder?: string;
  selects?: SelectFilter[];
}) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={query}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      {selects.map((s) => (
        <select
          key={s.name}
          name={s.name}
          defaultValue={s.value ?? ""}
          aria-label={s.label}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{s.label}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      <Button type="submit" className="sm:w-auto">
        Apply
      </Button>
    </form>
  );
}
