import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/15",
        secondary:
          "bg-secondary text-secondary-foreground ring-border/60",
        accent: "bg-accent/15 text-accent ring-accent/20",
        success: "bg-success/15 text-success ring-success/20",
        warning: "bg-warning/20 text-warning-foreground ring-warning/25",
        destructive: "bg-destructive/15 text-destructive ring-destructive/20",
        outline: "text-foreground ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
