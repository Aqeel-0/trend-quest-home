import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  store_name: string;
  rating: number | null;
  review_count: number | null;
  stock_status: string;
  currency: string;
  url: string;
  affiliate_url: string | null;
  seller_name: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Product {
  id: string;
  model_name: string;
  brand_id: string;
  category_id: string;
  slug: string;
  specifications: Record<string, any>;
  status: string;
  brands: Brand;
}

export interface ProductImage {
  url: string;
  type: 'main' | 'other';
  source?: string;
  scraped_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, any>;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  product_id: string;
  products: Product;
  listings: Listing[];
}

const fetchTrendingProducts = async (): Promise<ProductVariant[]> => {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      images,
      products!inner (
        id,
        model_name,
        brand_id,
        category_id,
        category:categories!inner (
          id,
          name,
          slug
        ),
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
    .eq('is_active', true)
    .eq('products.is_active', true)
    .gt('listing_count', 1)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching trending products:', error);
    throw new Error(error.message);
  }

  // Log the raw data for debugging
  console.log('Raw product data from database:', JSON.stringify(data, null, 2));

  // Log image data for each product
  data?.forEach((product: any, index: number) => {
    console.log(`Product ${index + 1} - ${product.products?.model_name || 'Unnamed'}`);
    console.log('Images:', product.images);
    console.log('Listings count:', product.listings?.length || 0);
    console.log('----------------------------------');
  });

  return data as unknown as ProductVariant[];
};

export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['trending-products'],
    queryFn: fetchTrendingProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
