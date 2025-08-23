import { useInfiniteQuery, useQuery, QueryFunctionContext } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ListingData {
  id: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  store_name: string;
  rating: number | null;
  review_count: number;
  stock_status: "in_stock" | "out_of_stock" | "limited_stock" | "unknown";
  currency: string;
  url: string;
  affiliate_url: string | null;
  seller_name: string | null;
  created_at: string;
}

export interface ProductVariantWithListings {
  id: string;
  name: string;
  product_id: string;
  sku: string | null;
  attributes: any;
  images: any;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    model_name: string;
    brand_id: string;
    category_id: string;
    brands: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
    };
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  };
  listings: ListingData[];
  // Computed fields for easy access
  minPrice: number;
  secondMinPrice: number | null;
  storeCount: number;
  primaryImage: string | null;
  avgRating: number | null;
  totalReviews: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
  { value: "reviews", label: "Most Reviews" },
  { value: "stores", label: "Most Stores" },
];

const PAGE_SIZE = 20;

interface UseProductVariantsWithListingsProps {
  sortBy?: string;
  enabled?: boolean;
  categorySlug?: string;
}

export const useProductVariantsWithListings = ({ 
  sortBy = "newest", 
  enabled = true,
  categorySlug 
}: UseProductVariantsWithListingsProps = {}) => {
  
  const fetchProductVariants = async (context: QueryFunctionContext<unknown[], number>) => {
    const { pageParam = 0 } = context;
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    console.log(`🔍 Fetching product variants ${from}-${to}`);

    // Single optimized query with all necessary joins
    let query = supabase
      .from('product_variants')
      .select(`
        id,
        name,
        product_id,
        sku,
        attributes,
        images,
        created_at,
        updated_at,
        products!inner (
          id,
          model_name,
          brand_id,
          category_id,
          brands!inner (
            id,
            name,
            slug,
            logo_url
          ),
          categories!inner (
            id,
            name,
            slug
          )
        ),
        listings!inner (
          id,
          price,
          original_price,
          discount_percentage,
          store_name,
          rating,
          review_count,
          stock_status,
          currency,
          url,
          affiliate_url,
          seller_name,
          created_at
        )
      `)
      .eq('is_active', true)
      .eq('listings.is_active', true)
      .eq('products.is_active', true)
      .eq('products.brands.is_active', true)
      .eq('products.categories.is_active', true);

    // Add category filter if provided
    if (categorySlug) {
      query = query.eq('products.categories.slug', categorySlug);
    }

    const { data: rawData, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }

    if (!rawData) {
      return [];
    }
    // Process and enhance the data with computed fields
    const processedData: ProductVariantWithListings[] = rawData.map((variant) => {
      const listings = variant.listings as ListingData[];
      
      // Sort listings by price for min price calculation
      const sortedByPrice = [...listings].sort((a, b) => a.price - b.price);
      const minPrice = sortedByPrice[0]?.price || 0;
      const secondMinPrice = sortedByPrice[1]?.price || null;
      
      // Calculate average rating and total reviews
      const ratingsWithValues = listings.filter(l => l.rating && l.rating > 0);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, l) => sum + (l.rating || 0), 0) / ratingsWithValues.length
        : null;
      const totalReviews = listings.reduce((sum, l) => sum + l.review_count, 0);
      
      // Extract primary image - handle different image formats
      let primaryImage: string | null = null;
      if (variant.images) {
        if (typeof variant.images === 'string') {
          // If it's a string URL
          primaryImage = variant.images;
        } else if (Array.isArray(variant.images) && variant.images.length > 0) {
          // If it's an array, take the first one
          const firstImage = variant.images[0];
          if (typeof firstImage === 'string') {
            primaryImage = firstImage;
          } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
            primaryImage = firstImage.url as string;
          }
        } else if (typeof variant.images === 'object' && variant.images !== null && 'primary' in variant.images) {
          // If it's an object with a primary key
          primaryImage = variant.images.primary as string;
        } else if (typeof variant.images === 'object' && variant.images !== null && 'url' in variant.images) {
          // If it's an object with url key
          primaryImage = variant.images.url as string;
        }
      }

      return {
        id: variant.id,
        name: variant.name,
        product_id: variant.product_id,
        sku: variant.sku,
        attributes: variant.attributes,
        images: variant.images,
        created_at: variant.created_at,
        updated_at: variant.updated_at,
        products: variant.products, // Include the joined product/brand/category data
        listings,
        minPrice,
        secondMinPrice,
        storeCount: listings.length,
        primaryImage,
        avgRating,
        totalReviews,
      };
    });

    console.log(`✅ Processed ${processedData.length} variants with listings`);
    
    // Debug: Log first few variants to see the data structure
    if (processedData.length > 0) {
      console.log('🔍 Sample variant data:', {
        firstVariant: processedData[0],
        listingsCount: processedData[0]?.listings?.length,
        sampleListings: processedData[0]?.listings?.slice(0, 3)
      });
    }
    
    return processedData;
  };

  return useInfiniteQuery<ProductVariantWithListings[], Error>({
    queryKey: ["product-variants-with-listings", sortBy, categorySlug],
    queryFn: fetchProductVariants,
    getNextPageParam: (lastPage: ProductVariantWithListings[], allPages: ProductVariantWithListings[][]) => {
      // Continue loading if we got a full page
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
    initialPageParam: 0,
  });
};

// Utility function to sort variants in frontend
export const sortProductVariants = (
  variants: ProductVariantWithListings[], 
  sortBy: string
): ProductVariantWithListings[] => {
  const sorted = [...variants];
  
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    case "price_low":
      return sorted.sort((a, b) => a.minPrice - b.minPrice);
    
    case "price_high":
      return sorted.sort((a, b) => b.minPrice - a.minPrice);
    
    case "rating":
      return sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    
    case "reviews":
      return sorted.sort((a, b) => b.totalReviews - a.totalReviews);
    
    case "stores":
      return sorted.sort((a, b) => b.storeCount - a.storeCount);
    
    default:
      return sorted;
  }
};

// Simplified count query without complex joins
export const useProductVariantsTotalCount = (categorySlug: string) => {
  return useQuery({
    queryKey: ["product-variants-total-count", categorySlug],
    queryFn: async () => {
      // Get count by using the same structure as main query but just counting
      const { count, error } = await supabase
        .from('product_variants')
        .select('products!inner(categories!inner(slug))', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('products.categories.slug', categorySlug);

      if (error) {
        console.error('Error fetching total count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!categorySlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook specifically for category page
export const useProductVariantsByCategory = (categorySlug: string, sortBy: string = "newest") => {
  return useProductVariantsWithListings({
    sortBy,
    categorySlug,
    enabled: !!categorySlug,
  });
};

// Hook to get product details from variant ID
export const useProductFromVariant = (variantId: string) => {
  return useQuery({
    queryKey: ["product-from-variant", variantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          name,
          product_id,
          attributes,
          images,
          products!inner (
            id,
            model_name,
            min_price,
            max_price,
            rating,
            description,
            specifications,
            brands (name, slug, logo_url),
            categories (name, slug)
          )
        `)
        .eq('id', variantId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!variantId,
  });
};

// Utility function to get formatted price with currency
export const formatPrice = (price: number, currency: string = "INR"): string => {
  const currencySymbols: { [key: string]: string } = {
    "INR": "₹",
    "USD": "$",
    "EUR": "€",
    "GBP": "£"
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price.toLocaleString()}`;
};
