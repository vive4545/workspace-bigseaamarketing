"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  Building2,
  Coins,
  FileText,
  Heart,
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon };

const BUYER: Item[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rfqs", label: "My RFQs", icon: FileText },
  { href: "/dashboard/saved", label: "Saved", icon: Heart },
  { href: "/dashboard/credits", label: "Credits", icon: Coins },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: UserCog },
];

const SUPPLIER: Item[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rfq-feed", label: "RFQ feed", icon: Inbox },
  { href: "/dashboard/quotations", label: "Quotations", icon: FileText },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
  { href: "/dashboard/company", label: "Company", icon: Building2 },
  { href: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: UserCog },
];

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = role === "SUPPLIER" ? SUPPLIER : BUYER;

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
