import { useInfiniteQuery } from "@tanstack/react-query";
import { searchFull, type SearchFullParams } from "@/lib/queries/searchQueries";

export function useSearchFull(params: SearchFullParams) {
  return useInfiniteQuery({
    queryKey: [
      "search-full",
      params.q,
      params.brand ?? null,
      params.minPrice ?? null,
      params.maxPrice ?? null,
      params.minRating ?? null,
      params.inStockOnly ?? false,
      params.sortBy ?? "relevance",
      params.pageSize ?? 24,
    ],
    queryFn: ({ pageParam = 0 }) =>
      searchFull({ ...params, pageOffset: (pageParam as number) * (params.pageSize ?? 24) }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.items).length;
      return fetched < lastPage.totalCount ? allPages.length : null;
    },
    staleTime: 2 * 60_000,
    retry: false,
  });
}
