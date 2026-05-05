import { supabase } from "@/integrations/supabase/client";

// Category metadata and utility functions
const getCategoryNameFromSlug = (slug: string): string => {
    const categoryMap: { [key: string]: string } = {
        'smartphones': 'Smartphones',
        'tablets': 'Tablets',
        'basic-phones': 'Basic Phones',
        'feature-phones': 'Feature Phones',
        'laptops': 'Laptops',
        'headphones': 'Headphones',
        'smartwatches': 'Smartwatches',
        'accessories': 'Accessories'
    };
    
    return categoryMap[slug] || 'Smartphones'; // Default to Smartphones
};

// Category level configuration
const getCategoryLevel = (categorySlug: string): number => {
    const categoryLevels: Record<string, number> = {
        'smartphones': 4,
        'tablets': 2,
        'laptops': 4,
        'headphones': 4,
        'smartwatches': 4,
        'accessories': 4
        // Add other categories and their levels as needed
    };
    
    return categoryLevels[categorySlug] || 4; // Default to 4 if not specified
};

// Query to get category data by slug
export const getCategoryBySlug = async (categorySlug: string) => {
    const categoryName = getCategoryNameFromSlug(categorySlug);
    const level = getCategoryLevel(categorySlug);
    
    console.log('Fetching category:', categoryName, 'Level:', level);
    
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, level")
        .eq("slug", categorySlug)
        .eq("level", level)
        .eq("is_active", true)
        .single();
    
    if (error || !data) {
        console.error('Category query error:', error);
        throw new Error(`Category not found: ${categoryName}`);
    }
    
    console.log('Category data found:', data);
    return data;
};

// Query to get all active categories
export const getAllActiveCategories = async () => {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, level, parent_id")
        .eq("is_active", true)
        .order("name", { ascending: true });
    
    if (error) {
        console.error('Error fetching all categories:', error);
        throw error;
    }
    
    return data || [];
};

// Query to get categories by level
export const getCategoriesByLevel = async (level: number) => {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, level, parent_id")
        .eq("level", level)
        .eq("is_active", true)
        .order("name", { ascending: true });
    
    if (error) {
        console.error(`Error fetching level ${level} categories:`, error);
        throw error;
    }
    
    return data || [];
};

// Query to get category hierarchy (parent-child relationships)
export const getCategoryHierarchy = async (parentId?: string) => {
    let query = supabase
        .from("categories")
        .select(`
            id, name, slug, level, parent_id,
            children:categories!parent_id (
                id, name, slug, level
            )
        `)
        .eq("is_active", true);
    
    if (parentId) {
        query = query.eq("parent_id", parentId);
    } else {
        query = query.is("parent_id", null); // Root categories
    }
    
    const { data, error } = await query.order("name", { ascending: true });
    
    if (error) {
        console.error('Error fetching category hierarchy:', error);
        throw error;
    }
    
    return data || [];
};

// Query to get category with product count
export const getCategoryWithProductCount = async (categorySlug: string) => {
    const categoryData = await getCategoryBySlug(categorySlug);
    
    // Get product count for this category
    const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryData.id)
        .eq("is_active", true);
    
    if (error) {
        console.error('Error fetching product count:', error);
        throw error;
    }
    
    return {
        ...categoryData,
        productCount: count || 0
    };
};

// Utility functions
export { getCategoryNameFromSlug, getCategoryLevel };
