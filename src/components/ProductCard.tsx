import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Star, ArrowUpRight, ImageOff } from "lucide-react";

export type Product = {
  id: string;
  title: string;
  brand?: string;
  image: string;
  lowestPrice: string;
  originalPrice?: string | null;
  discount?: number;
  store: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const hasDiscount = product.discount != null && product.discount > 0;
  const hasImage = product.image && product.image.length > 0;

  const productUrl = product.category
    ? `/product/${product.id}?category=${product.category}`
    : `/product/${product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative flex flex-col rounded-[1.75rem] border border-border bg-card overflow-hidden hover-lift block h-full"
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/40">
        {/* Top tags */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-2">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-success text-success-foreground px-2.5 py-1 text-[10px] font-bold">
              -{product.discount}%
            </span>
          )}
        </div>

        {hasImage ? (
          <img
            src={product.image}
            alt={product.title}
            width={1024}
            height={1024}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Hover arrow */}
        <span className="absolute bottom-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur text-foreground translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-smooth shadow-sm">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-center justify-between text-xs">
          {product.brand ? (
            <span className="font-medium uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </span>
          ) : (
            <span />
          )}
          {product.rating != null && product.rating > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-foreground font-medium">{product.rating.toFixed(1)}</span>
              {product.reviewCount != null && product.reviewCount > 0 && (
                <span className="opacity-70">({product.reviewCount.toLocaleString()})</span>
              )}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-[1.05rem] leading-snug line-clamp-2 min-h-[2.6rem] text-foreground tracking-tight">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            {product.lowestPrice}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Badge variant="secondary" className="whitespace-nowrap">
            {product.store}
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
