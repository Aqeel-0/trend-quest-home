import { Link } from "react-router-dom";
import { ImageOff, Star } from "lucide-react";

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
      aria-label={`View details for ${product.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
            -{product.discount}%
          </span>
        )}

        {hasImage ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {product.brand}
          </span>
        )}

        <h3 className="line-clamp-2 min-h-[2.5rem] text-[0.875rem] font-bold leading-snug tracking-tight text-foreground">
          {product.title}
        </h3>

        {(product.rating ?? 0) > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white w-fit">
            <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
            <span>{product.rating!.toFixed(1)}</span>
            {(product.reviewCount ?? 0) > 0 && (
              <span className="opacity-80">({product.reviewCount!.toLocaleString()})</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight text-foreground">
              {product.lowestPrice}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground/60 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/70 truncate">
            {product.store}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
