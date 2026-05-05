import { Link, useNavigate } from "react-router-dom";
import { Plus, X, Star, Trash2, ArrowLeftRight, Check, ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompare } from "@/components/CompareProvider";
import { useHomePageProducts, HomePageVariant } from "@/hooks/useHomePageProducts";
import { extractPrimaryImage } from "@/hooks/useProductVariantsWithListings";
import { formatCurrency } from "@/utils/currency";
import { useMemo } from "react";

const MAX_SLOTS = 4;

const Index = () => {
  const { ids, add, remove, clear } = useCompare();
  const { data: variants = [] } = useHomePageProducts();
  const navigate = useNavigate();

  const selected = useMemo(
    () => ids.map((id) => variants.find((v) => v.id === id)).filter(Boolean) as HomePageVariant[],
    [ids, variants]
  );
  const slots = Array.from({ length: Math.max(2, Math.min(MAX_SLOTS, selected.length + 1)) });

  // Compute best values across selected variants
  const bestPrice = useMemo(() => {
    if (selected.length === 0) return 0;
    const prices = selected.map((v) => {
      const listings = v.listings || [];
      if (listings.length === 0) return Infinity;
      return Math.min(...listings.map((l) => l.price));
    });
    return Math.min(...prices);
  }, [selected]);

  const bestRating = useMemo(() => {
    if (selected.length === 0) return 0;
    return Math.max(...selected.map((v) => {
      const ratings = (v.listings || []).filter((l) => l.rating != null && l.rating > 0);
      if (ratings.length === 0) return 0;
      return ratings.reduce((s, l) => s + (l.rating || 0), 0) / ratings.length;
    }));
  }, [selected]);

  const getLowestPrice = (v: HomePageVariant) => {
    const listings = v.listings || [];
    if (listings.length === 0) return null;
    return Math.min(...listings.map((l) => l.price));
  };

  const getAvgRating = (v: HomePageVariant) => {
    const ratings = (v.listings || []).filter((l) => l.rating != null && l.rating > 0);
    if (ratings.length === 0) return null;
    return ratings.reduce((s, l) => s + (l.rating || 0), 0) / ratings.length;
  };

  const getStoreCount = (v: HomePageVariant) =>
    new Set((v.listings || []).map((l) => l.store_name)).size;

  const availableForSlot = (currentId?: string) =>
    variants.filter((v) => !ids.includes(v.id) || v.id === currentId);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 gradient-hero opacity-90" aria-hidden />
          <div className="container relative py-12 md:py-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-foreground/10 -ml-2 mb-4"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-3">
                  <ArrowLeftRight className="h-3.5 w-3.5 mr-1" /> Side-by-side comparison
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Compare products
                </h1>
                <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl">
                  Pick up to {MAX_SLOTS} products and see specs, prices and store availability side-by-side.
                </p>
              </div>
              {selected.length > 0 && (
                <Button variant="outline" onClick={clear}>
                  <Trash2 className="h-4 w-4" /> Clear all
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Comparison grid */}
        <section className="container py-10">
          {/* Variant selectors row */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${slots.length}, minmax(0, 1fr))` }}
          >
            <div />
            {slots.map((_, i) => {
              const variant = selected[i];
              const imageUrl = variant ? extractPrimaryImage(variant.images) : null;
              return (
                <div key={i} className="relative">
                  {variant ? (
                    <div className="relative rounded-2xl border border-border/60 bg-card shadow-card p-4 flex flex-col items-center text-center transition-base hover:border-primary/40">
                      <button
                        onClick={() => remove(variant.id)}
                        className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-base"
                        aria-label={`Remove ${variant.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="aspect-square w-full max-w-[160px] rounded-xl overflow-hidden bg-secondary/50 mb-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={variant.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/40">
                            {variant.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {variant.products?.brands?.name}
                      </div>
                      <Link
                        to={`/product/${variant.id}`}
                        className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-base"
                      >
                        {variant.name}
                      </Link>
                      <div className="mt-3 w-full">
                        <Select
                          value={variant.id}
                          onValueChange={(val) => {
                            remove(variant.id);
                            add(val);
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableForSlot(variant.id).map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-4 flex flex-col items-center justify-center min-h-[260px] gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-card border border-border/60">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </span>
                      <div className="text-sm text-muted-foreground text-center">Add a product to compare</div>
                      <Select onValueChange={(val) => add(val)}>
                        <SelectTrigger className="h-9 text-xs w-full bg-card">
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableForSlot().map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {selected.length === 0 && (
            <div className="mt-10 text-center max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                You haven't added any products yet. Use the selector above, or browse the catalog and tap{" "}
                <span className="font-semibold text-foreground">Compare</span> on any product.
              </p>
              <Button asChild className="mt-4 bg-foreground text-background hover:bg-accent">
                <Link to="/">Browse products</Link>
              </Button>
            </div>
          )}

          {/* Comparison table */}
          {selected.length > 0 && (
            <div className="mt-10 space-y-8">
              {/* Price row */}
              <ComparisonBlock title="Best price">
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${slots.length}, minmax(0, 1fr))` }}
                >
                  <div className="flex items-center text-sm font-semibold text-muted-foreground">
                    Lowest price
                  </div>
                  {slots.map((_, i) => {
                    const variant = selected[i];
                    if (!variant) return <div key={i} />;
                    const price = getLowestPrice(variant);
                    const isBest = price === bestPrice && price != null;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl p-4 border ${
                          isBest
                            ? "border-success/40 bg-success/5 ring-1 ring-success/30"
                            : "border-border/60 bg-card"
                        }`}
                      >
                        <div className="text-2xl font-bold">
                          {price ? formatCurrency(price) : "N/A"}
                        </div>
                        {isBest && (
                          <Badge className="mt-2 bg-success text-success-foreground border-0">
                            <Check className="h-3 w-3" /> Best price
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Per-store prices */}
                <div className="mt-4 space-y-2">
                  {(() => {
                    const allStores = new Set<string>();
                    selected.forEach((v) =>
                      (v.listings || []).forEach((l) => allStores.add(l.store_name))
                    );
                    return Array.from(allStores).slice(0, 8).map((store) => (
                      <div
                        key={store}
                        className="grid gap-4 items-center"
                        style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${slots.length}, minmax(0, 1fr))` }}
                      >
                        <div className="text-sm font-medium text-muted-foreground truncate">{store}</div>
                        {slots.map((_, i) => {
                          const variant = selected[i];
                          if (!variant) return <div key={i} />;
                          const listing = (variant.listings || []).find((l) => l.store_name === store);
                          return (
                            <div key={i} className="text-sm font-semibold">
                              {listing ? formatCurrency(listing.price) : "—"}
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
              </ComparisonBlock>

              {/* Rating */}
              <ComparisonBlock title="Rating">
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${slots.length}, minmax(0, 1fr))` }}
                >
                  <div className="flex items-center text-sm font-semibold text-muted-foreground">
                    Avg rating
                  </div>
                  {slots.map((_, i) => {
                    const variant = selected[i];
                    if (!variant) return <div key={i} />;
                    const rating = getAvgRating(variant);
                    const isBest = rating === bestRating && rating != null;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 text-sm font-semibold ${isBest ? "text-warning" : ""}`}
                      >
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {rating ? rating.toFixed(1) : "N/A"}
                      </div>
                    );
                  })}
                </div>
              </ComparisonBlock>

              {/* Overview */}
              <ComparisonBlock title="Overview">
                <div className="space-y-2">
                  {[
                    { key: "brand", label: "Brand", get: (v: HomePageVariant) => v.products?.brands?.name },
                    { key: "category", label: "Category", get: (v: HomePageVariant) => v.products?.categories?.name },
                    { key: "stores", label: "Available at", get: (v: HomePageVariant) => `${getStoreCount(v)} stores` },
                    { key: "listings", label: "Total listings", get: (v: HomePageVariant) => `${(v.listings || []).length}` },
                  ].map((row) => (
                    <div
                      key={row.key}
                      className="grid gap-4 py-3 border-b border-border/60 last:border-0"
                      style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${slots.length}, minmax(0, 1fr))` }}
                    >
                      <div className="text-sm font-semibold text-muted-foreground">{row.label}</div>
                      {slots.map((_, i) => {
                        const variant = selected[i];
                        if (!variant) return <div key={i} />;
                        return (
                          <div key={i} className="text-sm">
                            {row.get(variant) ?? "N/A"}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ComparisonBlock>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

const ComparisonBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-card overflow-x-auto">
    <h2 className="text-lg font-bold mb-4">{title}</h2>
    <div className="min-w-[640px]">{children}</div>
  </div>
);

export default Index;
