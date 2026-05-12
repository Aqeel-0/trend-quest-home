import { Link } from "react-router-dom";
import { ImageOff, Star } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { StoreTag } from "@/components/StoreTag";

export type SearchProduct = {
  id: string;
  title: string;
  brand?: string;
  images: string[];
  lowestPrice: number;
  lowestStore: { name: string };
  originalPrice?: number | null;
  discount?: number | null;
  priceRange?: [number, number];
  rating: number;
  reviews: number;
  storeCount?: number;
};


export default function SearchResultCard({ product }: { product: SearchProduct }) {
  const primary = product.images[0];
  const secondary = product.images[1] ?? product.images[0];
  const hasImage = !!primary;
  const hasDiscount = (product.discount ?? 0) > 0;
  const hasOriginal = product.originalPrice != null && product.originalPrice > product.lowestPrice;
  const extraStores = (product.storeCount ?? 1) - 1;
  const displayTitle = product.brand && product.title.toLowerCase().startsWith(product.brand.toLowerCase())
    ? product.title.slice(product.brand.length).trim().replace(/^[-\u2013\u2014,\s]+/, '')
    : product.title;
  const brandDisplay = product.brand
    ? product.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : undefined;

  return (
    <Link
      to={`/product/${product.id}`}
      aria-label={`View details for ${product.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-border hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-white">
        {hasDiscount && (
          <span className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{Math.round(product.discount!)}%
          </span>
        )}
        {hasImage ? (
          <>
            <img src={primary} alt={product.title} loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-500 group-hover:opacity-0" />
            <img src={secondary} alt="" aria-hidden loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* ── Text body — grows to fill space ── */}
      <div className="flex flex-col flex-1 bg-slate-50 dark:bg-muted/40">
        <div className="px-4 pt-3 pb-2 flex flex-col gap-1.5 flex-1">
          {brandDisplay && (
            <span className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground/70">
              Brand · {brandDisplay}
            </span>
          )}
          <h3 className="line-clamp-2 text-[0.9rem] font-bold leading-snug capitalize tracking-[0.02em] text-foreground"
            title={product.title}>
            {displayTitle}
          </h3>
          {/* Fixed-height rating slot keeps all cards aligned */}
          <div className="h-7 flex items-center">
            {product.rating > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviews > 0 && (
                  <span className="text-muted-foreground/70">({product.reviews.toLocaleString()})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Price section — always flush at bottom ── */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-black/[0.18] rounded-b-2xl space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-foreground">{formatCurrency(product.lowestPrice)}</span>
            {hasOriginal && (
              <span className="text-sm text-muted-foreground/50 line-through">{formatCurrency(product.originalPrice!)}</span>
            )}
          </div>
          {product.lowestStore.name && (
            <div className="flex items-center gap-2">
              <StoreTag name={product.lowestStore.name} />
              {extraStores > 0 && (
                <span className="text-[12px] font-medium text-foreground/70 ml-auto">
                  +{extraStores} more {extraStores === 1 ? "store" : "stores"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

