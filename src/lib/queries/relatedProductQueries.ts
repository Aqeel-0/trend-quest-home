import { supabase } from "@/integrations/supabase/client";

// Base select query for related products
const BASE_RELATED_PRODUCT_SELECT = `
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
`;

// Query for getting related products based on current variant
export const getRelatedProducts = async ({
    currentVariantId,
    currentPrice,
    categoryId,
    page = 1,
    pageSize = 10
}: {
    currentVariantId: string;
    currentPrice?: number;
    categoryId?: string;
    page?: number;
    pageSize?: number;
}) => {
    const offset = (page - 1) * pageSize;
    
    // Calculate price range for related products (±30% of current price)
    let minPrice = 0;
    let maxPrice = 0;
    
    if (currentPrice) {
        const priceRange = currentPrice * 0.3;
        minPrice = Math.max(0, currentPrice - priceRange);
        maxPrice = currentPrice + priceRange;
    }
    
    let query = supabase
        .from("product_variants")
        .select(BASE_RELATED_PRODUCT_SELECT, { count: "exact" })
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1)
        .neq("id", currentVariantId); // Exclude current variant
    
    // Filter by category if provided
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
    
    if (error) {
        console.error('Error fetching related products:', error);
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
    
    // Apply client-side price filtering if currentPrice is provided
    let filteredProducts = variantsWithMultipleListings;
    
    if (currentPrice && minPrice && maxPrice) {
        filteredProducts = variantsWithMultipleListings.filter((variant: any) => {
            const listings = variant.listings || [];
            const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
            const variantMinPrice = sortedByPrice[0]?.price || 0;
            return variantMinPrice >= minPrice && variantMinPrice <= maxPrice;
        });
    }
    
    const totalCount = count || 0;
    const hasNextPage = offset + pageSize < totalCount;
    
    return {
        products: filteredProducts,
        totalCount,
        hasNextPage,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize)
    };
};

// Query for getting related products by brand
export const getRelatedProductsByBrand = async ({
    currentVariantId,
    brandId,
    categoryId,
    limit = 10
}: {
    currentVariantId: string;
    brandId: string;
    categoryId?: string;
    limit?: number;
}) => {
    let query = supabase
        .from("product_variants")
        .select(BASE_RELATED_PRODUCT_SELECT)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .eq("products.brand_id", brandId)
        .gt("listing_count", 1)
        .neq("id", currentVariantId);
    
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching related products by brand:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Filter variants that have multiple listings
    return data.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length > 1;
    });
};

// Query for getting related products by category
export const getRelatedProductsByCategory = async ({
    currentVariantId,
    categoryId,
    excludeBrandId,
    limit = 10
}: {
    currentVariantId: string;
    categoryId: string;
    excludeBrandId?: string;
    limit?: number;
}) => {
    let query = supabase
        .from("product_variants")
        .select(BASE_RELATED_PRODUCT_SELECT)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .eq("products.category_id", categoryId)
        .gt("listing_count", 1)
        .neq("id", currentVariantId);
    
    if (excludeBrandId) {
        query = query.neq("products.brand_id", excludeBrandId);
    }
    
    const { data, error } = await query
        .order("listing_count", { ascending: false }) // Popular products first
        .order("created_at", { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching related products by category:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Filter variants that have multiple listings
    return data.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length > 1;
    });
};

// Query for getting similar products based on specifications
export const getSimilarProductsBySpecs = async ({
    currentVariantId,
    specifications,
    categoryId,
    limit = 10
}: {
    currentVariantId: string;
    specifications: Record<string, any>;
    categoryId?: string;
    limit?: number;
}) => {
    let query = supabase
        .from("product_variants")
        .select(BASE_RELATED_PRODUCT_SELECT)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1)
        .neq("id", currentVariantId);
    
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    // Apply specification filters
    Object.entries(specifications).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            query = query.contains("products.specifications", { [key]: value });
        }
    });
    
    const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching similar products by specs:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Filter variants that have multiple listings
    return data.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length > 1;
    });
};

// Query for getting trending/popular related products
export const getTrendingRelatedProducts = async ({
    currentVariantId,
    categoryId,
    timeframe = '30 days',
    limit = 10
}: {
    currentVariantId: string;
    categoryId?: string;
    timeframe?: string;
    limit?: number;
}) => {
    // Calculate date filter based on timeframe
    const daysAgo = timeframe === '7 days' ? 7 : timeframe === '30 days' ? 30 : 90;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);
    
    let query = supabase
        .from("product_variants")
        .select(BASE_RELATED_PRODUCT_SELECT)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 2) // More popular products
        .neq("id", currentVariantId)
        .gte("created_at", dateFilter.toISOString());
    
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    const { data, error } = await query
        .order("listing_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching trending related products:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Filter variants that have multiple listings
    return data.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length > 1;
    });
};
