import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { cn } from "@/lib/utils";

interface ProductItem {
  id: string;
  title: string;
  brand?: string;
  image: string;
  lowestPrice: string;
  originalPrice?: string | null;
  discount?: number;
  store: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
}

interface Props {
  products: ProductItem[];
  isLoading?: boolean;
  skeletonCount?: number;
}

const SCROLL_STEP_MULTIPLIER = 1; // scroll by one viewport page (feels predictable)

export const ProductCarousel = ({ products, isLoading = false, skeletonCount = 6 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [progress, setProgress] = useState(0);

  const updateState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollable = maxScroll > 8;
    setCanScrollLeft(scrollable && el.scrollLeft > 4);
    setCanScrollRight(scrollable && el.scrollLeft < maxScroll - 4);
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState, products.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const step = el.clientWidth * 0.9 * SCROLL_STEP_MULTIPLIER;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByPage(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByPage(-1);
    }
  };

  if (!products.length && !isLoading) return null;

  return (
    <div className="relative">
      {/* Desktop arrows — vertically centered over the image area (image is ~62% of card height thanks to aspect-[4/5]) */}
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Previous products"
        disabled={!canScrollLeft}
        className={cn(
          "hidden md:grid absolute z-20 h-11 w-11 place-items-center rounded-full bg-card border border-border shadow-card text-foreground transition-all duration-200",
          "hover:scale-105 hover:bg-foreground hover:text-background hover:border-foreground",
          "left-0 -translate-x-1/2 top-1/2 -translate-y-1/2",
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Next products"
        disabled={!canScrollRight}
        className={cn(
          "hidden md:grid absolute z-20 h-11 w-11 place-items-center rounded-full bg-card border border-border shadow-card text-foreground transition-all duration-200",
          "hover:scale-105 hover:bg-foreground hover:text-background hover:border-foreground",
          "right-0 translate-x-1/2 top-1/2 -translate-y-1/2",
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>


      <div
        ref={ref}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="region"
        aria-label="Product carousel"
        aria-roledescription="carousel"
        className="no-scrollbar snap-x-mandatory overflow-x-auto scroll-smooth flex gap-5 sm:gap-6 pb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                data-carousel-item
                className="snap-start-always shrink-0 w-[240px] sm:w-[272px] lg:w-[300px]"
              >
                <ProductCardSkeleton variant="carousel" />
              </div>
            ))
          : products.map((p) => (
              <div
                key={p.id}
                data-carousel-item
                className="snap-start-always shrink-0 w-[240px] sm:w-[272px] lg:w-[300px]"
              >
                <ProductCard product={p} />
              </div>
            ))}
      </div>

      {/* Progress indicator — thumb width is 30%, so max translateX is 70% of track */}
      {!isLoading && products.length > 2 && (
        <div className="mx-auto mt-4 h-[3px] w-full max-w-[200px] overflow-hidden rounded-full bg-border/70">
          <div
            className="h-full w-[30%] rounded-full bg-foreground transition-transform duration-150 ease-out"
            style={{ transform: `translateX(${progress * (100 / 0.3 - 100)}%)` }}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
};
