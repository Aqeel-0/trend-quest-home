import { supabase } from "@/integrations/supabase/client";

// Base select query for single product variant with full data
const BASE_PRODUCT_VARIANT_SELECT = `
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
`;

// Base select query for product variants with minimal data
const BASE_VARIANT_MINIMAL_SELECT = `
    id, name, product_id, sku, attributes, images, created_at, updated_at,
    listings (
        id, price, original_price, discount_percentage,
        stock_status, store_name, title, url, images,
        currency, rating, review_count
    )
`;

// Query to get a single product variant by ID with full product data
export const getProductVariantById = async (variantId: string) => {
    const { data: initialVariant, error: variantError } = await supabase
        .from("product_variants")
        .select(BASE_PRODUCT_VARIANT_SELECT)
        .eq("id", variantId)
        .eq("is_active", true)
        .single();
    
    if (variantError || !initialVariant) {
        console.error('❌ Error fetching variant:', variantError);
        throw new Error(`Variant not found: ${variantId}`);
    }
    
    return initialVariant;
};

// Query to get all variants for a specific product
export const getAllVariantsForProduct = async (productId: string) => {
    const { data: allVariants, error: variantsError } = await supabase
        .from("product_variants")
        .select(BASE_VARIANT_MINIMAL_SELECT)
        .eq("product_id", productId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
    
    if (variantsError || !allVariants) {
        console.error('❌ Error fetching product variants:', variantsError);
        throw new Error('Failed to fetch product variants');
    }
    
    return allVariants;
};

// Query to get variant with product selection data (for variant selection UI)
export const getVariantSelectionData = async (variantId: string) => {
    // Step 1: Get the initial variant and product data
    const initialVariant = await getProductVariantById(variantId);
    
    // Step 2: Fetch all variants for this product
    const allVariants = await getAllVariantsForProduct(initialVariant.product_id);
    
    return {
        initialVariant,
        allVariants,
        productId: initialVariant.product_id
    };
};

// Query to get variants by specific attributes
export const getVariantsByAttributes = async ({
    productId,
    attributes
}: {
    productId: string;
    attributes: Record<string, any>;
}) => {
    let query = supabase
        .from("product_variants")
        .select(BASE_VARIANT_MINIMAL_SELECT)
        .eq("product_id", productId)
        .eq("is_active", true);
    
    // Apply attribute filters
    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            query = query.contains("attributes", { [key]: value });
        }
    });
    
    const { data, error } = await query.order("created_at", { ascending: true });
    
    if (error) {
        console.error('Error fetching variants by attributes:', error);
        throw error;
    }
    
    return data || [];
};

// Query to get variant by exact attribute combination
export const getVariantByExactAttributes = async ({
    productId,
    color,
    ram,
    storage
}: {
    productId: string;
    color?: string;
    ram?: string;
    storage?: string;
}) => {
    const allVariants = await getAllVariantsForProduct(productId);
    
    // Find variant with exact attribute match
    const matchingVariant = allVariants.find((variant: any) => {
        const attrs = variant.attributes || {};
        
        const variantColor = attrs.color || null;
        const variantRam = attrs.ram_gb ? `${attrs.ram_gb}GB` : attrs.ram || null;
        const variantStorage = attrs.storage_gb ? `${attrs.storage_gb}GB` : attrs.storage || null;
        
        return variantColor === color && 
               variantRam === ram && 
               variantStorage === storage;
    });
    
    return matchingVariant || null;
};

// Query to get variants with price range
export const getVariantsInPriceRange = async ({
    categoryId,
    minPrice,
    maxPrice,
    excludeVariantId,
    limit = 10
}: {
    categoryId?: string;
    minPrice: number;
    maxPrice: number;
    excludeVariantId?: string;
    limit?: number;
}) => {
    let query = supabase
        .from("product_variants")
        .select(`
            *,
            products!inner (
                id, model_name, brand_id, category_id, slug,
                specifications, status,
                brands (id, name, slug, logo_url)
            ),
            listings (
                id, price, original_price, discount_percentage,
                store_name, rating, review_count, stock_status,
                currency, url, affiliate_url, seller_name, created_at
            )
        `)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 0);
    
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    if (excludeVariantId) {
        query = query.neq("id", excludeVariantId);
    }
    
    const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit * 2); // Get more than needed for client-side price filtering
    
    if (error) {
        console.error('Error fetching variants in price range:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Client-side price filtering
    const filteredVariants = data.filter((variant: any) => {
        const listings = variant.listings || [];
        if (listings.length === 0) return false;
        
        const sortedByPrice = [...listings].sort((a: any, b: any) => a.price - b.price);
        const minVariantPrice = sortedByPrice[0]?.price || 0;
        
        return minVariantPrice >= minPrice && minVariantPrice <= maxPrice;
    });
    
    return filteredVariants.slice(0, limit);
};

// Query to get popular variants (by listing count and ratings)
export const getPopularVariants = async ({
    categoryId,
    limit = 10
}: {
    categoryId?: string;
    limit?: number;
}) => {
    let query = supabase
        .from("product_variants")
        .select(`
            *,
            products!inner (
                id, model_name, brand_id, category_id, slug,
                specifications, status,
                brands (id, name, slug, logo_url)
            ),
            listings (
                id, price, original_price, discount_percentage,
                store_name, rating, review_count, stock_status,
                currency, url, affiliate_url, seller_name, created_at
            )
        `)
        .eq("is_active", true)
        .eq("products.is_active", true)
        .gt("listing_count", 1);
    
    if (categoryId) {
        query = query.eq("products.category_id", categoryId);
    }
    
    const { data, error } = await query
        .order("listing_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching popular variants:', error);
        throw error;
    }
    
    return data || [];
};
