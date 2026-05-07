import { ImageOff } from "lucide-react";
import { highlightMatch } from "@/lib/highlightMatch";
import { formatCurrency } from "@/utils/currency";
import type { SearchSuggestion } from "@/lib/queries/searchQueries";

interface Props {
  item: SearchSuggestion;
  query: string;
}

export function SearchResultItem({ item, query }: Props) {
  const isVariant = item.entity_type === "variant";

  return (
    <div
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm"
      aria-label={`${item.entity_type === "brand" ? "Brand" : "Product"}: ${item.title}${item.min_price ? `, from ${formatCurrency(item.min_price)}` : ""}`}
    >
      {/* Thumbnail */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border/40 bg-secondary flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            aria-hidden
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <ImageOff className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-tight text-foreground">
          {highlightMatch(item.title, query)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {isVariant ? (item.subtitle ?? "") : "View all products"}
        </p>
      </div>

      {/* Right side */}
      <div className="shrink-0 text-right">
        {isVariant && item.min_price != null ? (
          <span className="text-xs font-semibold text-foreground">
            {formatCurrency(item.min_price)}
          </span>
        ) : !isVariant ? (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            Brand
          </span>
        ) : null}
      </div>
    </div>
  );
}
