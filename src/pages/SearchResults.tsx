import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import SearchFilters, { FiltersState } from "@/components/SearchFilters";
import SearchResultCard, { type SearchProduct } from "@/components/SearchResultCard";

import { Search } from "lucide-react";

// Assets (using existing demo images)
import imgHeadphones from "@/assets/prod-headphones.jpg";
import imgSneakers from "@/assets/prod-sneakers.jpg";
import imgWatch from "@/assets/prod-watch.jpg";
import imgLaptop from "@/assets/prod-laptop.jpg";
import imgCoffee from "@/assets/prod-coffeemaker.jpg";
import imgController from "@/assets/prod-controller.jpg";



import { useSearchProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

type SortKey = "lowest" | "highest" | "popular" | "newest";

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebounced(query);

  // Fetch products from Supabase
  const { data: searchProducts, isLoading } = useSearchProducts(debouncedQuery);

  // Convert Supabase data to SearchProduct format
  const demoProducts: SearchProduct[] = useMemo(() => {
    if (!searchProducts) return [];
    
    const fallbackImages = [imgHeadphones, imgSneakers, imgWatch, imgLaptop, imgCoffee, imgController];
    
    return searchProducts.map((product, index) => ({
      id: product.id,
      title: product.model_name,
      images: [fallbackImages[index % fallbackImages.length], fallbackImages[index % fallbackImages.length]],
      lowestPrice: product.min_price || 0,
      lowestStore: { name: "Multiple stores" },
      priceRange: [product.min_price || 0, product.max_price || product.min_price || 0],
      rating: product.rating || 4.0,
      reviews: Math.floor(Math.random() * 1000) + 100, // Random for demo
    }));
  }, [searchProducts]);

  // Build lists from data
  const allBrands = ["Acme", "ZenX", "Nova", "Swift", "Aeron"];
  const allStores = ["NovaMart", "PriceHub", "QuickBuy", "Shoply"];

  const prices = demoProducts.flatMap((p) => p.priceRange ?? [p.lowestPrice, p.lowestPrice]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const [filters, setFilters] = useState<FiltersState>({
    price: [minPrice, maxPrice],
    min: minPrice,
    max: maxPrice,
    selectedBrands: [],
    minRating: null,
    inStockOnly: false,
    selectedStores: [],
  });

  const [sortBy, setSortBy] = useState<SortKey>("lowest");
  const [visible, setVisible] = useState(12);

  // SEO
  useEffect(() => {
    const title = query ? `Search results for "${query}" | ShopCompare` : "Search | ShopCompare";
    document.title = title;
    const desc = `Find the best prices across stores for ${query || "your favorite products"}. Compare deals on ShopCompare.`;
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
  }, [debouncedQuery]);

  const filtered = useMemo(() => {
    let items = demoProducts.slice();

    if (debouncedQuery) {
      const key = debouncedQuery.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(key));
    }

    // Price range
    items = items.filter((p) => {
      const [min, max] = p.priceRange ?? [p.lowestPrice, p.lowestPrice];
      return max >= filters.price[0] && min <= filters.price[1];
    });

    // Stores
    if (filters.selectedStores.length) {
      items = items.filter((p) => filters.selectedStores.includes(p.lowestStore.name));
    }

    // Brands (demo: randomly assign faux brands based on id)
    if (filters.selectedBrands.length) {
      items = items.filter((p) => {
        const brand = allBrands[parseInt(p.id) % allBrands.length];
        return filters.selectedBrands.includes(brand);
      });
    }

    // Rating
    if (filters.minRating) items = items.filter((p) => p.rating >= filters.minRating!);

    // Availability (demo: alternate availability by id)
    if (filters.inStockOnly) items = items.filter((p) => parseInt(p.id) % 2 === 0);

    switch (sortBy) {
      case "lowest":
        items.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case "highest":
        items.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case "popular":
        items.sort((a, b) => b.reviews - a.reviews);
        break;
      case "newest":
        items.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    return items;
  }, [debouncedQuery, filters, sortBy, demoProducts]);

  const visibleItems = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

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
          <div className="flex items-center gap-3">
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
          </div>
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
                Showing {visibleItems.length} of {filtered.length} results {query ? `for "${query}"` : ""}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleItems.map((p) => (
                <SearchResultCard key={p.id} product={p} />)
              )}
            </div>

            {/* Load More */}
            <div className="mt-6 flex justify-center">
              {canLoadMore ? (
                <Button onClick={() => setVisible((v) => v + 8)}>Load More</Button>
              ) : (
                <span className="text-sm text-muted-foreground">No more results</span>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
