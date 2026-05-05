import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

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
}

export const ProductCarousel = ({ products }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir * 2, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:mx-0">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 lg:w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 lg:w-16 z-10 bg-gradient-to-l from-background to-transparent" />

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        disabled={!canScrollLeft}
        className={`hidden md:grid absolute left-3 lg:left-4 top-[40%] -translate-y-1/2 z-20 h-12 w-12 place-items-center rounded-full bg-card border border-border shadow-card text-foreground transition-base hover:bg-foreground hover:text-background hover:border-foreground ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        disabled={!canScrollRight}
        className={`hidden md:grid absolute right-3 lg:right-4 top-[40%] -translate-y-1/2 z-20 h-12 w-12 place-items-center rounded-full bg-card border border-border shadow-card text-foreground transition-base hover:bg-foreground hover:text-background hover:border-foreground ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        className="no-scrollbar snap-x-mandatory overflow-x-auto scroll-smooth flex gap-6 px-4 sm:px-6 lg:px-2 pb-4"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-carousel-item
            className="snap-start-always shrink-0 w-[260px] sm:w-[280px] lg:w-[300px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};
