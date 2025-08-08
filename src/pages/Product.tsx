import { useEffect, useMemo } from "react";
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

  // Mock product; in real app, fetch by id
  const product = useMemo(
    () => ({
      id: id ?? "1",
      title: "Wireless Noise-Cancelling Headphones",
      images: [prodHeadphones, prodWatch, prodLaptop, prodController],
      rating: 4.6,
      reviews: 1284,
      short: "Premium over‑ear headphones with adaptive noise cancellation and 30‑hour battery life.",
      features: [
        "Adaptive ANC with transparency",
        "Bluetooth 5.3, multipoint",
        "30h battery, USB‑C fast charging",
        "Memory foam ear cushions",
      ],
      priceRange: "$149 — $189",
    }),
    [id]
  );

  const offers: Offer[] = [
    { store: "NovaMart", price: "$149.00", delivery: "Free 2–4 days", url: "#", inStock: true },
    { store: "QuickBuy", price: "$159.00", delivery: "$5 • Next day", url: "#", inStock: true },
    { store: "Shoply", price: "$169.00", delivery: "Free • 5–7 days", url: "#", inStock: true },
    { store: "PriceHub", price: "$189.00", delivery: "$7 • 3–5 days", url: "#", inStock: false },
  ];

  const related: ProductCardType[] = [
    { id: "rel-1", title: "Ergonomic Wireless Mouse", image: prodController, lowestPrice: "$29.99", store: "NovaMart" },
    { id: "rel-2", title: "Portable Bluetooth Speaker", image: prodWatch, lowestPrice: "$49.00", store: "QuickBuy" },
    { id: "rel-3", title: "USB‑C Fast Charger 65W", image: prodLaptop, lowestPrice: "$24.50", store: "Shoply" },
    { id: "rel-4", title: "Hi‑Res In‑Ear Monitors", image: prodHeadphones, lowestPrice: "$89.00", store: "PriceHub" },
  ];

  useEffect(() => {
    const title = `${product.title} | Best Prices & Comparison`;
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    const description = `${product.title} – compare prices across stores. ${product.short}`.slice(0, 155);
    if (meta) meta.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
  }, [product.title, product.short]);

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviews.toString(),
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
              <Link to="/category/headphones">Headphones</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} alt={product.title} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{product.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <RatingStars rating={product.rating} />
              <span>{product.rating.toFixed(1)}</span>
              <span>•</span>
              <a href="#reviews" className="underline underline-offset-4">{product.reviews.toLocaleString()} reviews</a>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Price range</div>
                <div className="text-2xl font-semibold">{product.priceRange}</div>
              </div>
              <Badge variant="secondary">Lowest at NovaMart</Badge>
            </div>
          </div>

          <p className="text-muted-foreground">{product.short}</p>

          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

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
                  Experience immersive sound with adaptive noise cancellation, engineered for focus and comfort. Soft memory foam cushions provide all‑day wear while the precision drivers deliver studio‑quality audio.
                </p>
                <p>
                  Connect to multiple devices at once and switch seamlessly. With up to 30 hours of battery life, you can enjoy uninterrupted listening throughout your day.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specs" className="animate-in fade-in-50 slide-in-from-top-1">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Spec label="Connectivity" value="Bluetooth 5.3 (AAC, SBC)" />
                  <Spec label="Battery" value="Up to 30 hours" />
                  <Spec label="Charging" value="USB‑C fast charge (10 min = 5 hrs)" />
                  <Spec label="Weight" value="265 g" />
                  <Spec label="Microphones" value="4 ANC + 2 voice" />
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
                    <RatingStars rating={4.6} />
                    <span className="text-sm text-muted-foreground">Based on {product.reviews.toLocaleString()} reviews</span>
                  </div>
                  <Button variant="secondary">Write a review</Button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>“Fantastic ANC and comfort. Battery easily lasts a week of commuting.”</p>
                  <p>“Multipoint works flawlessly between my laptop and phone.”</p>
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
          <Link to="/category/headphones" className="text-sm underline underline-offset-4">See all</Link>
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
