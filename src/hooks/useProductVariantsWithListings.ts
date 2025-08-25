import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 20;

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
  product: {
    id: string;
    model_name: string;
    brand_id: string;
    category_id: string;
    slug: string;
    specifications: any;
    status: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    level: number;
  };
  listings: ListingData[];
  // Computed fields
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

// Convert category slug to proper category name
const getCategoryNameFromSlug = (slug: string): string => {
  const categoryMap: { [key: string]: string } = {
    'smartphones': 'Smartphones',
    'basic-phones': 'Basic Phones',
    'feature-phones': 'Feature Phones',
    'tablets': 'Tablets',
    'laptops': 'Laptops',
    'headphones': 'Headphones',
    'smartwatches': 'Smartwatches',
    'accessories': 'Accessories'
  };
  
  return categoryMap[slug] || 'Smartphones'; // Default to Smartphones
};

// Hook to get total count for any category
export const useSmartphoneVariantsTotalCount = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["category-variants-total-count", categorySlug],
    queryFn: async () => {
      const categoryName = getCategoryNameFromSlug(categorySlug || 'smartphones');
      console.log(`🔍 Fetching total count for category: ${categoryName}`);
      
      const { data, error } = await supabase.rpc('get_category_variants_count' as any, {
        category_name_param: categoryName
      });
      
      if (error) {
        console.error('Error fetching total count:', error);
        throw error;
      }
      
      console.log(`📊 Total variants with multiple listings for ${categoryName}: ${data}`);
      return data || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch product variants by category with all data
export const useProductVariantsByCategory = (categorySlug: string, sort: string = "newest") => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["product-variants-by-category", categorySlug, sort],
    queryFn: async () => {
      const categoryName = getCategoryNameFromSlug(categorySlug);
      console.log(`🔍 Fetching product variants for category: ${categoryName} (slug: ${categorySlug})`);
      
      const { data, error } = await supabase.rpc('get_category_variants_paginated' as any, {
        category_name_param: categoryName,
        limit_count: 1000, // Increased limit to accommodate all products
        offset_count: 0
      });
      
      if (error) {
        console.error('Error fetching product variants by category:', error);
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      console.log(`📊 Raw data for category ${categoryName}:`, data);
      
      // Process and enhance the data with computed fields
      const processedData: ProductVariantWithListings[] = data.map((variant: any) => {
        const listings = variant.listings || [];
        
        // Sort listings by price for min price calculation
        const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
        const minPrice = sortedByPrice[0]?.price || 0;
        const secondMinPrice = sortedByPrice[1]?.price || null;
        
        // Calculate average rating and total reviews
        const ratingsWithValues = listings.filter((l: any) => l.rating && l.rating > 0);
        const avgRating = ratingsWithValues.length > 0
          ? ratingsWithValues.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / ratingsWithValues.length
          : null;
        const totalReviews = listings.reduce((sum: number, l: any) => sum + (l.review_count || 0), 0);
        
        // Extract primary image
        const primaryImage = extractPrimaryImage(variant.images);
        
        return {
          id: variant.id,
          name: variant.name,
          product_id: variant.product?.id || '',
          sku: variant.sku,
          attributes: variant.attributes,
          images: variant.images,
          created_at: variant.created_at,
          updated_at: variant.updated_at,
          product: variant.product,
          brand: variant.brand,
          category: variant.category,
          listings,
          minPrice,
          secondMinPrice,
          storeCount: listings.length,
          primaryImage,
          avgRating,
          totalReviews,
        };
      });
      
      // Apply frontend sorting if needed
      const sortedData = sortProductVariants(processedData, sort);
      
      console.log(`✅ Processed ${sortedData.length} product variants for category ${categoryName}`);
      return sortedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Return the structure that Category.tsx expects
  return {
    data: data || [],
    allVariants: data || [],
    displayedVariants: data || [],
    displayedCount: data?.length || 0,
    totalCount: data?.length || 0,
    isLoading,
    error,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    resetToFirst20: () => {}
  };
};

// Hook to fetch paginated smartphone variants with all data
export const useSmartphoneVariantsWithListings = ({
  sortBy = "newest",
  enabled = true
}: {
  sortBy?: string;
  enabled?: boolean;
} = {}) => {
  
  const fetchSmartphoneVariants = async ({ pageParam = 0 }) => {
    const offset = pageParam * PAGE_SIZE;
    console.log(`🔍 Fetching smartphone variants page ${pageParam + 1} (offset: ${offset})`);
    
    const { data, error } = await supabase.rpc('get_category_variants_paginated' as any, {
      category_name_param: 'Smartphones',
      limit_count: PAGE_SIZE,
      offset_count: offset
    });
    
    if (error) {
      console.error('Error fetching smartphone variants:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    // Process and enhance the data with computed fields
    const processedData: ProductVariantWithListings[] = data.map((variant: any) => {
      const listings = variant.listings || [];
      
      // Sort listings by price for min price calculation
      const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
      const minPrice = sortedByPrice[0]?.price || 0;
      const secondMinPrice = sortedByPrice[1]?.price || null;
      
      // Calculate average rating and total reviews
      const ratingsWithValues = listings.filter((l: any) => l.rating && l.rating > 0);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / ratingsWithValues.length
        : null;
      const totalReviews = listings.reduce((sum: number, l: any) => sum + (l.review_count || 0), 0);
      
      // Extract primary image
      const primaryImage = extractPrimaryImage(variant.images);
      
      return {
        id: variant.id,
        name: variant.name,
        product_id: variant.product?.id || '',
        sku: variant.sku,
        attributes: variant.attributes,
        images: variant.images,
        created_at: variant.created_at,
        updated_at: variant.updated_at,
        product: variant.product,
        brand: variant.brand,
        category: variant.category,
        listings,
        minPrice,
        secondMinPrice,
        storeCount: listings.length,
        primaryImage,
        avgRating,
        totalReviews,
      };
    });
    
    // Apply frontend sorting if needed
    const sortedData = sortProductVariants(processedData, sortBy);
    
    console.log(`✅ Processed ${sortedData.length} smartphone variants for page ${pageParam + 1}`);
    return sortedData;
  };

  return useInfiniteQuery({
    queryKey: ["smartphone-variants-paginated", sortBy],
    queryFn: fetchSmartphoneVariants,
    getNextPageParam: (lastPage, allPages) => {
      // Continue loading if we got a full page
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
    initialPageParam: 0,
  });
};

// Hook to get product data from a variant ID
export const useProductFromVariant = (variantId: string) => {
  return useQuery({
    queryKey: ["product-from-variant", variantId],
    queryFn: async () => {
      console.log(`🔍 Fetching product data from variant ID: ${variantId}`);
      const { data, error } = await supabase
        .from("product_variants")
        .select(`
          *,
          product:products!inner (
            id, model_name, description, min_price, max_price, rating,
            specifications, brand_id, category_id
          ),
          listings (
            id, price, original_price, discount_percentage,
            stock_status, store_name, title, url, images,
            currency, rating, review_count
          )
        `)
        .eq("id", variantId)
        .single();

      if (error) {
        console.error('Error fetching product from variant:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      console.log(`📊 Product data from variant ${variantId}:`, data);

      // Process listings to add computed fields
      const listings = data.listings || [];
      const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
      const minPrice = sortedByPrice[0]?.price || 0;
      const secondMinPrice = sortedByPrice[1]?.price || null;

      // Calculate average rating and total reviews
      const ratingsWithValues = listings.filter((l: any) => l.rating && l.rating > 0);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / ratingsWithValues.length
        : null;
      const totalReviews = listings.reduce((sum: number, l: any) => sum + (l.review_count || 0), 0);

      // Extract primary image
      const primaryImage = extractPrimaryImage(data.images);

      const processedData = {
        ...data,
        minPrice,
        secondMinPrice,
        storeCount: listings.length,
        primaryImage,
        avgRating,
        totalReviews,
      };

      console.log(`✅ Processed product data from variant ${variantId}:`, processedData);
      return processedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper function to extract primary image
const extractPrimaryImage = (images: any): string | null => {
  if (!images) return null;
  
  if (typeof images === 'string') {
    return images;
  } else if (Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
      return firstImage.url as string;
    }
  } else if (typeof images === 'object' && images !== null) {
    if ('primary' in images) return images.primary as string;
    if ('url' in images) return images.url as string;
  }
  
  return null;
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

// Utility function to format price with currency
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
