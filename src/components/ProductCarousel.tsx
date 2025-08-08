import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard, { Product } from "./ProductCard";

import headphones from "@/assets/prod-headphones.jpg";
import sneakers from "@/assets/prod-sneakers.jpg";
import watch from "@/assets/prod-watch.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import coffee from "@/assets/prod-coffeemaker.jpg";
import controller from "@/assets/prod-controller.jpg";

const trending: Product[] = [
  { id: "1", title: "Wireless Noise-Cancelling Headphones", image: headphones, lowestPrice: "$129.99", store: "NovaMart" },
  { id: "2", title: "Lightweight Running Sneakers", image: sneakers, lowestPrice: "$79.50", store: "PriceHub" },
  { id: "3", title: "Smart Fitness Watch Series X", image: watch, lowestPrice: "$159.00", store: "QuickBuy" },
  { id: "4", title: "Ultra Slim 14" + " Laptop", image: laptop, lowestPrice: "$899.00", store: "Shoply" },
  { id: "5", title: "Compact Coffee Maker 2-Cup", image: coffee, lowestPrice: "$49.99", store: "PriceHub" },
  { id: "6", title: "Wireless Game Controller Pro", image: controller, lowestPrice: "$59.00", store: "NovaMart" },
];

const ProductCarousel = () => {
  return (
    <section aria-labelledby="trending" className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 id="trending" className="text-2xl md:text-3xl font-semibold">Trending products</h2>
        </div>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {trending.map((p) => (
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
