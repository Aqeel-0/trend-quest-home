import { supabase } from "@/integrations/supabase/client";

export interface SearchSuggestion {
  entity_type: "variant" | "brand";
  entity_id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  slug: string | null;
  min_price: number | null;
  rank: number;
}

export async function searchSuggest(q: string, limit = 8): Promise<SearchSuggestion[]> {
  if (!q.trim()) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("search_suggest", {
    q: q.trim(),
    result_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as SearchSuggestion[];
}

export interface SearchFullItem {
  entity_id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  slug: string | null;
  min_price: number | null;
  max_price: number | null;
  avg_rating: number | null;
  has_in_stock: boolean;
  popularity: number;
  rank: number;
  total_count: number;
}

export interface SearchFullParams {
  q: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "popular" | "newest";
  pageSize?: number;
  pageOffset?: number;
}

export async function searchFull(params: SearchFullParams): Promise<{ items: SearchFullItem[]; totalCount: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("search_full", {
    q: params.q,
    brand_filter: params.brand ?? null,
    min_price_filter: params.minPrice ?? null,
    max_price_filter: params.maxPrice ?? null,
    min_rating_filter: params.minRating ?? null,
    in_stock_only: params.inStockOnly ?? false,
    sort_by: params.sortBy ?? "relevance",
    page_size: params.pageSize ?? 24,
    page_offset: params.pageOffset ?? 0,
  });
  if (error) throw error;
  const rows = (data ?? []) as SearchFullItem[];
  return {
    items: rows,
    totalCount: rows[0]?.total_count ?? 0,
  };
}

export interface TrendingSuggestion {
  entity_type: "variant" | "brand";
  entity_id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  slug: string | null;
  min_price: number | null;
  popularity: number;
}

export async function getTrending(limit = 5): Promise<TrendingSuggestion[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("search_full", {
    q: "",
    brand_filter: null,
    min_price_filter: null,
    max_price_filter: null,
    min_rating_filter: null,
    in_stock_only: false,
    sort_by: "popular",
    page_size: limit,
    page_offset: 0,
  });
  if (error) throw error;
  return ((data ?? []) as SearchFullItem[]).map((r) => ({
    entity_type: "variant" as const,
    entity_id: r.entity_id,
    title: r.title,
    subtitle: r.subtitle,
    image_url: r.image_url,
    slug: r.slug,
    min_price: r.min_price,
    popularity: r.popularity,
  }));
}
