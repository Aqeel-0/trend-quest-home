import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomePageVariant {
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
    launch_date: string | null;
    is_featured: boolean;
    category_id: string;
    brands: {
      name: string;
      slug: string;
      logo_url: string | null;
    };
    categories: {
      name: string;
      slug: string;
    };
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

export const useHomePageProducts = () => {
  return useQuery({
    queryKey: ["home-page-variants"],
    queryFn: async (): Promise<HomePageVariant[]> => {
      const { data, error } = await supabase
        .from("product_variants")
        .select(`
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
            launch_date,
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
        `)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 0)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as unknown as HomePageVariant[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
