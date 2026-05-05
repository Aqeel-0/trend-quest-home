import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCarousel } from "@/components/ProductCarousel";
import { Product } from "@/components/ProductCard";
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

  const storeCount = listings.length;
  const storeDisplay = storeCount > 1
    ? `${storeCount} stores`
    : (lowestPriceListing?.store_name || "View deals");

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
    store: storeDisplay,
    rating: lowestPriceListing?.rating ?? undefined,
    reviewCount: lowestPriceListing?.review_count ?? undefined,
    category: variant.products?.categories?.slug,
  };
};

const Index = () => {
  const { data: variants = [], isLoading } = useHomePageProducts();

  const trendingProducts = useMemo(
    () =>
      variants
        .filter((v) => v.products?.is_featured)
        .slice(0, 6)
        .map(mapVariantToProduct),
    [variants]
  );

  const recentProducts = useMemo(
    () =>
      variants
        .filter((v) => v.products?.launch_date)
        .sort(
          (a, b) =>
            new Date(b.products.launch_date!).getTime() -
            new Date(a.products.launch_date!).getTime()
        )
        .slice(0, 6)
        .map(mapVariantToProduct),
    [variants]
  );

  const allProductCards = useMemo(
    () => variants.map(mapVariantToProduct),
    [variants]
  );

  // Gather real store names for the marquee
  const storeNames = useMemo(() => {
    const names = new Set<string>();
    variants.forEach((v) =>
      (v.listings || []).forEach((l) => {
        if (l.store_name) names.add(l.store_name);
      })
    );
    return Array.from(names).slice(0, 10);
  }, [variants]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />

        {/* Store marquee strip */}
        {storeNames.length > 0 && (
          <section className="border-y border-border py-8 overflow-hidden bg-secondary/30">
            <div className="container">
              <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground mb-6">
                Tracking prices across top retailers
              </p>
              <div className="relative overflow-hidden">
                <div className="flex animate-marquee gap-16 whitespace-nowrap">
                  {[...storeNames, ...storeNames, ...storeNames].map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground/40 hover:text-foreground transition-base"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending */}
        <section className="container py-20 md:py-28">
          <SectionHeading
            eyebrow="Trending"
            title="What everyone's buying right now."
            description="Real search and price-tracking data from the last 7 days. Updated daily."
            action={
              <Link
                to="/search"
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-base"
              >
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading trending products…</div>
          ) : (
            <ProductCarousel products={trendingProducts} />
          )}
        </section>

        {/* Recently launched */}
        {recentProducts.length > 0 && (
          <section className="container py-12 md:py-20">
            <SectionHeading
              eyebrow="New arrivals"
              title="Just hit the market."
              description="The latest product launches with day-one pricing across every major retailer."
              action={
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-base"
                >
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              }
            />
            <ProductCarousel products={recentProducts} />
          </section>
        )}

        {/* CTA banner */}
        <section className="container py-12 md:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background px-8 py-14 md:px-16 md:py-20">
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
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

        {/* All products catalog */}
        <section className="container py-12 md:py-20 pb-28">
          <SectionHeading
            eyebrow="Catalog"
            title="Every product we track."
            description="Tap any product to see live prices from all retailers."
          />
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading products…</div>
          ) : (
            <ProductCarousel products={allProductCards} />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
