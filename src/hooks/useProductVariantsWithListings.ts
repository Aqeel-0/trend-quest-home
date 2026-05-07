import { useQuery } from "@tanstack/react-query";
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

// Hook for paginated related products based on price range
export const useRelatedProducts = (currentVariant: any, page: number = 1, pageSize: number = 10) => {
    return useQuery({
        queryKey: ["related-products", currentVariant?.id, page, pageSize],
        queryFn: async () => {
            if (!currentVariant) return { products: [], totalCount: 0, hasNextPage: false };
            
            const { getRelatedProducts } = await import("@/lib/queries/relatedProductQueries");
            const result = await getRelatedProducts({
                currentVariantId: currentVariant.id,
                currentPrice: currentVariant.minPrice || 0,
                categoryId: currentVariant.product?.category_id,
                page,
                pageSize
            });
            
            // Process the data with computed fields
            const processedProducts = result.products.map((variant: any) => {
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
            
            
            return {
                products: processedProducts,
                totalCount: result.totalCount,
                hasNextPage: result.hasNextPage,
                currentPage: result.currentPage,
                totalPages: result.totalPages
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
            const { getVariantSelectionData } = await import("@/lib/queries/productVariantQueries");
            const { initialVariant, allVariants } = await getVariantSelectionData(variantId);
            
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
    
    // Handle option selection with intelligent fallback matching
    const handleOptionChange = useCallback((type: keyof SelectionAttributes, value: string) => {
        const newSelection = { ...currentSelection, [type]: value };
        setCurrentSelection(newSelection);
        
        if (!data?.allVariants) return;
        
        // Smart variant matching with fallback priorities
        const findBestMatch = (selection: SelectionAttributes) => {
            const variants = data.allVariants;
            
            // Priority 1: Exact match (color + RAM + storage)
            let match = variants.find(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === selection.color && 
                       attrs.ram === selection.ram && 
                       attrs.storage === selection.storage;
            });
            if (match) return match;
            
            // Priority 2: Color + RAM match (any storage)
            match = variants.find(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === selection.color && 
                       attrs.ram === selection.ram;
            });
            if (match) return match;
            
            // Priority 3: Color + Storage match (any RAM)
            match = variants.find(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === selection.color && 
                       attrs.storage === selection.storage;
            });
            if (match) return match;
            
            // Priority 4: Color match only (any RAM/storage)
            match = variants.find(variant => {
                const attrs = variant.selectionAttributes;
                return attrs.color === selection.color;
            });
            if (match) return match;
            
            // Priority 5: Random selection if no color match
            return variants[0] || null;
        };
        
        const bestMatch = findBestMatch(newSelection);
        
        if (bestMatch) {
            // Update selection to match the found variant
            const matchAttrs = bestMatch.selectionAttributes;
            setCurrentSelection({
                color: matchAttrs.color,
                ram: matchAttrs.ram,
                storage: matchAttrs.storage
            });
            
            // Navigate to the best matching variant
            navigate(`/product/${bestMatch.id}`, { replace: true });
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
