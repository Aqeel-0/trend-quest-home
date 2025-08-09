import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RatingStars from "./RatingStars";
import { Link } from "react-router-dom";

export type SearchProduct = {
  id: string;
  title: string;
  images: string[]; // [primary, secondary]
  lowestPrice: number; // in INR
  lowestStore: { name: string; logo?: string };
  priceRange?: [number, number];
  rating: number; // 0 - 5
  reviews: number;
};

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function SearchResultCard({ product }: { product: SearchProduct }) {
  const secondary = product.images[1] ?? product.images[0];

  return (
    <Card className="group overflow-hidden hover-scale shadow-subtle hover:shadow-elevated transition-shadow">
      <div className="relative aspect-[4/3] bg-muted/40">
        <img
          src={product.images[0]}
          alt={`${product.title} primary image`}
          className="h-full w-full object-cover transition-opacity duration-200 opacity-100 group-hover:opacity-0"
          loading="lazy"
        />
        <img
          src={secondary}
          alt={`${product.title} alternate image`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          loading="lazy"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium leading-tight line-clamp-2" title={product.title}>{product.title}</h3>

        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{formatINR(product.lowestPrice)}</div>
          <Badge variant="secondary">Lowest price</Badge>
        </div>

        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>From</span>
          <span className="font-medium text-foreground">{formatINR(product.lowestPrice)}</span>
          <span>at</span>
          <Avatar className="h-5 w-5">
            {product.lowestStore.logo ? (
              <AvatarImage src={product.lowestStore.logo} alt={`${product.lowestStore.name} logo`} />
            ) : (
              <AvatarFallback>{product.lowestStore.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <span className="truncate max-w-[120px]" title={product.lowestStore.name}>{product.lowestStore.name}</span>
        </div>

        <div className="mt-3">
          <Button asChild className="w-full">
            <Link to={`/product/${product.id}`} aria-label={`Compare prices for ${product.title}`}>
              Compare Prices
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
