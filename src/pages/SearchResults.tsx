import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import SearchFilters, { FiltersState } from "@/components/SearchFilters";
import SearchResultCard, { type SearchProduct } from "@/components/SearchResultCard";
import { useHomePageProducts, HomePageVariant } from "@/hooks/useHomePageProducts";
import { extractPrimaryImage } from "@/hooks/useProductVariantsWithListings";

import { Search } from "lucide-react";

type SortKey = "lowest" | "highest" | "popular" | "newest";

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const mapVariantToSearchProduct = (variant: HomePageVariant): SearchProduct => {
  const listings = variant.listings || [];
  const sortedListings = [...listings].sort((a, b) => a.price - b.price);
  const lowestPriceListing = sortedListings[0];
  const imageUrl = extractPrimaryImage(variant.images) || "";

  const prices = listings.map((l) => l.price);
  const ratedListings = listings.filter((l) => l.rating != null && l.rating > 0);

  return {
    id: variant.id,
    title: variant.name || variant.products?.model_name || "Product",
    images: [imageUrl, imageUrl],
    lowestPrice: lowestPriceListing?.price || 0,
    lowestStore: { name: lowestPriceListing?.store_name || "N/A" },
    priceRange: prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
    rating:
      ratedListings.length > 0
        ? ratedListings.reduce((s, l) => s + (l.rating || 0), 0) / ratedListings.length
        : 0,
    reviews: listings.reduce((s, l) => s + (l.review_count || 0), 0),
  };
};

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebounced(query);

  const { data: variants = [], isLoading } = useHomePageProducts();

  // Build filter lists from real data
  const allBrands = useMemo(() => {
    const brandSet = new Set<string>();
    variants.forEach((v) => {
      if (v.products?.brands?.name) brandSet.add(v.products.brands.name);
    });
    return Array.from(brandSet).sort();
  }, [variants]);

  const allStores = useMemo(() => {
    const storeSet = new Set<string>();
    variants.forEach((v) =>
      (v.listings || []).forEach((l) => {
        if (l.store_name) storeSet.add(l.store_name);
      })
    );
    return Array.from(storeSet).sort();
  }, [variants]);

  const { minPrice: dataMinPrice, maxPrice: dataMaxPrice } = useMemo(() => {
    let min = Infinity;
    let max = 0;
    variants.forEach((v) =>
      (v.listings || []).forEach((l) => {
        if (l.price < min) min = l.price;
        if (l.price > max) max = l.price;
      })
    );
    return { minPrice: min === Infinity ? 0 : min, maxPrice: max === 0 ? 100000 : max };
  }, [variants]);

  const [filters, setFilters] = useState<FiltersState>({
    price: [0, 100000],
    min: 0,
    max: 100000,
    selectedBrands: [],
    minRating: null,
    inStockOnly: false,
    selectedStores: [],
  });

  // Sync filter price bounds with data
  useEffect(() => {
    if (dataMaxPrice > 0) {
      setFilters((s) => ({
        ...s,
        price: [dataMinPrice, dataMaxPrice],
        min: dataMinPrice,
        max: dataMaxPrice,
      }));
    }
  }, [dataMinPrice, dataMaxPrice]);

  const [sortBy, setSortBy] = useState<SortKey>("lowest");
  const [visible, setVisible] = useState(12);

  // SEO
  useEffect(() => {
    const title = query ? `Search results for "${query}" | TrendQuest` : "Browse all products | TrendQuest";
    document.title = title;
    const desc = `Find the best prices across stores for ${query || "your favorite products"}. Compare deals on TrendQuest.`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentElement) document.head.appendChild(canonical);
  }, [query]);

  // Sync query to URL
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQuery) next.set("q", debouncedQuery);
    else next.delete("q");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Filter and sort at variant level, then map to SearchProduct
  const visibleItems = useMemo(() => {
    let items = variants.slice();

    // Search query
    if (debouncedQuery) {
      const key = debouncedQuery.toLowerCase();
      items = items.filter(
        (v) =>
          v.name?.toLowerCase().includes(key) ||
          v.products?.model_name?.toLowerCase().includes(key) ||
          v.products?.brands?.name?.toLowerCase().includes(key)
      );
    }

    // Brand filter
    if (filters.selectedBrands.length > 0) {
      items = items.filter((v) =>
        filters.selectedBrands.includes(v.products?.brands?.name || "")
      );
    }

    // Store filter
    if (filters.selectedStores.length > 0) {
      items = items.filter((v) =>
        (v.listings || []).some((l) => filters.selectedStores.includes(l.store_name))
      );
    }

    // Rating filter
    if (filters.minRating) {
      items = items.filter((v) => {
        const ratedListings = (v.listings || []).filter((l) => l.rating != null && l.rating > 0);
        if (ratedListings.length === 0) return false;
        const avg =
          ratedListings.reduce((s, l) => s + (l.rating || 0), 0) / ratedListings.length;
        return avg >= filters.minRating!;
      });
    }

    // Stock filter
    if (filters.inStockOnly) {
      items = items.filter((v) =>
        (v.listings || []).some((l) => l.stock_status === "in_stock")
      );
    }

    // Price range filter
    items = items.filter((v) => {
      const prices = (v.listings || []).map((l) => l.price);
      if (prices.length === 0) return false;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return max >= filters.price[0] && min <= filters.price[1];
    });

    // Sort
    switch (sortBy) {
      case "lowest":
        items.sort((a, b) => {
          const aMin = Math.min(...(a.listings || []).map((l) => l.price), Infinity);
          const bMin = Math.min(...(b.listings || []).map((l) => l.price), Infinity);
          return aMin - bMin;
        });
        break;
      case "highest":
        items.sort((a, b) => {
          const aMax = Math.max(...(a.listings || []).map((l) => l.price), 0);
          const bMax = Math.max(...(b.listings || []).map((l) => l.price), 0);
          return bMax - aMax;
        });
        break;
      case "popular":
        items.sort((a, b) => {
          const aReviews = (a.listings || []).reduce((s, l) => s + (l.review_count || 0), 0);
          const bReviews = (b.listings || []).reduce((s, l) => s + (l.review_count || 0), 0);
          return bReviews - aReviews;
        });
        break;
      case "newest":
        items.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return items.slice(0, visible).map(mapVariantToSearchProduct);
  }, [variants, debouncedQuery, filters, sortBy, visible]);

  const totalFiltered = useMemo(() => {
    // Recalculate total count without the slice
    let items = variants.slice();

    if (debouncedQuery) {
      const key = debouncedQuery.toLowerCase();
      items = items.filter(
        (v) =>
          v.name?.toLowerCase().includes(key) ||
          v.products?.model_name?.toLowerCase().includes(key) ||
          v.products?.brands?.name?.toLowerCase().includes(key)
      );
    }
    if (filters.selectedBrands.length > 0) {
      items = items.filter((v) =>
        filters.selectedBrands.includes(v.products?.brands?.name || "")
      );
    }
    if (filters.selectedStores.length > 0) {
      items = items.filter((v) =>
        (v.listings || []).some((l) => filters.selectedStores.includes(l.store_name))
      );
    }
    if (filters.minRating) {
      items = items.filter((v) => {
        const ratedListings = (v.listings || []).filter((l) => l.rating != null && l.rating > 0);
        if (ratedListings.length === 0) return false;
        const avg =
          ratedListings.reduce((s, l) => s + (l.rating || 0), 0) / ratedListings.length;
        return avg >= filters.minRating!;
      });
    }
    if (filters.inStockOnly) {
      items = items.filter((v) =>
        (v.listings || []).some((l) => l.stock_status === "in_stock")
      );
    }
    items = items.filter((v) => {
      const prices = (v.listings || []).map((l) => l.price);
      if (prices.length === 0) return false;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return max >= filters.price[0] && min <= filters.price[1];
    });

    return items.length;
  }, [variants, debouncedQuery, filters]);

  const canLoadMore = visible < totalFiltered;

  if (isLoading) {
    return (
      <div>
        <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Search Bar */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                const next = new URLSearchParams(params);
                next.set("q", query.trim());
                setParams(next);
              }
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, stores..."
                className="pl-9"
                aria-label="Search products"
              />
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Filters</Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <SearchFilters
                      brands={allBrands}
                      stores={allStores}
                      state={filters}
                      onChange={(next) => setFilters((s) => ({ ...s, ...next }))}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort */}
            <div className="hidden sm:block w-[220px]">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowest">Lowest Price</SelectItem>
                  <SelectItem value="highest">Highest Price</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <SearchFilters
              brands={allBrands}
              stores={allStores}
              state={filters}
              onChange={(next) => setFilters((s) => ({ ...s, ...next }))}
            />
          </aside>

          <section className="flex-1">
            {/* Sort (mobile inline) */}
            <div className="sm:hidden mb-4">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger aria-label="Sort results">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowest">Lowest Price</SelectItem>
                  <SelectItem value="highest">Highest Price</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <Separator className="mt-4" />
            </div>

            {/* Results summary */}
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {visibleItems.length} of {totalFiltered} results{" "}
                {query ? `for "${query}"` : ""}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleItems.map((p) => (
                <SearchResultCard key={p.id} product={p} />
              ))}
            </div>

            {/* Empty state */}
            {visibleItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found{query ? ` matching "${query}"` : ""}.</p>
                {query && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setQuery("");
                      const next = new URLSearchParams(params);
                      next.delete("q");
                      setParams(next);
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}

            {/* Load More */}
            <div className="mt-6 flex justify-center">
              {canLoadMore ? (
                <Button onClick={() => setVisible((v) => v + 8)}>Load More</Button>
              ) : visibleItems.length > 0 ? (
                <span className="text-sm text-muted-foreground">No more results</span>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
