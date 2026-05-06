import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchVariant {
  id: string;
  name: string;
  product_id: string;
  images: unknown;
  attributes: unknown;
  created_at: string;
  products: {
    id: string;
    model_name: string;
    slug: string;
    is_featured: boolean;
    category_id: string;
    brands: {
      name: string;
      slug: string;
      logo_url: string | null;
    } | null;
    categories: {
      name: string;
      slug: string;
    } | null;
  };
  listings: {
    id: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    store_name: string;
    rating: number | null;
    review_count: number;
    stock_status: string;
    currency: string;
  }[];
}

export type SortKey = "lowest" | "highest" | "popular" | "newest";

export const SEARCH_PAGE_SIZE = 24;

const VARIANT_SELECT = `
  id,
  name,
  product_id,
  images,
  attributes,
  created_at,
  products!inner (
    id,
    model_name,
    slug,
    is_featured,
    category_id,
    brands (
      name,
      slug,
      logo_url
    ),
    categories (
      name,
      slug
    )
  ),
  listings (
    id,
    price,
    original_price,
    discount_percentage,
    store_name,
    rating,
    review_count,
    stock_status,
    currency
  )
`;

const sanitize = (val: string) => val.replace(/[%_,()]/g, " ").trim();

export const useSearchVariants = (query: string, brand?: string) => {
  return useInfiniteQuery({
    queryKey: ["search-variants", query, brand ?? ""],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * SEARCH_PAGE_SIZE;
      const to = from + SEARCH_PAGE_SIZE - 1;

      let req = supabase
        .from("product_variants")
        .select(VARIANT_SELECT, { count: "exact" })
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 0)
        .order("created_at", { ascending: false });

      const q = sanitize(query);
      if (q.length > 0) {
        req = req.ilike("name", `%${q}%`);
      }

      // Resolve brand name → ID, then filter by brand_id (reliable one-level join)
      const b = sanitize(brand ?? "");
      if (b.length > 0) {
        const { data: brandData } = await supabase
          .from("brands")
          .select("id")
          .eq("name", b)
          .maybeSingle();
        if (brandData?.id) {
          req = req.eq("products.brand_id", brandData.id);
        }
      }

      const { data, error, count } = await req.range(from, to);
      if (error) throw error;

      return {
        variants: (data || []) as unknown as SearchVariant[],
        nextPage: data && data.length === SEARCH_PAGE_SIZE ? pageParam + 1 : null,
        totalCount: count ?? 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
