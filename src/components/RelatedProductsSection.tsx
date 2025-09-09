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
  console.log(similarProducts);
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
                  <div className="h-full flex flex-col">
                    <div className="relative group flex-1 flex flex-col">
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          {p.discount}% OFF
                        </div>
                      )}
                      <div className="flex-1">
                        <ProductCard product={p} />
                      </div>
                      <div className="mt-2 flex items-center min-h-[20px]">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(p.rating) ? 'fill-current' : 'fill-gray-300'}`}
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({p.reviewCount})</span>
                        </div>
                      </div>
                      <div className="mt-1 min-h-[24px]">
                        {p.originalPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm line-through">{p.originalPrice}</span>
                            <span className="text-green-600 text-sm font-medium">{p.lowestPrice}</span>
                          </div>
                        ) : (
                          <div className="text-foreground font-medium">{p.lowestPrice}</div>
                        )}
                      </div>
                    </div>
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
