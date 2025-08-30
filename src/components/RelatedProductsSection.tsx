import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard, { Product } from "./ProductCard";
import { formatCurrency } from "@/utils/currency";
import { useSimilarProducts } from "@/hooks/useSimilarProducts";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

// Fallback images
import headphones from "@/assets/prod-headphones.jpg";
import sneakers from "@/assets/prod-sneakers.jpg";
import watch from "@/assets/prod-watch.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import coffee from "@/assets/prod-coffeemaker.jpg";
import controller from "@/assets/prod-controller.jpg";

const fallbackImages = [headphones, sneakers, watch, laptop, coffee, controller];

interface RelatedProductsSectionProps {
  currentVariant: any;
  title?: string;
  limit?: number;
}

const RelatedProductsSection = ({ 
  currentVariant, 
  title = "Related products",
  limit = 12 
}: RelatedProductsSectionProps) => {
  const { data: similarProducts, isLoading } = useSimilarProducts(currentVariant, limit);

  // Convert data to ProductCard format
  const products: Product[] = (similarProducts || []).map((product, index) => {
    // Get the lowest price listing
    const lowestPriceListing = product.listings.reduce((min, listing) => 
      !min || listing.price < min.price ? listing : min, 
    product.listings[0]);

    // Use primary image or fallback
    const mainImageUrl = product.primaryImage || fallbackImages[index % fallbackImages.length];

    // Get store count for display
    const storeCount = product.listings?.length || 0;
    const storeDisplay = storeCount > 1 ? `${storeCount} stores` : (product.listings[0]?.store_name || 'Multiple stores');

    // Use variant name if available, otherwise fall back to product model name
    const displayName = product.name || product.products.model_name;
    
    // Get brand name from the joined brands table if available
    const brandName = product.products.brands?.name || 'Unknown Brand';
    
    // Get actual category from product data
    const categorySlug = product.products.category?.slug || 'smartphones';
    
    return {
      id: product.id,
      title: displayName,
      brand: brandName,
      image: mainImageUrl,
      lowestPrice: formatCurrency(lowestPriceListing?.price || 0),
      originalPrice: lowestPriceListing?.original_price ? formatCurrency(lowestPriceListing.original_price) : null,
      discount: lowestPriceListing?.discount_percentage,
      store: storeDisplay,
      rating: lowestPriceListing?.rating || 0,
      reviewCount: lowestPriceListing?.review_count || 0,
      category: categorySlug,
    };
  });

  if (isLoading) {
    return (
      <section aria-labelledby="related" className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 id="related" className="text-2xl md:text-3xl font-semibold">{title}</h2>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1">
                <div className="aspect-[4/3] bg-muted animate-pulse rounded-lg mb-4" />
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-6 bg-muted animate-pulse rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section aria-labelledby="related" className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 id="related" className="text-2xl md:text-3xl font-semibold">{title}</h2>
        </div>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {products.map((p) => {
              const hasDiscount = p.discount && p.discount > 0;
              
              return (
                <CarouselItem key={p.id} className="basis-11/12 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="relative group">
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        -{p.discount}%
                      </div>
                    )}
                    <Link to={`/product/${p.id}`} className="block">
                      <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {p.lowestPrice}
                          </span>
                          {hasDiscount && p.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {p.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(p.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({p.reviewCount})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.store}</p>
                      </div>
                    </Link>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default RelatedProductsSection;
