"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string; desc?: string };
type NavGroup = { label: string; items: NavLink[] };

const NAV: NavGroup[] = [
  {
    label: "Marketplace",
    items: [
      { label: "Browse suppliers", href: "/suppliers", desc: "Verified manufacturers worldwide" },
      { label: "Browse products", href: "/products", desc: "Catalogs with localized pricing" },
      { label: "Categories", href: "/categories", desc: "Explore sourcing by industry" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "For buyers", href: "/register", desc: "Source & post RFQs, compare quotes" },
      { label: "For suppliers", href: "/register", desc: "List products, win new business" },
      { label: "How it works", href: "/about", desc: "From discovery to deal in 3 steps" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "FAQs", href: "/faqs", desc: "Common questions, answered" },
      { label: "Contact", href: "/contact", desc: "Talk to our team" },
    ],
  },
];

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("items-center gap-1", className)}>
      {NAV.map((group) => (
        <DropdownMenu key={group.label}>
          <DropdownMenuTrigger
            className="group inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground data-[state=open]:text-foreground"
          >
            {group.label}
            <ChevronDown className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={10} className="w-72 p-2">
            {group.items.map((item) => (
              <DropdownMenuItem key={item.label + item.href} asChild className="p-0">
                <Link
                  href={item.href}
                  className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.desc && (
                    <span className="text-xs leading-snug text-muted-foreground">
                      {item.desc}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}
