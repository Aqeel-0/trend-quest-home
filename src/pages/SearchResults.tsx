import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SearchFilters, { type FiltersState } from "@/components/SearchFilters";
import SearchResultCard, { type SearchProduct } from "@/components/SearchResultCard";
import { useSearchFull } from "@/hooks/useSearchFull";
import { Search, SlidersHorizontal, Loader2, X, ChevronRight } from "lucide-react";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { type SearchFullItem } from "@/lib/queries/searchQueries";
import { useSearchDialog } from "@/contexts/SearchDialogContext";

type SortKey = "relevance" | "price_asc" | "price_desc" | "popular" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
];

function mapSearchResultToSearchProduct(item: SearchFullItem): SearchProduct {
  return {
    id: item.entity_id,
    title: item.title,
    brand: item.subtitle ?? undefined,
    images: item.image_url ? [item.image_url, item.image_url] : ["", ""],
    lowestPrice: item.min_price ?? 0,
    lowestStore: { name: item.lowest_store_name ?? "" },
    originalPrice: item.lowest_original_price ?? null,
    discount: item.lowest_discount_pct ?? null,
    priceRange: item.min_price != null && item.max_price != null
      ? [item.min_price, item.max_price]
      : undefined,
    rating: item.avg_rating ?? 0,
    reviews: 0,
    storeCount: item.popularity,
  };
}

