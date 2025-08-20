import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductGallery from "@/components/ProductGallery";
import PriceComparisonTable, { Offer } from "@/components/PriceComparisonTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard, { type Product as ProductCardType } from "@/components/ProductCard";
import { Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProduct, useProductVariants, useProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

import prodHeadphones from "@/assets/prod-headphones.jpg";
import prodLaptop from "@/assets/prod-laptop.jpg";
import prodWatch from "@/assets/prod-watch.jpg";
import prodController from "@/assets/prod-controller.jpg";

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i < full || (i === full && half);
        return <Star key={i} className={fill ? "fill-current" : ""} />;
      })}
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  
  const { data: product, isLoading: productLoading } = useProduct(id ?? "");
  const { data: variants, isLoading: variantsLoading } = useProductVariants(id ?? "");
  const { data: relatedProducts } = useProducts(4);

  const isLoading = productLoading || variantsLoading;

  type Variants = {
    colors?: { name: string; hex: string }[];
    ram?: string[];
    storage?: string[];
  };

  type ProductData = {
    id: string;
    title: string;
    images: string[];
    rating: number;
    reviews: number;
    short: string;
    features: string[];
    priceRange: string;
    variants?: Variants;
  };

  // Mock product; in real app, fetch by id
  const productData = useMemo<ProductData>(
    () => {
      if (!product) {
        return {
          id: id ?? "1",
          title: "Loading...",
          images: [prodLaptop, prodWatch, prodController, prodHeadphones],
          rating: 0,
          reviews: 0,
          short: "",
          features: [],
          priceRange: "Loading...",
          variants: undefined,
        };
      }

      return {
        id: product.id,
        title: product.model_name,
        images: [prodLaptop, prodWatch, prodController, prodHeadphones], // Use fallback images
        rating: product.rating || 4.5,
        reviews: Math.floor(Math.random() * 2000) + 100, // Random for demo
        short: product.description || "Product description not available.",
        features: product.specifications?.features || [
          "High-quality construction",
          "Advanced technology",
          "Reliable performance",
          "Excellent value",
          "Customer satisfaction guaranteed",
        ],
        priceRange: product.min_price && product.max_price 
          ? `${formatCurrency(product.min_price)} — ${formatCurrency(product.max_price)}`
          : "Price not available",
        variants: {
          colors: [
            { name: "Midnight Black", hex: "#1a1a1a" },
            { name: "Silver", hex: "#e5e5e5" },
            { name: "Ocean Blue", hex: "#1e40af" },
            { name: "Rose Gold", hex: "#f59e0b" },
          ],
          ram: ["8GB", "12GB", "16GB"],
          storage: ["128GB", "256GB", "512GB", "1TB"],
        },
      };
    },
    [id, product]
  );

const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
const [selectedRam, setSelectedRam] = useState<string | undefined>(undefined);
const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined);

useEffect(() => {
  setSelectedColor((prev) => prev ?? productData.variants?.colors?.[0]?.name);
  setSelectedRam((prev) => prev ?? productData.variants?.ram?.[0]);
  setSelectedStorage((prev) => prev ?? productData.variants?.storage?.[0]);
}, [productData]);

