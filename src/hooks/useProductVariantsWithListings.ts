import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useCallback, useState } from "react";

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

// New interfaces for variant selection
export interface SelectionAttributes {
    color: string | null;
    ram: string | null;
    storage: string | null;
}

export interface ProcessedVariant {
    id: string;
    name: string;
    product_id: string;
    sku: string | null;
    attributes: any;
    images: any;
    created_at: string;
    updated_at: string;
    listings: ListingData[];
    minPrice: number;
    secondMinPrice: number | null;
    storeCount: number;
    avgRating: number | null;
    totalReviews: number;
    selectionAttributes: SelectionAttributes;
}

export interface AvailabilityMatrix {
    colors: string[];
    ram: string[];
    storage: string[];
    isCombinationAvailable: (color: string, ram: string, storage: string) => boolean;
    getVariantsForCombination: (color: string, ram: string, storage: string) => ProcessedVariant[];
}

export interface ProductVariantSelectionData {
    product: {
        id: string;
        model_name: string;
        description: string | null;
        specifications: any;
        brand_id: string;
        category_id: string;
    };
    currentVariant: ProcessedVariant;
    allVariants: ProcessedVariant[];
    availabilityMatrix: AvailabilityMatrix;
    selectionOptions: {
        colors: string[];
        ram: string[];
        storage: string[];
    };
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

// Shared hook to get category data (fetched only once)
export const useCategoryData = (categorySlug: string) => {
    return useQuery({
        queryKey: ["category-data", categorySlug],
        queryFn: async () => {
            const categoryName = getCategoryNameFromSlug(categorySlug);
            
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, slug, level")
                .ilike("name", categoryName)
                .eq("level", 4)
                .eq("is_active", true)
                .single();
            
            if (error || !data) {
                throw new Error(`Category not found: ${categoryName}`);
            }
            
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 20 * 60 * 1000,    // 20 minutes
    });
};

// Hook to get total count for any category
export const useSmartphoneVariantsTotalCount = (categorySlug?: string) => {
    const { data: categoryData, error: categoryError } = useCategoryData(categorySlug || 'smartphones');
    
    return useQuery({
        queryKey: ["category-variants-total-count", categorySlug],
        queryFn: async () => {
            if (!categoryData) return 0;
            
            // Get count of variants with more than 1 listing using proper join
            const { count, error } = await supabase
                .from("product_variants")
                .select(`
                    *,
                    product:products!inner (
                        id,
                        category_id
                    )
                `, { count: "exact", head: true })
                .eq("is_active", true)
                .gt("listing_count", 1)
                .eq("product.category_id", categoryData.id);
            
            if (error) {
                console.error('Error fetching total count:', error);
                throw error;
            }
            
            return count || 0;
        },
        enabled: !!categoryData, // Only run when category data is available
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch product variants by category with all data
export const useProductVariantsByCategory = (categorySlug: string, sort: string = "newest") => {
    const { data: categoryData, error: categoryError } = useCategoryData(categorySlug);
    
    const { data, isLoading, error } = useQuery({
        queryKey: ["product-variants-by-category", categorySlug, sort],
        queryFn: async () => {
            if (!categoryData) return [];
            
            // Get all product variants with complete data
            const { data: variantsData, error: variantsError } = await supabase
                .from("product_variants")
                .select(`
                    *,
                    products!inner (
                        id,
                        model_name,
                        brand_id,
                        category_id,
                        slug,
                        specifications,
                        status,
                        brands (
                            id,
                            name,
                            slug,
                            logo_url
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
                        currency,
                        url,
                        affiliate_url,
                        seller_name,
                        created_at
                    )
                `)
                .eq("products.category_id", categoryData.id)
                .eq("is_active", true)
                .eq("products.is_active", true)
                .gt("listing_count", 1)
                .order("created_at", { ascending: true });
            
            if (variantsError) {
                console.error('Error fetching product variants by category:', variantsError);
                throw variantsError;
            }
            
            if (!variantsData) {
                return [];
            }
            
            // Filter variants that have multiple listings (more than 1)
            const variantsWithMultipleListings = variantsData.filter((variant: any) => {
                const listings = variant.listings || [];
                return listings.length > 1;
            });
            
            // Process and enhance the data with computed fields
            const processedData: ProductVariantWithListings[] = variantsWithMultipleListings.map((variant: any) => {
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
                
                // Extract brand from nested objects
                const brand = variant.products?.brands || null;
                
                return {
                    id: variant.id,
                    name: variant.name,
                    product_id: variant.products?.id || '',
                    sku: variant.sku,
                    attributes: variant.attributes,
                    images: variant.images,
                    created_at: variant.created_at,
                    updated_at: variant.updated_at,
                    product: variant.products,
                    brand,
                    category: null, // Category info is available from product.category_id
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
            
            return sortedData;
        },
        enabled: !!categoryData, // Only run when category data is available
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

// Optimized infinite scroll hook for category page
export const useInfiniteCategoryVariants = (categorySlug: string, sort: string = "newest", filters: any = {}) => {
    const { data: categoryData } = useCategoryData(categorySlug);
    
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: ["infinite-category-variants", categorySlug, sort, filters],
        initialPageParam: 0,
        queryFn: async ({ pageParam }: { pageParam: number }) => {
            if (!categoryData) return { variants: [], nextPage: null, totalCount: 0 };
            
            const pageSize = 20;
            const offset = pageParam * pageSize;
            
            // Build the query with filters
            let query = supabase
                .from("product_variants")
                .select(`
                    *,
                    products!inner (
                        id,
                        model_name,
                        brand_id,
                        category_id,
                        slug,
                        specifications,
                        status,
                        brands (
                            id,
                            name,
                            slug,
                            logo_url
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
                        currency,
                        url,
                        affiliate_url,
                        seller_name,
                        created_at
                    )
                `)
                .eq("products.category_id", categoryData.id)
                .eq("is_active", true)
                .eq("products.is_active", true)
                .gt("listing_count", 1);
            
            // Apply filters (only for columns that exist in product_variants table)
            if (filters.brand) {
                query = query.eq("products.brand_id", filters.brand);
            }
            
            // Note: min_price, max_price, rating filters will be applied client-side
            // since these are computed fields, not actual database columns
            
            // Apply sorting
            switch (sort) {
                case "newest":
                    query = query.order("created_at", { ascending: false });
                    break;
                case "oldest":
                    query = query.order("created_at", { ascending: true });
                    break;
                case "price_low":
                    query = query.order("min_price", { ascending: true });
                    break;
                case "price_high":
                    query = query.order("min_price", { ascending: false });
                    break;
                case "rating":
                    query = query.order("rating", { ascending: false });
                    break;
                default:
                    query = query.order("created_at", { ascending: false });
            }
            
            // Add pagination
            query = query.range(offset, offset + pageSize - 1);
            
            const { data: variantsData, error: variantsError, count } = await query;
            
            if (variantsError) {
                throw variantsError;
            }
            
            if (!variantsData) {
                return { variants: [], nextPage: null, totalCount: 0 };
            }
            
            // Filter variants that have multiple listings (more than 1)
            const variantsWithMultipleListings = variantsData.filter((variant: any) => {
                const listings = variant.listings || [];
                return listings.length > 1;
            });
            
            // Process and enhance the data with computed fields
            const processedData: ProductVariantWithListings[] = variantsWithMultipleListings.map((variant: any) => {
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
                
                // Extract brand from nested objects
                const brand = variant.products?.brands || null;
                
                return {
                    id: variant.id,
                    name: variant.name,
                    product_id: variant.products?.id || '',
                    sku: variant.sku,
                    attributes: variant.attributes,
                    images: variant.images,
                    created_at: variant.created_at,
                    updated_at: variant.updated_at,
                    product: variant.products,
                    brand,
                    category: null,
                    listings,
                    minPrice,
                    secondMinPrice,
                    storeCount: listings.length,
                    primaryImage,
                    avgRating,
                    totalReviews,
                };
            });
            
            // Apply client-side filters for computed fields (price and rating)
            const filteredData = processedData.filter((variant: any) => {
                // Apply price filters
                if (filters.minPrice && variant.minPrice < filters.minPrice) {
                    return false;
                }
                if (filters.maxPrice && variant.minPrice > filters.maxPrice) {
                    return false;
                }
                
                // Apply rating filter
                if (filters.rating && (!variant.avgRating || variant.avgRating < filters.rating)) {
                    return false;
                }
                
                return true;
            });
            
            // Adjust pagination logic based on filtered results
            // If we have fewer filtered results than the page size, we might need more data
            const originalHasMore = offset + pageSize < (count || 0);
            const needMoreData = filteredData.length < pageSize && originalHasMore;
            const hasMore = needMoreData || (filteredData.length === pageSize && originalHasMore);
            const nextPage = hasMore ? pageParam + 1 : null;
            
            return {
                variants: filteredData,
                nextPage,
                totalCount: count || 0
            };
        },
        getNextPageParam: (lastPage: any) => lastPage.nextPage,
        enabled: !!categoryData,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    
    // Flatten all pages into a single array
    const allVariants = useMemo(() => {
        return data?.pages?.flatMap((page: any) => page.variants) || [];
    }, [data]);
    
    const totalCount = (data?.pages?.[0] as any)?.totalCount || 0;
    
    return {
        data: allVariants,
        allVariants,
        displayedVariants: allVariants,
        displayedCount: allVariants.length,
        totalCount,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    };
};

// Hook for paginated related products based on price range
export const useRelatedProducts = (currentVariant: any, page: number = 1, pageSize: number = 10) => {
    return useQuery({
        queryKey: ["related-products", currentVariant?.id, page, pageSize],
        queryFn: async () => {
            if (!currentVariant) return { products: [], totalCount: 0, hasNextPage: false };
            
            const currentPrice = currentVariant.minPrice || 0;
            const priceRange = currentPrice * 0.3; // 30% price range
            const minPrice = Math.max(0, currentPrice - priceRange);
            const maxPrice = currentPrice + priceRange;
            
            const offset = (page - 1) * pageSize;
            
            const { data, error, count } = await supabase
                .from("product_variants")
                .select(`
                    *,
                    products!inner (
                        id,
                        model_name,
                        brand_id,
                        category_id,
                        slug,
                        specifications,
                        status,
                        brands (
                            id,
                            name,
                            slug,
                            logo_url
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
                        currency,
                        url,
                        affiliate_url,
                        seller_name,
                        created_at
                    )
                `, { count: "exact" })
                .eq("is_active", true)
                .eq("products.is_active", true)
                .gt("listing_count", 1)
                .neq("id", currentVariant.id) // Exclude current variant
                // Note: Price filtering will be done client-side since min_price/max_price 
                // are computed fields, not actual database columns
                .order("created_at", { ascending: false })
                .range(offset, offset + pageSize - 1);
            
            if (error) {
                throw error;
            }
            
            if (!data) {
                return { products: [], totalCount: 0, hasNextPage: false };
            }
            
            // Filter variants that have multiple listings
            const variantsWithMultipleListings = data.filter((variant: any) => {
                const listings = variant.listings || [];
                return listings.length > 1;
            });
            
            // Process the data and apply price filtering
            const processedProducts = variantsWithMultipleListings.map((variant: any) => {
                const listings = variant.listings || [];
                const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
                const minPrice = sortedByPrice[0]?.price || 0;
                const secondMinPrice = sortedByPrice[1]?.price || null;
                
                const ratingsWithValues = listings.filter((l: any) => l.rating && l.rating > 0);
                const avgRating = ratingsWithValues.length > 0
                    ? ratingsWithValues.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / ratingsWithValues.length
                    : null;
                const totalReviews = listings.reduce((sum: number, l: any) => sum + (l.review_count || 0), 0);
                
                const primaryImage = extractPrimaryImage(variant.images);
                const brand = variant.products?.brands || null;
                
                return {
                    id: variant.id,
                    name: variant.name,
                    product_id: variant.products?.id || '',
                    sku: variant.sku,
                    attributes: variant.attributes,
                    images: variant.images,
                    created_at: variant.created_at,
                    updated_at: variant.updated_at,
                    product: variant.products,
                    brand,
                    category: null,
                    listings,
                    minPrice,
                    secondMinPrice,
                    storeCount: listings.length,
                    primaryImage,
                    avgRating,
                    totalReviews,
                };
            });
            
            // Apply client-side price filtering
            const filteredProducts = processedProducts.filter((variant: any) => {
                return variant.minPrice >= minPrice && variant.minPrice <= maxPrice;
            });
            
            const totalCount = count || 0;
            const hasNextPage = offset + pageSize < totalCount;
            
            return {
                products: filteredProducts,
                totalCount,
                hasNextPage,
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize)
            };
        },
        enabled: !!currentVariant,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Helper function to extract primary image (for category pages - shows only main image)
export const extractPrimaryImage = (images: any): string | null => {
    if (!images) return null;
    
    // Handle new image structure: array of objects with url, type, source, scraped_at
    if (Array.isArray(images) && images.length > 0) {
        // First try to find the main image
        const mainImage = images.find(img => img && img.type === 'main');
        if (mainImage && mainImage.url) {
            return mainImage.url;
        }
        
        // Fallback to first image if no main image found
        const firstImage = images[0];
        if (firstImage && firstImage.url) {
            return firstImage.url;
        }
    } else if (typeof images === 'string') {
        // Handle legacy string format
        return images;
    } else if (typeof images === 'object' && images !== null) {
        // Handle legacy object format
        if ('primary' in images) return images.primary as string;
        if ('url' in images) return images.url as string;
    }
    
    return null;
};

// Helper function to extract all images (for product pages - shows all images)
export const extractAllImages = (images: any): string[] => {
    if (!images) return [];
    
    // Handle new image structure: array of objects with url, type, source, scraped_at
    if (Array.isArray(images) && images.length > 0) {
        return images
            .filter(img => img && img.url) // Filter out invalid images
            .map(img => img.url) // Extract URLs
            .filter(Boolean); // Remove any undefined/null URLs
    } else if (typeof images === 'string') {
        // Handle legacy string format
        return [images];
    } else if (typeof images === 'object' && images !== null) {
        // Handle legacy object format
        if ('primary' in images) return [images.primary as string];
        if ('url' in images) return [images.url as string];
    }
    
    return [];
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
            return sorted.sort((b, a) => a.minPrice - b.minPrice);
        
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

// New optimized hook specifically for variant selection
export const useProductVariantSelection = (variantId: string) => {
    return useQuery<ProductVariantSelectionData>({
        queryKey: ["product-variant-selection", variantId],
        queryFn: async (): Promise<ProductVariantSelectionData> => {
            // Step 1: Get the initial variant and product data
            const { data: initialVariant, error: variantError } = await supabase
                .from("product_variants")
                .select(`
                    id, name, product_id, sku, attributes, images, created_at, updated_at,
                    product:products!inner (
                        id, model_name, description,
                        specifications, brand_id, category_id
                    ),
                    listings (
                        id, price, original_price, discount_percentage,
                        stock_status, store_name, title, url, images,
                        currency, rating, review_count
                    )
                `)
                .eq("id", variantId)
                .eq("is_active", true)
                .single();
            
            if (variantError || !initialVariant) {
                console.error('❌ Error fetching initial variant:', variantError);
                throw new Error(`Variant not found: ${variantId}`);
            }
            
            // Step 2: Fetch all variants for this product with complete data
            const { data: allVariants, error: variantsError } = await supabase
                .from("product_variants")
                .select(`
                    id, name, product_id, sku, attributes, images, created_at, updated_at,
                    listings (
                        id, price, original_price, discount_percentage,
                        stock_status, store_name, title, url, images,
                        currency, rating, review_count
                    )
                `)
                .eq("product_id", initialVariant.product_id)
                .eq("is_active", true)
                .order("created_at", { ascending: true });
            
            if (variantsError || !allVariants) {
                console.error('❌ Error fetching all variants:', variantsError);
                throw new Error('Failed to fetch product variants');
            }
            
            // Step 3: Process variants and create availability matrix
            const processedVariants: ProcessedVariant[] = allVariants.map((variant: any) => {
                const listings = variant.listings || [];
                const attrs = variant.attributes || {};
                
                // Calculate pricing
                let minPrice = 0;
                let secondMinPrice = null;
                if (listings.length > 0) {
                    if (listings.length === 1) {
                        minPrice = listings[0].price;
                    } else if (listings.length === 2) {
                        minPrice = Math.min(listings[0].price, listings[1].price);
                        secondMinPrice = Math.max(listings[0].price, listings[1].price);
                    } else {
                        const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
                        minPrice = sortedByPrice[0]?.price || 0;
                        secondMinPrice = sortedByPrice[1]?.price || null;
                    }
                }
                
                // Calculate ratings
                let totalRating = 0;
                let ratingCount = 0;
                let totalReviews = 0;
                
                for (const listing of listings) {
                    if (listing.rating && listing.rating > 0) {
                        totalRating += listing.rating;
                        ratingCount++;
                    }
                    totalReviews += listing.review_count || 0;
                }
                
                const avgRating = ratingCount > 0 ? totalRating / ratingCount : null;
                
                return {
                    ...variant,
                    minPrice,
                    secondMinPrice,
                    storeCount: listings.length,
                    avgRating,
                    totalReviews,
                    // Extract selection attributes
                    selectionAttributes: {
                        color: attrs.color || null,
                        ram: attrs.ram_gb ? `${attrs.ram_gb}GB` : attrs.ram || null,
                        storage: attrs.storage_gb ? `${attrs.storage_gb}GB` : attrs.storage || null
                    }
                };
            });
            
            // Step 4: Create availability matrix
            const availabilityMatrix = createAvailabilityMatrix(processedVariants);
            
            // Step 5: Find current variant in processed data
            const currentVariant = processedVariants.find(v => v.id === variantId);
            
            if (!currentVariant) {
                throw new Error('Current variant not found in processed data');
            }
            
            return {
                product: initialVariant.product,
                currentVariant,
                allVariants: processedVariants,
                availabilityMatrix,
                selectionOptions: {
                    colors: availabilityMatrix.colors,
                    ram: availabilityMatrix.ram,
                    storage: availabilityMatrix.storage
                }
            };
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes
        enabled: !!variantId,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Helper function to create availability matrix for variant combinations
const createAvailabilityMatrix = (variants: ProcessedVariant[]): AvailabilityMatrix => {
    const colors = new Set<string>();
    const ram = new Set<string>();
    const storage = new Set<string>();
    
    // Extract all available options
    variants.forEach(variant => {
        const attrs = variant.selectionAttributes;
        if (attrs.color) colors.add(attrs.color);
        if (attrs.ram) ram.add(attrs.ram);
        if (attrs.storage) storage.add(attrs.storage);
    });
    
    // Sort options logically
    const sortedColors = Array.from(colors).sort();
    const sortedRam = Array.from(ram).sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, ''));
        const bNum = parseInt(b.replace(/\D/g, ''));
        return aNum - bNum;
    });
    const sortedStorage = Array.from(storage).sort((a, b) => {
        const aNum = parseInt(a.replace(/\D/g, ''));
        const bNum = parseInt(b.replace(/\D/g, ''));
        return aNum - bNum;
    });
    
    return {
        colors: sortedColors,
        ram: sortedRam,
        storage: sortedStorage,
        // Helper function to check if a combination is available
        isCombinationAvailable: (color: string, ram: string, storage: string): boolean => {
            return variants.some(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === color && attrs.ram === ram && attrs.storage === storage;
            });
        },
        // Get available variants for a specific combination
        getVariantsForCombination: (color: string, ram: string, storage: string): ProcessedVariant[] => {
            return variants.filter(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === color && attrs.ram === ram && attrs.storage === storage;
            });
        }
    };
};

// Custom hook for variant selection logic
export const useVariantSelectionLogic = (variantId: string) => {
    const { data, isLoading, error } = useProductVariantSelection(variantId);
    const navigate = useNavigate();
    
    // State for current selection
    const [currentSelection, setCurrentSelection] = useState<SelectionAttributes>({
        color: null,
        ram: null,
        storage: null
    });
    
    // Initialize selection from current variant
    useEffect(() => {
        if (data?.currentVariant) {
            const attrs = data.currentVariant.selectionAttributes;
            setCurrentSelection({
                color: attrs.color,
                ram: attrs.ram,
                storage: attrs.storage
            });
        }
    }, [data?.currentVariant]);
    
    // Get available options based on current selection
    const availableOptions = useMemo(() => {
        if (!data?.availabilityMatrix) return { colors: [], ram: [], storage: [] };
        
        const { availabilityMatrix } = data;
        const { color, ram, storage } = currentSelection;
        
        // Get all available colors
        const availableColors = availabilityMatrix.colors;
        
        // Get available RAM options for current color
        const availableRam = availabilityMatrix.ram.filter(ramOption => {
            if (!color) return true;
            return availabilityMatrix.isCombinationAvailable(color, ramOption, storage || '');
        });
        
        // Get available storage options for current color and RAM
        const availableStorage = availabilityMatrix.storage.filter(storageOption => {
            if (!color || !ram) return true;
            return availabilityMatrix.isCombinationAvailable(color, ram, storageOption);
        });
        
        return {
            colors: availableColors,
            ram: availableRam,
            storage: availableStorage
        };
    }, [data?.availabilityMatrix, currentSelection]);
    
    // Check if a specific option is available
    const isOptionAvailable = useCallback((type: keyof SelectionAttributes, value: string): boolean => {
        if (!data?.availabilityMatrix) return false;
        
        const { availabilityMatrix } = data;
        const { color, ram, storage } = currentSelection;
        
        switch (type) {
            case 'color':
                return availabilityMatrix.colors.includes(value);
            case 'ram':
                if (!color) return availabilityMatrix.ram.includes(value);
                return availabilityMatrix.isCombinationAvailable(color, value, storage || '');
            case 'storage':
                if (!color || !ram) return availabilityMatrix.storage.includes(value);
                return availabilityMatrix.isCombinationAvailable(color, ram, value);
            default:
                return false;
        }
    }, [data?.availabilityMatrix, currentSelection]);
    
    // Handle option selection
    const handleOptionChange = useCallback((type: keyof SelectionAttributes, value: string) => {
        const newSelection = { ...currentSelection, [type]: value };
        setCurrentSelection(newSelection);
        
        // Find matching variant
        const matchingVariant = data?.allVariants.find(variant => {
            const attrs = variant.selectionAttributes;
            return attrs.color === newSelection.color && 
                   attrs.ram === newSelection.ram && 
                   attrs.storage === newSelection.storage;
        });
        
        if (matchingVariant) {
            // Update URL with new variant ID
            navigate(`/product/${matchingVariant.id}`, { replace: true });
        }
    }, [currentSelection, data?.allVariants, navigate]);
    
    // Get current variant based on selection
    const selectedVariant = useMemo(() => {
        if (!data?.allVariants) return null;
        
        return data.allVariants.find(variant => {
            const attrs = variant.selectionAttributes;
            return attrs.color === currentSelection.color && 
                   attrs.ram === currentSelection.ram && 
                   attrs.storage === currentSelection.storage;
        }) || data.currentVariant;
    }, [data?.allVariants, data?.currentVariant, currentSelection]);
    
    return {
        data,
        isLoading,
        error,
        currentSelection,
        availableOptions,
        selectedVariant,
        isOptionAvailable,
        handleOptionChange
    };
};
