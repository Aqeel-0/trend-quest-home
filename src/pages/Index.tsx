import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCarousel } from "@/components/ProductCarousel";
import { Product } from "@/components/ProductCard";
import BrandStrip from "@/components/BrandStrip";
import ValueProps from "@/components/ValueProps";
import { useHomePageProducts, HomePageVariant } from "@/hooks/useHomePageProducts";
import { extractPrimaryImage } from "@/hooks/useProductVariantsWithListings";
import { formatCurrency } from "@/utils/currency";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const mapVariantToProduct = (variant: HomePageVariant): Product => {
  const listings = variant.listings || [];
  const sortedListings = [...listings].sort((a, b) => a.price - b.price);
  const lowestPriceListing = sortedListings[0];
  const imageUrl = extractPrimaryImage(variant.images) || "";
  return {
    id: variant.id,
    title: variant.name || variant.products?.model_name || "Product",
    brand: variant.products?.brands?.name || "",
    image: imageUrl,
    lowestPrice: lowestPriceListing ? formatCurrency(lowestPriceListing.price) : "Price N/A",
    originalPrice: lowestPriceListing?.original_price
      ? formatCurrency(lowestPriceListing.original_price)
      : null,
    discount: lowestPriceListing?.discount_percentage ?? undefined,
    storeName: lowestPriceListing?.store_name ?? "",
    storeCount: listings.length,
    rating: lowestPriceListing?.rating ?? undefined,
    reviewCount: lowestPriceListing?.review_count ?? undefined,
    category: variant.products?.categories?.slug,
  };
};

/* -------------------------------------------------------------------------- */
/*  Reusable carousel section wrapper — gives the arrows room to peek outside  */
/* -------------------------------------------------------------------------- */
function CarouselSection({
  eyebrow,
  title,
  actionTo,
  actionLabel,
  products,
  isLoading,
}: {
  eyebrow: string;
  title: string;
  actionTo: string;
  actionLabel: string;
  products: Product[];
  isLoading: boolean;
}) {
  return (
    <section className="pt-20 md:pt-28">
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            <Link
              to={actionTo}
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-base"
            >
              {actionLabel} <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
      {/* px-4/6 mirrors .container padding so arrows can translate outside */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <ProductCarousel products={products} isLoading={isLoading} skeletonCount={6} />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                        */
/* -------------------------------------------------------------------------- */
const Index = () => {
  const { data: variants = [], isLoading } = useHomePageProducts();

  const trendingProducts = useMemo(() => {
    const featured = variants.filter((v) => v.products?.is_featured);
    const pool = featured.length >= 6 ? featured : variants;
    return pool.slice(0, 10).map(mapVariantToProduct);
  }, [variants]);

  const recentProducts = useMemo(
    () =>
      variants
        .filter((v) => v.products?.launch_date)
        .sort(
          (a, b) =>
            new Date(b.products.launch_date!).getTime() -
            new Date(a.products.launch_date!).getTime()
        )
        .slice(0, 10)
        .map(mapVariantToProduct),
    [variants]
  );

  const topDeals = useMemo(
    () =>
      variants
        .filter((v) => (v.listings || []).some((l) => (l.discount_percentage ?? 0) > 0))
        .sort((a, b) => {
          const aMax = Math.max(...(a.listings || []).map((l) => l.discount_percentage ?? 0), 0);
          const bMax = Math.max(...(b.listings || []).map((l) => l.discount_percentage ?? 0), 0);
          return bMax - aMax;
        })
        .slice(0, 10)
        .map(mapVariantToProduct),
    [variants]
  );

  const FALLBACK_STORES = [
    "Amazon", "Flipkart", "Croma", "Reliance Digital", "Vijay Sales",
    "Tata Cliq", "Myntra", "Snapdeal", "Paytm Mall", "Samsung Shop",
  ];

  const storeNames = useMemo(() => {
    const names = new Set<string>();
    variants.forEach((v) => (v.listings || []).forEach((l) => { if (l.store_name) names.add(l.store_name); }));
    const fromData = Array.from(names);
    // Merge DB names with fallbacks, deduplicate, keep at least 8 entries
    const merged = Array.from(new Set([...fromData, ...FALLBACK_STORES]));
    return merged.slice(0, 12);
  }, [variants]);

  const showDeals = isLoading || topDeals.length >= 3;
  const showRecent = isLoading || recentProducts.length >= 3;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />

        {/* Retailer marquee — always visible, scrolls left → right */}
        <div className="border-y border-border/70 py-8 bg-secondary/30">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground mb-6">
            Tracking prices across top retailers
          </p>
          {/* overflow-hidden clips the seamless duplicate; the strip must NOT be inside .container */}
          <div className="overflow-hidden marquee-container">
            <div className="flex animate-marquee-rtl gap-14 whitespace-nowrap w-max">
              {/* duplicate once — the keyframe moves from -50% to 0 so we need 2× content */}
              {[...storeNames, ...storeNames].map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="text-xl md:text-2xl font-semibold tracking-tight text-foreground/35 hover:text-foreground/70 transition-base select-none"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Brand strip */}
        <section className="container pt-16 md:pt-20">
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Brands
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-foreground">
              Shop by brand
            </h2>
          </div>
          <BrandStrip />
        </section>

        {/* Trending carousel */}
        <CarouselSection
          eyebrow="Trending"
          title="Trending now"
          actionTo="/trending"
          actionLabel="View all"
          products={trendingProducts}
          isLoading={isLoading}
        />

        {/* Top deals carousel */}
        {showDeals && (
          <CarouselSection
            eyebrow="Top deals"
            title="Biggest price drops this week."
            actionTo="/deals"
            actionLabel="See all deals"
            products={topDeals}
            isLoading={isLoading}
          />
        )}

        {/* Value props */}
        <section className="container pt-24 md:pt-32">
          <div className="mb-10">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Why TrendQuest
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-foreground max-w-2xl">
              The calmest way to find the best price.
            </h2>
          </div>
          <ValueProps />
        </section>

        {/* New arrivals carousel */}
        {showRecent && (
          <CarouselSection
            eyebrow="New arrivals"
            title="Just hit the market."
            actionTo="/new-arrivals"
            actionLabel="View all"
            products={recentProducts}
            isLoading={isLoading}
          />
        )}

        {/* CTA banner */}
        <section className="container py-24 md:py-32">
          <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background px-8 py-14 md:px-16 md:py-20">
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" aria-hidden />
            <div className="relative max-w-2xl">
              <span className="text-xs uppercase tracking-[0.22em] text-background/60">
                Save smarter
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                Never overpay for a product again.
              </h2>
              <p className="mt-5 text-background/70 text-base md:text-lg leading-relaxed max-w-lg">
                Track price drops, see historical lows, and get notified the moment your favourite
                product hits its target price.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/compare"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-base"
                >
                  Compare products <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 rounded-full bg-background/10 text-background px-6 py-3 text-sm font-semibold hover:bg-background/20 transition-base"
                >
                  Browse all products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
