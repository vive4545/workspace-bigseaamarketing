import Link from "next/link";
import { BadgeCheck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";

export interface ProductCardData {
  slug: string;
  title: string;
  moq: number;
  price: { amount: number; currency: string; converted: boolean };
  category: { name: string } | null;
  supplier: { companyName: string; verifiedBadge: boolean };
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="card-hover flex h-full flex-col overflow-hidden">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/60 to-secondary/30">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent" />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-card/70 shadow-sm ring-1 ring-inset ring-border/60 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3">
            <Package className="size-7 text-primary/55" />
          </span>
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 border border-border/60 shadow-xs backdrop-blur"
            >
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {product.supplier.companyName}
            {product.supplier.verifiedBadge && (
              <BadgeCheck className="size-3.5 text-success" />
            )}
          </p>
          <div className="mt-auto flex items-end justify-between border-t border-border/60 pt-3">
            <div>
              <div className="text-lg font-bold tabular-nums text-primary">
                {formatMoney(product.price.amount, product.price.currency)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                MOQ {product.moq}
                {product.price.converted && " · approx."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
