import { supabase } from "@/integrations/supabase/client";

// Base select query for product variants with all related data
const BASE_VARIANT_SELECT = `
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

// Category-specific query configurations
const CATEGORY_CONFIGS = {
    tablets: {
        requireMultipleListings: false, // Show all variants
        defaultSort: "newest"
    },
    smartphones: {
        requireMultipleListings: true, // Only show variants with listing_count > 1
        defaultSort: "price_high"
    },
    laptops: {
        requireMultipleListings: true,
        defaultSort: "price_high"
    },
    headphones: {
        requireMultipleListings: true,
        defaultSort: "price_high"
    },
    smartwatches: {
        requireMultipleListings: true,
        defaultSort: "price_high"
    },
    accessories: {
        requireMultipleListings: true,
        defaultSort: "price_high"
    }
};

// Get category configuration
const getCategoryConfig = (categorySlug: string) => {
    return CATEGORY_CONFIGS[categorySlug as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.smartphones;
};

// Query for getting total count by category
export const getCategoryVariantsCount = async (categoryId: string, categorySlug: string) => {
    const config = getCategoryConfig(categorySlug);
    
    let query = supabase
        .from("product_variants")
        .select(`
            *,
            product:products!inner (
                id,
                category_id
            )
        `, { count: "exact", head: true })
        .eq("is_active", true)
        .eq("product.category_id", categoryId);
    
    // Apply listing count filter based on category
    if (config.requireMultipleListings) {
        query = query.gt("listing_count", 1);
    }
    
    const { count, error } = await query;
    
    if (error) {
        console.error('Error fetching total count:', error);
        throw error;
    }
    
    return count || 0;
};

// Query for getting all variants by category (non-paginated)
export const getAllCategoryVariants = async (categoryId: string, categorySlug: string, sort = "newest") => {
    const config = getCategoryConfig(categorySlug);
    
    // Build the base query
    let query = supabase
        .from("product_variants")
        .select(BASE_VARIANT_SELECT)
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .eq("products.is_active", true);
    
    // Apply listing count filter based on category
    if (config.requireMultipleListings) {
        query = query.gt("listing_count", 1);
    }
    
    // Execute the query with sorting
    const { data: variantsData, error: variantsError } = await query
        .order("created_at", { ascending: sort === "oldest" });
    
    if (variantsError) {
        console.error('Error fetching product variants by category:', variantsError);
        throw variantsError;
    }
    
    return variantsData || [];
};

// Query for getting paginated variants by category (for infinite scroll)
export const getPaginatedCategoryVariants = async ({
    categoryId,
    categorySlug,
    pageParam = 0,
    pageSize = 20,
    sort = "newest",
    filters = {}
}: {
    categoryId: string;
    categorySlug: string;
    pageParam?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
}) => {
    const config = getCategoryConfig(categorySlug);
    const offset = pageParam * pageSize;
    
    // Build the query with filters
    let query = supabase
        .from("product_variants")
        .select(BASE_VARIANT_SELECT, { count: 'exact' })
        .eq("products.category_id", categoryId)
        .eq("is_active", true)
        .eq("products.is_active", true);
    
    // Apply listing count filter based on category
    if (config.requireMultipleListings) {
        query = query.gt("listing_count", 1);
    }
    
    // Apply filters (only for columns that exist in product_variants table)
    if (filters.brand) {
        query = query.eq("products.brand_id", filters.brand);
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
    
    // Apply category-specific filtering
    let processedVariants = variantsData;
    
    if (config.requireMultipleListings) {
        // For smartphones and other categories, filter variants with multiple listings
        processedVariants = variantsData.filter((variant: any) => {
            const listings = variant.listings || [];
            return listings.length > 1;
        });
    }
    // For tablets, keep all variants (no additional filtering)
    
    const hasMore = offset + pageSize < (count || 0);
    const nextPage = hasMore ? pageParam + 1 : null;
    
    return {
        variants: processedVariants,
        nextPage,
        totalCount: count || 0
    };
};

// Query for getting related products based on price range
export const getRelatedProducts = async ({
    currentVariantId,
    categoryId,
    categorySlug,
    pageParam = 0,
    pageSize = 20
}: {
    currentVariantId: string;
    categoryId: string;
    categorySlug: string;
    pageParam?: number;
    pageSize?: number;
}) => {
    const config = getCategoryConfig(categorySlug);
    const offset = pageParam * pageSize;
    
    let query = supabase
        .from("product_variants")
        .select(BASE_VARIANT_SELECT, { count: "exact" })
        .eq("is_active", true)
        .eq("products.is_active", true)
        .neq("id", currentVariantId) // Exclude current variant
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);
    
    // Apply listing count filter based on category
    if (config.requireMultipleListings) {
        query = query.gt("listing_count", 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
        throw error;
    }
    
    if (!data) {
        return { products: [], totalCount: 0, hasNextPage: false };
    }
    
    // Apply category-specific filtering
    let processedVariants = data;
    
    if (config.requireMultipleListings) {
        // Filter variants that have multiple listings
        processedVariants = data.filter((variant: any) => {
            const listings = variant.listings || [];
            return listings.length > 1;
        });
    }
    
    const totalCount = count || 0;
    const hasNextPage = offset + pageSize < totalCount;
    
    return {
        products: processedVariants,
        totalCount,
        hasNextPage,
        currentPage: pageParam + 1,
        totalPages: Math.ceil(totalCount / pageSize)
    };
};