function parseNum(v: string | null): number | undefined {
  const n = Number(v);
  return v && !isNaN(n) ? n : undefined;
}

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const { open: openSearch } = useSearchDialog();

  // All filter state lives in URL params
  const q = params.get("q") ?? "";
  const brand = params.get("brand") ?? undefined;
  const minPrice = parseNum(params.get("minPrice"));
  const maxPrice = parseNum(params.get("maxPrice"));
  const minRating = parseNum(params.get("minRating"));
  const inStockOnly = params.get("inStock") === "1";
  const sortBy = (params.get("sort") as SortKey) || "relevance";

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchFull({
    q,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    pageSize: 24,
  });

  const allItems = useMemo(
    () => data?.pages?.flatMap((p) => p.items) ?? [],
    [data]
  );
  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  const visibleItems = useMemo(
    () => allItems.map(mapSearchResultToSearchProduct),
    [allItems]
  );

  // Derive filter bounds from first page results
  const { dataMinPrice, dataMaxPrice } = useMemo(() => {
    const prices = allItems.flatMap((i) => [i.min_price, i.max_price]).filter((v): v is number => v != null);
    return {
      dataMinPrice: prices.length ? Math.min(...prices) : 0,
      dataMaxPrice: prices.length ? Math.max(...prices) : 100000,
    };
  }, [allItems]);

  // Build filter state object from URL for the sidebar
  const filtersState: FiltersState = {
    price: [minPrice ?? dataMinPrice, maxPrice ?? dataMaxPrice],
    min: dataMinPrice,
    max: dataMaxPrice,
    selectedBrands: brand ? [brand] : [],
    minRating: minRating ?? null,
    inStockOnly,
    selectedStores: [],
  };

  const setFilter = (next: Partial<FiltersState>) => {
    const p = new URLSearchParams(params);

    if (next.price !== undefined) {
      const [lo, hi] = next.price;
      if (lo > dataMinPrice) p.set("minPrice", String(lo)); else p.delete("minPrice");
      if (hi < dataMaxPrice) p.set("maxPrice", String(hi)); else p.delete("maxPrice");
    }
    if (next.selectedBrands !== undefined) {
      if (next.selectedBrands.length === 1) p.set("brand", next.selectedBrands[0]);
      else p.delete("brand");
    }
    if (next.minRating !== undefined) {
      if (next.minRating) p.set("minRating", String(next.minRating)); else p.delete("minRating");
    }
    if (next.inStockOnly !== undefined) {
      if (next.inStockOnly) p.set("inStock", "1"); else p.delete("inStock");
    }

    setParams(p, { replace: true });
  };

  const clearFilters = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sortBy !== "relevance") p.set("sort", sortBy);
    setParams(p, { replace: true });
  };

  const clearBrand = () => {
    const p = new URLSearchParams(params);
    p.delete("brand");
    setParams(p);
  };

  const brandDisplay = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : undefined;

  // SEO
  useEffect(() => {
    const base = brandDisplay ? `${brandDisplay} products` : q ? `"${q}"` : "All products";
    document.title = `${base} | TrendQuest`;
    const desc = `Compare prices for ${base} across top retailers on TrendQuest.`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
  }, [q, brandDisplay]);

  const pageTitle = brandDisplay
    ? brandDisplay
    : q
      ? <>Results for <span className="font-normal text-muted-foreground">"{q}"</span></>
      : "All products";

  const countLabel = isLoading
    ? "Loading products…"
    : `${visibleItems.length} ${visibleItems.length === 1 ? "result" : "results"}${totalCount > allItems.length ? ` of ${totalCount}+` : ""}`;

  return (
    <div className="min-h-screen bg-background">

      {/* Sticky bar — clicking search re-opens dialog */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSearch}
              className="relative flex h-11 flex-1 items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-4 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-secondary"
              aria-label="Open search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left truncate">
                {q || brand || "Search for products, brands, or models"}
              </span>
              {(q || brand) && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear search"
                  onClick={(e) => {
                    e.stopPropagation();
                    const p = new URLSearchParams(params);
                    p.delete("q");
                    p.delete("brand");
                    setParams(p);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
                  className="rounded-full p-1 hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>

            {/* Mobile filters sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-full md:hidden" aria-label="Open filters">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-6">
                  <SearchFilters
                    brands={brand ? [brand] : []}
                    stores={[]}
                    state={filtersState}
                    onChange={setFilter}
                    onClear={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort — desktop */}
            <div className="hidden sm:block">
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  const p = new URLSearchParams(params);
                  if (v === "relevance") p.delete("sort"); else p.set("sort", v);
                  setParams(p, { replace: true });
                }}
              >
                <SelectTrigger className="h-11 w-[200px] rounded-full border-border/70 bg-secondary/50 text-sm" aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb for brand pages */}
        {brand && (
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{brandDisplay}</span>
          </nav>
        )}

        {/* Page title + count */}
        <div className="mb-6 flex flex-col gap-1.5 sm:mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {pageTitle}
            </h1>
            {brandDisplay && (
              <button
                type="button"
                onClick={clearBrand}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {brandDisplay}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">{countLabel}</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="sticky top-[84px] hidden h-fit w-60 shrink-0 md:block">
            <SearchFilters
              brands={brand ? [brand] : []}
              stores={[]}
              state={filtersState}
              onChange={setFilter}
              onClear={clearFilters}
            />
          </aside>

          <section className="flex-1 min-w-0">
            {/* Sort — mobile */}
            <div className="mb-5 sm:hidden">
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  const p = new URLSearchParams(params);
                  if (v === "relevance") p.delete("sort"); else p.set("sort", v);
                  setParams(p, { replace: true });
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-full border-border/70 bg-secondary/50 text-sm" aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-24 text-center">
                <Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-base font-medium text-foreground">
                  No products found{brandDisplay ? ` for "${brandDisplay}"` : q ? ` for "${q}"` : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different keyword or adjust your filters.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {brandDisplay && (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={clearBrand}>
                      Clear brand filter
                    </Button>
                  )}
                  {q && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        const p = new URLSearchParams(params);
                        p.delete("q");
                        setParams(p);
                      }}
                    >
                      Clear search
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="rounded-full" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((p) => (
                  <SearchResultCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Load more */}
            {!isLoading && visibleItems.length > 0 && (
              <div className="mt-10 flex flex-col items-center gap-2">
                {hasNextPage ? (
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="rounded-full px-8 py-6 text-sm font-medium"
                  >
                    {isFetchingNextPage ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">You've reached the end</p>
                )}
                {isFetching && !isFetchingNextPage && (
                  <p className="text-xs text-muted-foreground">Refreshing…</p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
