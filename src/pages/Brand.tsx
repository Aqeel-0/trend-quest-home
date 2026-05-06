import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SearchFilters, { FiltersState } from "@/components/SearchFilters";
import SearchResultCard, { type SearchProduct } from "@/components/SearchResultCard";
import { useSearchVariants, type SearchVariant } from "@/hooks/useSearchVariants";
import { extractPrimaryImage, extractAllImages } from "@/hooks/useProductVariantsWithListings";
import { Search, SlidersHorizontal, Loader2, X, ChevronRight } from "lucide-react";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

type SortKey = "lowest" | "highest" | "popular" | "newest";

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const mapVariantToSearchProduct = (variant: SearchVariant): SearchProduct => {
  const listings = variant.listings || [];
  const sortedListings = [...listings].sort((a, b) => a.price - b.price);
  const lowestPriceListing = sortedListings[0];
  const allImages = extractAllImages(variant.images);
  const primary = extractPrimaryImage(variant.images) || allImages[0] || "";
  const secondary = allImages.find((u) => u && u !== primary) || primary;
  const prices = listings.map((l) => l.price);
  const ratedListings = listings.filter((l) => l.rating != null && l.rating > 0);

  return {
    id: variant.id,
    title: variant.name || variant.products?.model_name || "Product",
    brand: variant.products?.brands?.name,
    images: [primary, secondary],
    lowestPrice: lowestPriceListing?.price || 0,
    lowestStore: { name: lowestPriceListing?.store_name || "N/A" },
    priceRange: prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
    rating:
      ratedListings.length > 0
        ? ratedListings.reduce((s, l) => s + (l.rating || 0), 0) / ratedListings.length
        : 0,
    reviews: listings.reduce((s, l) => s + (l.review_count || 0), 0),
    storeCount: listings.length,
  };
};

