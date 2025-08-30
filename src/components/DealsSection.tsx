import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard, { Product } from "./ProductCard";
import { formatCurrency } from "@/utils/currency";
import { useTopDeals } from "@/hooks/useTopDeals";

// Fallback images
import headphones from "@/assets/prod-headphones.jpg";
import sneakers from "@/assets/prod-sneakers.jpg";
import watch from "@/assets/prod-watch.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import coffee from "@/assets/prod-coffeemaker.jpg";
import controller from "@/assets/prod-controller.jpg";

const fallbackImages = [headphones, sneakers, watch, laptop, coffee, controller];

const DealsSection = () => {
  const { data: topDeals, isLoading } = useTopDeals();

  // Convert Supabase data to ProductCard format
  const products: Product[] = (topDeals || []).map((product, index) => {
    // Use the product data directly since it's already in the right format from the hook
    const listing = {
      price: product.price,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      store_name: product.store_name,
      rating: product.rating,
      review_count: product.review_count,
      currency: product.currency
    };

    // Extract the main image URL
    let mainImageUrl = fallbackImages[index % fallbackImages.length];
    if (product.product_variants?.images) {
      try {
        const images = Array.isArray(product.product_variants.images) 
          ? product.product_variants.images 
          : JSON.parse(product.product_variants.images as string);
        
        if (Array.isArray(images) && images.length > 0) {
          const mainImage = images[0];
          if (mainImage && mainImage.url) {
            mainImageUrl = mainImage.url;
          }
        }
      } catch (e) {
        console.error('Error parsing product images:', e);
      }
    }

    // Get store display
    const storeDisplay = listing.store_name || 'Multiple stores';

    // Get product name and brand
    const displayName = product.product_variants?.name || product.product_variants?.products?.model_name || 'Product';
    const brandName = product.product_variants?.products?.brands?.name || 'Unknown Brand';
    
    return {
      id: product.id,
      title: displayName,
      brand: brandName,
      image: mainImageUrl,
      lowestPrice: formatCurrency(listing.price || 0),
      originalPrice: listing.original_price ? formatCurrency(listing.original_price) : null,
      discount: listing.discount_percentage,
      store: storeDisplay,
      rating: listing.rating || 0,
      reviewCount: listing.review_count || 0,
    };
  });

  if (isLoading) {
    return (
      <section aria-labelledby="deals" className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 id="deals" className="text-2xl md:text-3xl font-semibold">Top deals</h2>
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

  return (
    <section aria-labelledby="deals" className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 id="deals" className="text-2xl md:text-3xl font-semibold">Top deals</h2>
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
                        {p.discount}% OFF
                      </div>
                    )}
                    <ProductCard product={p} />
                    <div className="mt-2 flex items-center">
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
                    {p.originalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm line-through">{p.originalPrice}</span>
                        <span className="text-green-600 text-sm font-medium">{p.lowestPrice}</span>
                      </div>
                    )}
                    {!p.originalPrice && (
                      <div className="text-foreground font-medium mt-1">{p.lowestPrice}</div>
                    )}
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

export default DealsSection;
