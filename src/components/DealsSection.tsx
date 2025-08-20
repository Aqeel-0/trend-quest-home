import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currency";

import headphones from "@/assets/prod-headphones.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import controller from "@/assets/prod-controller.jpg";

const fallbackImages = [headphones, laptop, controller];

interface DealProduct {
  id: string;
  model_name: string;
  min_price: number | null;
  original_price?: number;
  discount_percentage?: number;
  store_name?: string;
}

const useTopDeals = () => {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      // Get products with the highest discount percentages
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          price,
          original_price,
          discount_percentage,
          store_name,
          product_variants!inner (
            products!inner (
              id,
              model_name,
              min_price
            )
          )
        `)
        .not("discount_percentage", "is", null)
        .gte("discount_percentage", 10)
        .eq("is_active", true)
        .order("discount_percentage", { ascending: false })
        .limit(3);

      if (error) throw error;

      return data?.map((listing: any) => ({
        id: listing.product_variants.products.id,
        model_name: listing.product_variants.products.model_name,
        min_price: listing.price,
        original_price: listing.original_price,
        discount_percentage: listing.discount_percentage,
        store_name: listing.store_name,
      })) as DealProduct[];
    },
  });
};

const DealsSection = () => {
  const { data: deals, isLoading } = useTopDeals();

  if (isLoading) {
    return (
      <section aria-labelledby="deals" className="py-12 md:py-16">
        <div className="container">
          <h2 id="deals" className="text-2xl md:text-3xl font-semibold mb-6">Top deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="deals" className="py-12 md:py-16">
      <div className="container">
        <h2 id="deals" className="text-2xl md:text-3xl font-semibold mb-6">Top deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals?.map((deal, index) => (
            <Card key={deal.id} className="overflow-hidden hover-scale shadow-subtle hover:shadow-elevated transition-shadow">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                <img src={fallbackImages[index % fallbackImages.length]} alt={deal.model_name + " deal image"} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-3 top-3">
                  <Badge variant="secondary">Save {Math.round(deal.discount_percentage || 0)}%</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium leading-tight">{deal.model_name}</h3>
                    <p className="text-sm text-muted-foreground">from {deal.store_name}</p>
                  </div>
                  <div className="text-lg font-semibold">
                    {deal.min_price ? formatCurrency(deal.min_price) : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
