import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard, { Product } from "./ProductCard";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

// Fallback images
import headphones from "@/assets/prod-headphones.jpg";
import sneakers from "@/assets/prod-sneakers.jpg";
import watch from "@/assets/prod-watch.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import coffee from "@/assets/prod-coffeemaker.jpg";
import controller from "@/assets/prod-controller.jpg";

const fallbackImages = [headphones, sneakers, watch, laptop, coffee, controller];

const ProductCarousel = () => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts(6);

  // Convert Supabase data to ProductCard format
  const products: Product[] = featuredProducts?.map((product, index) => ({
    id: product.id,
    title: product.model_name,
    image: fallbackImages[index % fallbackImages.length], // Use fallback images for now
    lowestPrice: product.min_price ? formatCurrency(product.min_price) : "N/A",
    store: "Multiple stores", // Will be updated when we integrate listings
  })) || [];

  if (isLoading) {
    return (
      <section aria-labelledby="trending" className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 id="trending" className="text-2xl md:text-3xl font-semibold">Trending products</h2>
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
    <section aria-labelledby="trending" className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 id="trending" className="text-2xl md:text-3xl font-semibold">Trending products</h2>
        </div>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {products.map((p) => (
              <CarouselItem key={p.id} className="basis-11/12 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default ProductCarousel;