// Convert variants and listings to offers
const offers: Offer[] = useMemo(() => {
  if (!variants || variants.length === 0) {
    return [
      { store: "NovaMart", price: productData.priceRange, delivery: "Free 2–4 days", url: "#", inStock: true },
      { store: "QuickBuy", price: productData.priceRange, delivery: "$5 • Next day", url: "#", inStock: true },
      { store: "Shoply", price: productData.priceRange, delivery: "Free • 5–7 days", url: "#", inStock: true },
    ];
  }

  const allOffers: Offer[] = [];
  variants.forEach(variant => {
    variant.listings.forEach(listing => {
      allOffers.push({
        store: listing.store_name,
        price: formatCurrency(listing.price),
        delivery: "Free shipping",
        url: listing.url,
        inStock: listing.stock_status === 'in_stock',
      });
    });
  });

  return allOffers.slice(0, 4); // Limit to 4 offers
}, [variants, productData.priceRange]);

  const related: ProductCardType[] = useMemo(() => {
    if (!relatedProducts) {
      return [
        { id: "rel-1", title: "Ergonomic Wireless Mouse", image: prodController, lowestPrice: "$29.99", store: "NovaMart" },
        { id: "rel-2", title: "Portable Bluetooth Speaker", image: prodWatch, lowestPrice: "$49.00", store: "QuickBuy" },
        { id: "rel-3", title: "USB‑C Fast Charger 65W", image: prodLaptop, lowestPrice: "$24.50", store: "Shoply" },
        { id: "rel-4", title: "Hi‑Res In‑Ear Monitors", image: prodHeadphones, lowestPrice: "$89.00", store: "PriceHub" },
      ];
    }

    const fallbackImages = [prodController, prodWatch, prodLaptop, prodHeadphones];
    return relatedProducts.map((product, index) => ({
      id: product.id,
      title: product.model_name,
      image: fallbackImages[index % fallbackImages.length],
      lowestPrice: product.min_price ? formatCurrency(product.min_price) : "N/A",
      store: "Multiple stores",
    }));
  }, [relatedProducts]);

  useEffect(() => {
    const title = `${productData.title} | Best Prices & Comparison`;
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    const description = `${productData.title} – compare prices across stores. ${productData.short}`.slice(0, 155);
    if (meta) meta.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
  }, [productData.title, productData.short]);

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: productData.title,
    image: productData.images,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: productData.rating.toFixed(1),
      reviewCount: productData.reviews.toString(),
    },
    offers: offers.map((o) => ({
      '@type': 'Offer',
      price: o.price.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: o.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: o.url,
      seller: { '@type': 'Organization', name: o.store },
    })),
  } as const;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="h-4 bg-muted animate-pulse rounded w-60 mb-6" />
        <div className="mt-6 grid gap-8 lg:grid-cols-7 xl:gap-10">
          <div className="lg:col-span-3">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="lg:col-span-4 space-y-5">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/category/smartphones">Smartphones</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{productData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-7 xl:gap-10">
        <div className="lg:col-span-3">
          <ProductGallery images={productData.images} alt={productData.title} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{productData.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <RatingStars rating={productData.rating} />
              <span>{productData.rating.toFixed(1)}</span>
              <span>•</span>
              <a href="#reviews" className="underline underline-offset-4">{productData.reviews.toLocaleString()} reviews</a>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Price range</div>
                <div className="text-2xl font-semibold">{productData.priceRange}</div>
              </div>
              <Badge variant="secondary">Best value</Badge>
            </div>
          </div>

          <p className="text-muted-foreground">{productData.short}</p>

          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {productData.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          
          {/* Variants (render only if available) */}
          {(productData.variants?.colors?.length ||
            productData.variants?.ram?.length ||
            productData.variants?.storage?.length) ? (
            <div className="rounded-lg border p-4 space-y-4">
              {productData.variants?.colors?.length ? (
                <div>
                  <div className="mb-2 text-sm font-medium">
                    Color{selectedColor ? `: ${selectedColor}` : ""}
                  </div>
                  <RadioGroup
                    className="flex flex-wrap gap-3"
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                  >
                    {(productData.variants?.colors ?? []).map((c) => (
                      <label key={c.name} className="cursor-pointer">
                        <RadioGroupItem
                          value={c.name}
                          aria-label={c.name}
                          className="h-7 w-7 rounded-full border border-input ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-primary data-[state=checked]:ring-offset-2 [&_svg]:hidden"
                          style={{ backgroundColor: c.hex }}
                        />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ) : null}

              {productData.variants?.ram?.length ? (
                <div>
                  <div className="mb-2 text-sm font-medium">
                    RAM{selectedRam ? `: ${selectedRam}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(productData.variants?.ram ?? []).map((r) => (
                      <Button
                        key={r}
                        type="button"
                        size="sm"
                        variant={selectedRam === r ? "default" : "outline"}
                        onClick={() => setSelectedRam(r)}
                        aria-pressed={selectedRam === r}
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {productData.variants?.storage?.length ? (
                <div>
                  <div className="mb-2 text-sm font-medium">
                    Storage{selectedStorage ? `: ${selectedStorage}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(productData.variants?.storage ?? []).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={selectedStorage === s ? "default" : "outline"}
                        onClick={() => setSelectedStorage(s)}
                        aria-pressed={selectedStorage === s}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="pt-2">
            <PriceComparisonTable offers={offers} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="animate-in fade-in-50 slide-in-from-top-1">
            <Card>
              <CardContent className="space-y-3 leading-relaxed p-4 md:p-6">
                <p>
                  Experience the future of mobile technology with the Acme Nova Smartphone X. Featuring a stunning 6.7-inch 120Hz OLED display that brings content to life with vibrant colors and smooth scrolling.
                </p>
                <p>
                  The advanced AI-powered triple camera system captures professional-quality photos and videos in any lighting condition. With 5G connectivity and all-day battery life, stay connected and productive wherever you go.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specs" className="animate-in fade-in-50 slide-in-from-top-1">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Spec label="Display" value="6.7-inch 120Hz OLED" />
                  <Spec label="Processor" value="Octa-core 3.2GHz" />
                  <Spec label="Camera" value="108MP + 12MP + 12MP" />
                  <Spec label="Battery" value="4800mAh with wireless charging" />
                  <Spec label="OS" value="Android 14" />
                  <Spec label="Warranty" value="24 months" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent id="reviews" value="reviews" className="animate-in fade-in-50 slide-in-from-top-1">
            <Card>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={productData.rating} />
                    <span className="text-sm text-muted-foreground">Based on {productData.reviews.toLocaleString()} reviews</span>
                  </div>
                  <Button variant="secondary">Write a review</Button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>“Amazing camera quality and the 120Hz display is incredibly smooth. Best phone I've owned!”</p>
                  <p>“Battery easily lasts a full day even with heavy use. 5G speeds are impressive.”</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Related products</h2>
          <Link to="/category/smartphones" className="text-sm underline underline-offset-4">See all</Link>
        </div>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {related.map((p) => (
              <CarouselItem key={p.id} className="basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
