import { Link } from "react-router-dom";
import { ImageOff, Star } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

export type SearchProduct = {
  id: string;
  title: string;
  brand?: string;
  images: string[];
  lowestPrice: number;
  lowestStore: { name: string; logo?: string };
  priceRange?: [number, number];
  rating: number;
  reviews: number;
  storeCount?: number;
};

export default function SearchResultCard({ product }: { product: SearchProduct }) {
  const primary = product.images[0];
  const secondary = product.images[1] ?? product.images[0];
  const hasImage = !!primary;

  return (
    <Link
      to={`/product/${product.id}`}
      aria-label={`View details for ${product.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {hasImage ? (
          <>
            <img
              src={primary}
              alt={product.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
            />
            <img
              src={secondary}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {product.brand}
          </span>
        )}

        <h3
          className="line-clamp-2 min-h-[2.5rem] text-[0.875rem] font-bold leading-snug tracking-tight text-foreground"
          title={product.title}
        >
          {product.title}
        </h3>

        {product.rating > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white w-fit">
            <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
            <span>{product.rating.toFixed(1)}</span>
            {product.reviews > 0 && <span className="opacity-80">({product.reviews.toLocaleString()})</span>}
          </div>
        )}

        <div className="mt-auto pt-3 space-y-0.5">
          <span className="text-base font-bold tracking-tight text-foreground">
            {formatCurrency(product.lowestPrice)}
          </span>
          <p className="text-[11px] text-muted-foreground/70">
            {product.storeCount && product.storeCount > 1
              ? `Across ${product.storeCount} stores`
              : `at ${product.lowestStore.name}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
