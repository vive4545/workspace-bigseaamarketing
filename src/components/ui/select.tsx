import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight styled native select (server-friendly, no JS required). */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-3.5 text-sm shadow-xs transition-all duration-200 hover:border-border focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
