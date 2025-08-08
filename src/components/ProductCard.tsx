import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Product = {
  id: string;
  title: string;
  image: string;
  lowestPrice: string;
  store: string;
};

const storeColor: Record<string, string> = {
  NovaMart: "bg-accent",
  PriceHub: "bg-secondary",
  QuickBuy: "bg-muted",
  Shoply: "bg-secondary",
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="overflow-hidden hover-scale shadow-subtle hover:shadow-elevated transition-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-muted/40">
        <img src={product.image} alt={product.title + " product image"} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight line-clamp-2">{product.title}</h3>
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${storeColor[product.store] ?? 'bg-muted'}`} aria-label={`Store ${product.store}`}>
            {initials(product.store)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{product.lowestPrice}</div>
          <Badge variant="secondary">Lowest price</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
