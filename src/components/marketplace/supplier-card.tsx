import Link from "next/link";
import { BadgeCheck, Boxes, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SupplierCardData {
  slug: string;
  companyName: string;
  about: string | null;
  strength: string | null;
  verifiedBadge: boolean;
  country: { name: string } | null;
  _count: { products: number };
}

export function SupplierCard({ supplier }: { supplier: SupplierCardData }) {
  return (
    <Link href={`/suppliers/${supplier.slug}`} className="group">
      <Card className="flex h-full flex-col transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-sm font-bold text-primary">
              {supplier.companyName.slice(0, 2).toUpperCase()}
            </span>
            {supplier.verifiedBadge && (
              <Badge variant="success">
                <BadgeCheck className="size-3.5" /> Verified
              </Badge>
            )}
          </div>
          <div>
            <h3 className="font-semibold leading-tight group-hover:text-primary">
              {supplier.companyName}
            </h3>
            {supplier.country && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {supplier.country.name}
              </p>
            )}
          </div>
          {supplier.about && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {supplier.about}
            </p>
          )}
          {supplier.strength && (
            <p className="line-clamp-1 text-xs text-muted-foreground/80">
              {supplier.strength}
            </p>
          )}
          <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Boxes className="size-3.5" /> {supplier._count.products} products
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
