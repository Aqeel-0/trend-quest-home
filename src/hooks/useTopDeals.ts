import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopDeals = () => {
  return useQuery({
    queryKey: ["top-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          price,
          original_price,
          discount_percentage,
          store_name,
          rating,
          review_count,
          currency,
          product_variants!inner (
            id,
            name,
            images,
            products!inner (
              id,
              model_name,
              brands (
                id,
                name,
                logo_url
              )
            )
          )
        `)
        .gt('price', 30000)
        .not('discount_percentage', 'is', null)
        .order('discount_percentage', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching top deals:', error);
        throw error;
      }
      return data;
    },
  });
};

export default useTopDeals;
