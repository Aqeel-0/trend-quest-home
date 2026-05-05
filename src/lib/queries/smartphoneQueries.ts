import { supabase } from "@/integrations/supabase/client";

// Base select query for smartphone variants with all related data
const BASE_SMARTPHONE_SELECT = `
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

// Smartphone-specific configuration
const SMARTPHONE_CONFIG = {
    requireMultipleListings: true, // Only show variants with listing_count > 1
    defaultSort: "price_high",
    minListingCount: 2, // Minimum number of listings required
    categoryLevel: 4, // Smartphone category level in database
    defaultPageSize: 20
};

// Query for getting smartphone variants count
export const getSmartphoneVariantsCount = async (categoryId: string) => {
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
        .eq("product.category_id", categoryId)
        .gt("listing_count", 1); // Smartphones require multiple listings
    
    if (error) {
        console.error('Error fetching smartphone count:', error);
        throw error;
    }
    
    return count || 0;
};

// Query for getting all smartphone variants (non-paginated)
export const getAllSmartphoneVariants = async (categoryId: string, sort = "price_high") => {
    // Build the base query
    let query = supabase
        .from("product_variants")
        .select(BASE_SMARTPHONE_SELECT)
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1); // Smartphones require multiple listings
    
    // Apply sorting
    const { data: variantsData, error: variantsError } = await query
        .order("created_at", { ascending: sort === "oldest" });
    
    if (variantsError) {
        console.error('Error fetching smartphone variants:', variantsError);
        throw variantsError;
    }
    
    return variantsData || [];
};

// Query for getting paginated smartphone variants (for infinite scroll)
export const getPaginatedSmartphoneVariants = async ({
    categoryId,
    pageParam = 0,
    pageSize = 20,
    sort = "price_high",
    filters = {}
}: {
    categoryId: string;
    pageParam?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
}) => {
    const offset = pageParam * pageSize;
    
    // Build the query with filters
    let query = supabase
        .from("product_variants")
        .select(BASE_SMARTPHONE_SELECT, { count: 'exact' })
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1); // Smartphones require multiple listings
    
    // Apply brand filter
    if (filters.brand) {
        query = query.eq("products.brand_id", filters.brand);
    }
    
    // Apply price range filters (if supported at database level)
    if (filters.minPrice && filters.maxPrice) {
        // Note: These would need to be computed fields or views in the database
        // For now, we'll handle price filtering client-side
    }
    
    // Apply sorting (database level for valid columns only)
    switch (sort) {
        case "newest":
            query = query.order("created_at", { ascending: false });
            break;
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "price_low":
        case "price_high":
        case "rating":
        default:
            // For computed fields, use created_at and sort client-side
            query = query.order("created_at", { ascending: false });
            break;
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
    
    // Filter variants that have multiple listings (additional client-side check)
    const smartphoneVariants = variantsData.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length >= SMARTPHONE_CONFIG.minListingCount;
    });
    
    const hasMore = offset + pageSize < (count || 0);
    const nextPage = hasMore ? pageParam + 1 : null;
    
    return {
        variants: smartphoneVariants,
        nextPage,
        totalCount: count || 0
    };
};

// Query for getting related smartphone products based on price range and specifications
export const getRelatedSmartphones = async ({
    currentVariantId,
    categoryId,
    currentPrice,
    pageParam = 0,
    pageSize = 10
}: {
    currentVariantId: string;
    categoryId: string;
    currentPrice?: number;
    pageParam?: number;
    pageSize?: number;
}) => {
    const offset = pageParam * pageSize;
    
    // Calculate price range for related products (±30% of current price)
    const priceRange = currentPrice ? currentPrice * 0.3 : 0;
    const minPrice = currentPrice ? Math.max(0, currentPrice - priceRange) : 0;
    const maxPrice = currentPrice ? currentPrice + priceRange : 0;
    
    let query = supabase
        .from("product_variants")
        .select(BASE_SMARTPHONE_SELECT, { count: "exact" })
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1) // Smartphones require multiple listings
        .neq("id", currentVariantId) // Exclude current variant
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
        throw error;
    }
    
    if (!data) {
        return { products: [], totalCount: 0, hasNextPage: false };
    }
    
    // Filter variants that have multiple listings and apply price filtering
    const relatedSmartphones = data.filter((variant: any) => {
        const listings = variant.listings || [];
        if (listings.length < SMARTPHONE_CONFIG.minListingCount) {
            return false;
        }
        
        // Apply price filtering if currentPrice is provided
        if (currentPrice && minPrice && maxPrice) {
            const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
            const variantMinPrice = sortedByPrice[0]?.price || 0;
            return variantMinPrice >= minPrice && variantMinPrice <= maxPrice;
        }
        
        return true;
    });
    
    const totalCount = count || 0;
    const hasNextPage = offset + pageSize < totalCount;
    
    return {
        products: relatedSmartphones,
        totalCount,
        hasNextPage,
        currentPage: pageParam + 1,
        totalPages: Math.ceil(totalCount / pageSize)
    };
};

// Query for getting smartphone variants by brand
export const getSmartphonesByBrand = async ({
    categoryId,
    brandId,
    pageParam = 0,
    pageSize = 20,
    sort = "price_high"
}: {
    categoryId: string;
    brandId: string;
    pageParam?: number;
    pageSize?: number;
    sort?: string;
}) => {
    const offset = pageParam * pageSize;
    
    let query = supabase
        .from("product_variants")
        .select(BASE_SMARTPHONE_SELECT, { count: 'exact' })
        .eq("products.category_id", categoryId)
        .eq("products.brand_id", brandId)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1)
        .order("created_at", { ascending: sort === "oldest" })
        .range(offset, offset + pageSize - 1);
    
    const { data: variantsData, error: variantsError, count } = await query;
    
    if (variantsError) {
        throw variantsError;
    }
    
    if (!variantsData) {
        return { variants: [], nextPage: null, totalCount: 0 };
    }
    
    // Filter variants that have multiple listings
    const brandSmartphones = variantsData.filter((variant: any) => {
        const listings = variant.listings || [];
        return listings.length >= SMARTPHONE_CONFIG.minListingCount;
    });
    
    const hasMore = offset + pageSize < (count || 0);
    const nextPage = hasMore ? pageParam + 1 : null;
    
    return {
        variants: brandSmartphones,
        nextPage,
        totalCount: count || 0
    };
};

// Query for getting smartphone price statistics
export const getSmartphonePriceStats = async (categoryId: string) => {
    const { data, error } = await supabase
        .from("product_variants")
        .select(`
            listings (price)
        `)
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .gt("listing_count", 1);
    
    if (error) {
        throw error;
    }
    
    if (!data || data.length === 0) {
        return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
    }
    
    // Extract all prices from all listings
    const allPrices: number[] = [];
    data.forEach((variant: any) => {
        const listings = variant.listings || [];
        listings.forEach((listing: any) => {
            if (listing.price && listing.price > 0) {
                allPrices.push(listing.price);
            }
        });
    });
    
    if (allPrices.length === 0) {
        return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
    }
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    
    return {
        minPrice: Math.round(minPrice),
        maxPrice: Math.round(maxPrice),
        avgPrice: Math.round(avgPrice)
    };
};
