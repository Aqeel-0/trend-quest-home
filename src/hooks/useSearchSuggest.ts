import { useQuery } from "@tanstack/react-query";
import { searchSuggest } from "@/lib/queries/searchQueries";
import { useDebounce } from "@/hooks/useDebounce";

export function useSearchSuggest(query: string) {
  const debounced = useDebounce(query, 250);
  return useQuery({
    queryKey: ["search-suggest", debounced],
    queryFn: () => searchSuggest(debounced, 8),
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    placeholderData: (prev) => prev,
  });
}
