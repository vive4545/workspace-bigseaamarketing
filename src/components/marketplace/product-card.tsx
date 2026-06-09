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
      <Card className="flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="relative grid aspect-[4/3] place-items-center bg-gradient-to-br from-secondary to-secondary/40">
          <Package className="size-10 text-muted-foreground/40" />
          {product.category && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
            {product.title}
          </h3>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {product.supplier.companyName}
            {product.supplier.verifiedBadge && (
              <BadgeCheck className="size-3.5 text-success" />
            )}
          </p>
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <div className="text-lg font-bold text-primary">
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
