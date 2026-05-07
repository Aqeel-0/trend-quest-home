import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp, X, Search, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { useSearchSuggest } from "@/hooks/useSearchSuggest";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { getTrending, type SearchSuggestion } from "@/lib/queries/searchQueries";

interface Props {
  onClose: () => void;
}

function SkeletonRows() {
  return (
    <div className="p-2 space-y-1" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <div className="h-10 w-10 shrink-0 rounded-md bg-muted animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchCommand({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSearchSuggest(query);
  const { recent, add, remove, clear } = useRecentSearches();

  const { data: trending } = useQuery({
    queryKey: ["search-trending"],
    queryFn: () => getTrending(5),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const brands = data?.filter((x) => x.entity_type === "brand") ?? [];
  const variants = data?.filter((x) => x.entity_type === "variant") ?? [];
  const hasResults = (data?.length ?? 0) > 0;
  const showSuggestions = query.trim().length >= 2;

  const totalResults = brands.length + variants.length;

  const handleSelect = (item: SearchSuggestion) => {
    // Save the resolved title for brands, the typed query for variants
    add(item.entity_type === "brand" ? item.title : (query.trim() || item.title));
    if (item.entity_type === "brand") {
      navigate(`/search?brand=${encodeURIComponent(item.slug ?? item.title)}`);
    } else {
      navigate(`/product/${item.entity_id}`);
    }
    onClose();
  };

  const handleRecentSelect = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const handleSeeAll = () => {
    if (query.trim()) {
      add(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only fire "see all" when Enter is not already being handled by a highlighted cmdk item
    if (e.key === "Enter" && !e.defaultPrevented && query.trim()) {
      handleSeeAll();
    }
  };

  return (
    <Command
      className="rounded-xl border-0"
      shouldFilter={false}
      loop
    >
      <CommandInput
        placeholder="Search products, brands…"
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleSubmit}
        autoFocus
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
      />

      {/* Accessible live region for result count */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {showSuggestions && !isLoading
          ? hasResults
            ? `${totalResults} result${totalResults !== 1 ? "s" : ""} found`
            : "No results found"
          : ""}
      </div>

      <CommandList className="max-h-[60vh] sm:max-h-[400px]">
        {/* Loading */}
        {showSuggestions && isLoading && <SkeletonRows />}

        {/* Error */}
        {showSuggestions && isError && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Something went wrong. Try again.
          </div>
        )}

        {/* Results */}
        {showSuggestions && !isLoading && !isError && (
          <>
            {brands.length > 0 && (
              <CommandGroup heading="Brands">
                {brands.map((b) => (
                  <CommandItem key={b.entity_id} value={`brand-${b.entity_id}`} onSelect={() => handleSelect(b)}>
                    <SearchResultItem item={b} query={query} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {variants.length > 0 && (
              <CommandGroup heading="Products">
                {variants.slice(0, 5).map((v) => (
                  <CommandItem key={v.entity_id} value={`variant-${v.entity_id}`} onSelect={() => handleSelect(v)}>
                    <SearchResultItem item={v} query={query} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasResults && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="see-all"
                    onSelect={handleSeeAll}
                    className="flex items-center justify-between text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5" />
                      See all results for <strong className="text-foreground">"{query}"</strong>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {!hasResults && (
              <div className="py-8 text-center text-sm text-muted-foreground px-4">
                No results for <strong className="text-foreground">"{query}"</strong>. Try a different keyword.
              </div>
            )}
          </>
        )}

        {/* Idle: recent + trending */}
        {!showSuggestions && (
          <>
            {recent.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between w-full">
                    <span>Recent</span>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                }
              >
                {recent.map((q) => (
                  <CommandItem key={q} value={`recent-${q}`} onSelect={() => handleRecentSelect(q)}>
                    <div className="flex w-full items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm">{q}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); remove(q); }}
                        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${q} from recent searches`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {trending && trending.length > 0 && (
              <>
                {recent.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Trending">
                  {trending.map((t) => (
                    <CommandItem
                      key={t.entity_id}
                      value={`trending-${t.entity_id}`}
                      onSelect={() => {
                        if (t.entity_type === "brand") {
                          navigate(`/search?brand=${encodeURIComponent(t.slug ?? t.title)}`);
                        } else {
                          navigate(`/product/${t.entity_id}`);
                        }
                        onClose();
                      }}
                    >
                      <div className="flex w-full items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-sm">{t.title}</span>
                        {t.min_price != null && (
                          <span className="text-xs text-muted-foreground">
                            from {formatCurrency(t.min_price)}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {recent.length === 0 && (!trending || trending.length === 0) && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Start typing to search products and brands
              </div>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
}
