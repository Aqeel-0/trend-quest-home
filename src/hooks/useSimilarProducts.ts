import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { extractPrimaryImage } from "./useProductVariantsWithListings";

export interface SimilarProduct {
    id: string;
    name: string;
    product_id: string;
    images: any;
    listings: Array<{
        id: string;
        price: number;
        original_price: number | null;
        discount_percentage: number | null;
        store_name: string;
        rating: number | null;
        review_count: number;
        currency: string;
    }>;
    products: {
        id: string;
        model_name: string;
        brand_id: string;
        category_id: string;
        brands: {
            id: string;
            name: string;
            slug: string;
        };
        category: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

export const useSimilarProducts = (currentVariant: any, limit: number = 12) => {
    return useQuery({
        queryKey: ["similar-products", currentVariant?.id, limit],
        queryFn: async () => {
            if (!currentVariant) return [];
            
            const currentPrice = currentVariant.minPrice || 0;
            const currentBrandId = currentVariant.product?.brand_id;
            const currentCategoryId = currentVariant.product?.category_id;
            
            // Define price range (±30% of current product price)
            const priceRange = currentPrice * 0.3;
            const minPrice = Math.max(0, currentPrice - priceRange);
            const maxPrice = currentPrice + priceRange;
            
            // Build the query dynamically based on available filters
            let query = supabase
                .from("product_variants")
                .select(`
                    id,
                    name,
                    product_id,
                    images,
                    listings (
                        id,
                        price,
                        original_price,
                        discount_percentage,
                        store_name,
                        rating,
                        review_count,
                        currency
                    ),
                    products!inner (
                        id,
                        model_name,
                        brand_id,
                        category_id,
                        brands (
                            id,
                            name,
                            slug
                        ),
                        category:categories (
                            id,
                            name,
                            slug
                        )
                    )
                `)
                .eq("is_active", true)
                .eq("products.is_active", true)
                .gt("listing_count", 1)
                .neq("id", currentVariant.id); // Exclude current variant
            
            // Add category or brand filter only if they exist
            if (currentCategoryId || currentBrandId) {
                const filters = [];
                if (currentCategoryId) filters.push(`products.category_id.eq.${currentCategoryId}`);
                if (currentBrandId) filters.push(`products.brand_id.eq.${currentBrandId}`);
                query = query.or(filters.join(','));
            }
            
            const { data, error } = await query
                .order("created_at", { ascending: false })
                .limit(limit * 2); // Get more to filter by price later
            
            if (error) {
                console.error('Error fetching similar products:', error);
                throw error;
            }
            
            if (!data) return [];
            
            // Filter by price range and process the data
            const processedProducts = data
                .filter((variant: any) => {
                    const listings = variant.listings || [];
                    if (listings.length === 0) return false;
                    
                    // Get minimum price for this variant
                    const minVariantPrice = Math.min(...listings.map((l: any) => l.price));
                    return minVariantPrice >= minPrice && minVariantPrice <= maxPrice;
                })
                .slice(0, limit) // Take only the requested number
                .map((variant: any) => ({
                    ...variant,
                    minPrice: Math.min(...variant.listings.map((l: any) => l.price)),
                    primaryImage: extractPrimaryImage(variant.images)
                }));
            
            return processedProducts;
        },
        enabled: !!currentVariant,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};
