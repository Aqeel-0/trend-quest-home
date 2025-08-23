import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductWithBrand {
  id: string;
  slug: string;
  model_name: string;
  model_number: string | null;
  description: string | null;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  rating: number | null;
  is_featured: boolean;
  launch_date: string | null;
  variant_count: number;
  status: "active" | "discontinued" | "coming_soon";
  specifications: any;
  category_id: string | null;
  brand_id: string;
  brands: {
    name: string;
    slug: string;
    logo_url: string | null;
  };
  categories: {
    name: string;
    slug: string;
  } | null;
}

export interface ProductVariantWithListings {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  attributes: any;
  images: any;
  is_active: boolean;
  listings: {
    id: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    stock_status: string;
    stock_quantity: number | null;
    seller_name: string | null;
    rating: number | null;
    review_count: number;
    store_name: string;
    title: string;
    url: string;
    affiliate_url: string | null;
    images: any;
    is_active: boolean;
    currency: string;
  }[];
}

export const useProducts = (limit?: number) => {
  return useQuery({
    queryKey: ["products", limit],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          brands (name, slug, logo_url),
          categories (name, slug)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ProductWithBrand[];
    },
  });
};

export const useFeaturedProducts = (limit = 6) => {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands (name, slug, logo_url),
          categories (name, slug)
        `)
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ProductWithBrand[];
    },
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands (name, slug, logo_url),
          categories!inner (name, slug)
        `)
        .eq("status", "active")
        .eq("categories.slug", categorySlug)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ProductWithBrand[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands (name, slug, logo_url),
          categories (name, slug)
        `)
        .eq("id", id)
        .eq("status", "active")
        .single();
      
      if (error) throw error;
      return data as ProductWithBrand;
    },
  });
};

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select(`
          *,
          listings (
            id, price, original_price, discount_percentage,
            stock_status, stock_quantity, seller_name,
            rating, review_count, store_name, title, url,
            affiliate_url, images, is_active, currency
          )
        `)
        .eq("product_id", productId)
        .eq("is_active", true)
        .eq("listings.is_active", true);
      
      if (error) throw error;
      return data as ProductVariantWithListings[];
    },
  });
};

export const useSearchProducts = (query?: string) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      let supabaseQuery = supabase
        .from("products")
        .select(`
          *,
          brands (name, slug, logo_url),
          categories (name, slug)
        `)
        .eq("status", "active");

      if (query && query.length > 0) {
        supabaseQuery = supabaseQuery.or(`model_name.ilike.%${query}%,model_number.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ProductWithBrand[];
    },
    enabled: true,
  });
};