export default function Brand() {
  const { name: brandSlug } = useParams<{ name: string }>();
  const [params, setParams] = useSearchParams();

  // Capitalise brand name for display (e.g. "oneplus" → "OnePlus" not handled,
  // but at minimum make first letter uppercase)
  const brandName = brandSlug
    ? brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)
    : "";

  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebounced(query);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchVariants(debouncedQuery, brandName);

  const allVariants = useMemo(
    () => data?.pages?.flatMap((p) => p.variants) ?? [],
    [data]
  );
  const totalServerCount = data?.pages?.[0]?.totalCount ?? 0;

  const allStores = useMemo(() => {
    const s = new Set<string>();
    allVariants.forEach((v) => (v.listings || []).forEach((l) => { if (l.store_name) s.add(l.store_name); }));
    return Array.from(s).sort();
  }, [allVariants]);

  const { minPrice: dataMinPrice, maxPrice: dataMaxPrice } = useMemo(() => {
    let min = Infinity, max = 0;
    allVariants.forEach((v) => (v.listings || []).forEach((l) => {
      if (l.price < min) min = l.price;
      if (l.price > max) max = l.price;
    }));
    return { minPrice: min === Infinity ? 0 : min, maxPrice: max === 0 ? 100000 : max };
  }, [allVariants]);

  const [filters, setFilters] = useState<FiltersState>({
    price: [0, 100000],
    min: 0,
    max: 100000,
    selectedBrands: [],
    minRating: null,
    inStockOnly: false,
    selectedStores: [],
  });

  useEffect(() => {
    if (dataMaxPrice > 0 && (filters.min !== dataMinPrice || filters.max !== dataMaxPrice)) {
      setFilters((s) => ({ ...s, price: [dataMinPrice, dataMaxPrice], min: dataMinPrice, max: dataMaxPrice }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMinPrice, dataMaxPrice]);

  const [sortBy, setSortBy] = useState<SortKey>("lowest");

  useEffect(() => {
    document.title = `${brandName} Products | TrendQuest`;
    const desc = `Compare ${brandName} prices across top retailers on TrendQuest.`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, [brandName]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQuery) next.set("q", debouncedQuery);
    else next.delete("q");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const filteredVariants = useMemo(() => {
    let items = allVariants.slice();

    if (filters.selectedStores.length > 0) {
      items = items.filter((v) => (v.listings || []).some((l) => filters.selectedStores.includes(l.store_name)));
    }
    if (filters.minRating) {
      items = items.filter((v) => {
        const rated = (v.listings || []).filter((l) => l.rating != null && l.rating > 0);
        if (!rated.length) return false;
        return rated.reduce((s, l) => s + (l.rating || 0), 0) / rated.length >= filters.minRating!;
      });
    }
    if (filters.inStockOnly) {
      items = items.filter((v) => (v.listings || []).some((l) => l.stock_status === "in_stock"));
    }
    const isPriceFiltered = filters.price[0] > filters.min || filters.price[1] < filters.max;
    if (isPriceFiltered) {
      items = items.filter((v) => {
        const prices = (v.listings || []).map((l) => l.price);
        if (!prices.length) return false;
        const min = Math.min(...prices);
        return min >= filters.price[0] && min <= filters.price[1];
      });
    }

    switch (sortBy) {
      case "lowest":
        items.sort((a, b) =>
          Math.min(...(a.listings || []).map((l) => l.price), Infinity) -
          Math.min(...(b.listings || []).map((l) => l.price), Infinity));
        break;
      case "highest":
        items.sort((a, b) =>
          Math.max(...(b.listings || []).map((l) => l.price), 0) -
          Math.max(...(a.listings || []).map((l) => l.price), 0));
        break;
      case "popular":
        items.sort((a, b) =>
          (b.listings || []).reduce((s, l) => s + (l.review_count || 0), 0) -
          (a.listings || []).reduce((s, l) => s + (l.review_count || 0), 0));
        break;
      case "newest":
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return items;
  }, [allVariants, filters, sortBy]);

  const visibleItems = useMemo(() => filteredVariants.map(mapVariantToSearchProduct), [filteredVariants]);

  const clearFilters = () =>
    setFilters((s) => ({ ...s, price: [s.min, s.max], selectedBrands: [], selectedStores: [], minRating: null, inStockOnly: false }));

  const countLabel = isLoading
    ? "Loading products…"
    : `${visibleItems.length} ${visibleItems.length === 1 ? "result" : "results"}${totalServerCount > allVariants.length ? ` of ${totalServerCount}+` : ""}`;

  return (
    <div className="min-h-screen bg-background">

      {/* Sticky search / sort bar */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const next = new URLSearchParams(params);
              if (query.trim()) next.set("q", query.trim());
              else next.delete("q");
              setParams(next);
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search within ${brandName}`}
                className="h-11 rounded-full border-border/70 bg-secondary/50 pl-11 pr-10 text-sm placeholder:text-muted-foreground/70 focus-visible:bg-background"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

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
                    brands={[]}
                    stores={allStores}
                    state={filters}
                    onChange={(next) => setFilters((s) => ({ ...s, ...next }))}
                    onClear={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort — desktop */}
            <div className="hidden sm:block">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="h-11 w-[200px] rounded-full border-border/70 bg-secondary/50 text-sm" aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowest">Price: Low to High</SelectItem>
                  <SelectItem value="highest">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{brandName}</span>
        </nav>

        {/* Page title + count */}
        <div className="mb-6 flex flex-col gap-1.5 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {brandName}
          </h1>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="sticky top-[84px] hidden h-fit w-60 shrink-0 md:block">
            <SearchFilters
              brands={[]}
              stores={allStores}
              state={filters}
              onChange={(next) => setFilters((s) => ({ ...s, ...next }))}
              onClear={clearFilters}
            />
          </aside>

          <section className="flex-1 min-w-0">
            {/* Sort — mobile inline */}
            <div className="mb-5 sm:hidden">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="h-10 w-full rounded-full border-border/70 bg-secondary/50 text-sm" aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowest">Price: Low to High</SelectItem>
                  <SelectItem value="highest">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
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
                  No products found for "{brandName}"
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different keyword or adjust your filters.
                </p>
                <Button variant="outline" size="sm" className="mt-6 rounded-full" onClick={clearFilters}>
                  Clear filters
                </Button>
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
