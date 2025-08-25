import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductGallery from "@/components/ProductGallery";
import PriceComparisonTable from "@/components/PriceComparisonTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import { Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProducts } from "@/hooks/useProducts";
import { useVariantSelectionLogic } from "@/hooks/useProductVariantsWithListings";
import { formatCurrency } from "@/utils/currency";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

import prodHeadphones from "@/assets/prod-headphones.jpg";
import prodLaptop from "@/assets/prod-headphones.jpg";
import prodWatch from "@/assets/prod-headphones.jpg";
import prodController from "@/assets/prod-headphones.jpg";

// Memoized RatingStars component
const RatingStars = React.memo(({ rating }: { rating: number }) => {
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
});

RatingStars.displayName = 'RatingStars';

// Variant Selection Component
const VariantSelection = ({ 
  availableOptions, 
  currentSelection, 
  onOptionChange 
}: {
  availableOptions: { colors: string[]; ram: string[]; storage: string[] };
  currentSelection: { color: string | null; ram: string | null; storage: string | null };
  onOptionChange: (type: 'color' | 'ram' | 'storage', value: string) => void;
}) => {
  const hasOptions = availableOptions.colors.length > 0 || availableOptions.ram.length > 0 || availableOptions.storage.length > 0;
  
  if (!hasOptions) return null;
  
  return (
    <div className="rounded-lg border p-4 space-y-4">
      {/* Color Selection */}
      {availableOptions.colors.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">
            Color{currentSelection.color ? `: ${currentSelection.color}` : ""}
          </div>
          <RadioGroup
            className="flex flex-wrap gap-3"
            value={currentSelection.color || ""}
            onValueChange={(value) => onOptionChange('color', value)}
          >
            {availableOptions.colors.map((color) => (
              <label key={color} className="cursor-pointer">
                <RadioGroupItem
                  value={color}
                  aria-label={color}
                  className="h-7 w-7 rounded-full border border-input ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-primary data-[state=checked]:ring-offset-2 [&_svg]:hidden"
                  style={{ backgroundColor: getColorHex(color) }}
                />
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* RAM Selection */}
      {availableOptions.ram.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">
            RAM{currentSelection.ram ? `: ${currentSelection.ram}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableOptions.ram.map((ram) => (
              <Button
                key={ram}
                type="button"
                size="sm"
                variant={currentSelection.ram === ram ? "default" : "outline"}
                onClick={() => onOptionChange('ram', ram)}
                aria-pressed={currentSelection.ram === ram}
              >
                {ram}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Storage Selection */}
      {availableOptions.storage.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">
            Storage{currentSelection.storage ? `: ${currentSelection.storage}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableOptions.storage.map((storage) => (
              <Button
                key={storage}
                type="button"
                size="sm"
                variant={currentSelection.storage === storage ? "default" : "outline"}
                onClick={() => onOptionChange('storage', storage)}
                aria-pressed={currentSelection.storage === storage}
              >
                {storage}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback Variants Display
const FallbackVariants = ({ variants }: { variants: any[] }) => {
  if (variants.length <= 1) return null;
  
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="text-sm font-medium">Available Variants</div>
      <div className="text-xs text-muted-foreground mb-3">
        Showing all available variants for this product:
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.slice(0, 6).map((variant) => (
          <div key={variant.id} className="p-3 border rounded text-sm">
            <div className="font-medium">{variant.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {variant.listings?.length > 0 && (
                <span>From {formatCurrency(Math.min(...variant.listings.map((l: any) => l.price)))}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {variants.length > 6 && (
        <div className="text-xs text-muted-foreground text-center">
          +{variants.length - 6} more variants available
        </div>
      )}
    </div>
  );
};

// Main Product Component
export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use the optimized variant selection logic
  const {
    data,
    isLoading,
    error,
    currentSelection,
    availableOptions,
    selectedVariant,
    handleOptionChange
  } = useVariantSelectionLogic(id ?? "");
  
  // Related products
  const { data: relatedProducts } = useProducts(4);
  
  // Process product data
  const processedProductData = React.useMemo(() => {
    if (!data?.product || !selectedVariant) {
      return {
        id: id ?? "1",
        title: "Loading...",
        images: [prodLaptop, prodWatch, prodController, prodHeadphones],
        rating: 0,
        reviews: 0,
        short: "",
        features: [],
        priceRange: "Loading...",
      };
    }

    // Use variant images if available, otherwise fallback
    const images = selectedVariant.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0
      ? selectedVariant.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : [prodLaptop, prodWatch, prodController, prodHeadphones];

    return {
      id: data.product.id,
      title: selectedVariant.name || data.product.model_name,
      images,
      rating: data.product.rating || 4.5,
      reviews: Math.floor(Math.random() * 2000) + 100,
      short: data.product.description || "Product description not available.",
      features: (data.product.specifications as any)?.features || [
        "High-quality construction",
        "Advanced technology", 
        "Reliable performance",
        "Excellent value",
        "Customer satisfaction guaranteed",
      ],
      priceRange: selectedVariant.minPrice && selectedVariant.secondMinPrice
        ? `${formatCurrency(selectedVariant.minPrice)} — ${formatCurrency(selectedVariant.secondMinPrice)}`
        : selectedVariant.minPrice ? formatCurrency(selectedVariant.minPrice) : "Price not available",
    };
  }, [id, data, selectedVariant]);

  // Convert variants to offers
  const offers = React.useMemo(() => {
    if (!selectedVariant?.listings?.length) {
      return [
        { store: "NovaMart", price: processedProductData.priceRange, delivery: "Free 2–4 days", url: "#", inStock: true },
        { store: "QuickBuy", price: processedProductData.priceRange, delivery: "$5 • Next day", url: "#", inStock: true },
        { store: "Shoply", price: processedProductData.priceRange, delivery: "Free • 5–7 days", url: "#", inStock: true },
      ];
    }

    return selectedVariant.listings.slice(0, 4).map(listing => ({
      store: listing.store_name,
      price: formatCurrency(listing.price),
      delivery: "Free shipping",
      url: listing.url,
      inStock: listing.stock_status === 'in_stock',
    }));
  }, [selectedVariant, processedProductData.priceRange]);

  // Related products
  const related = React.useMemo(() => {
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

  // Memoized product schema
  const productSchema = React.useMemo(() => ({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: processedProductData.title,
    image: processedProductData.images,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: processedProductData.rating.toFixed(1),
      reviewCount: processedProductData.reviews.toString(),
    },
    offers: offers.map((o) => ({
      '@type': 'Offer',
      price: o.price.replace(/[^0-9.]/g, ''),
      priceCurrency: 'USD',
      availability: o.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: o.url,
      seller: { '@type': 'Organization', name: o.store },
    })),
  }), [processedProductData.title, processedProductData.images, processedProductData.rating, processedProductData.reviews, offers]);

  // Update page title and meta
  React.useEffect(() => {
    const title = `${processedProductData.title} | Best Prices & Comparison`;
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    const description = `${processedProductData.title} – compare prices across stores. ${processedProductData.short}`.slice(0, 155);
    if (meta) meta.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
  }, [processedProductData.title, processedProductData.short]);

  // Loading state
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
            <div className="h-24 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the product you're looking for. It might have been removed or the link might be incorrect.
          </p>
          <div className="space-x-4">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Go Home
            </Link>
            <Link to="/category/smartphones" className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have variant selection options
  const hasVariantOptions = availableOptions.colors.length > 0 || availableOptions.ram.length > 0 || availableOptions.storage.length > 0;

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
            <BreadcrumbPage>{processedProductData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-7 xl:gap-10">
        <div className="lg:col-span-3">
          <ProductGallery images={processedProductData.images} alt={processedProductData.title} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">{processedProductData.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <RatingStars rating={processedProductData.rating} />
              <span>{processedProductData.rating.toFixed(1)}</span>
              <span>•</span>
              <a href="#reviews" className="underline underline-offset-4">{processedProductData.reviews.toLocaleString()} reviews</a>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Price range</div>
                <div className="text-2xl font-semibold">{processedProductData.priceRange}</div>
              </div>
              <Badge variant="secondary">Best value</Badge>
            </div>
          </div>

          <p className="text-muted-foreground">{processedProductData.short}</p>

          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {processedProductData.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          
          {/* Dynamic Variant Selection */}
          {hasVariantOptions && (
            <VariantSelection
              availableOptions={availableOptions}
              currentSelection={currentSelection}
              onOptionChange={handleOptionChange}
            />
          )}
          
          {/* Fallback: Show all variants when no specific options are found */}
          {!hasVariantOptions && data?.allVariants && (
            <FallbackVariants variants={data.allVariants} />
          )}

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
                    <RatingStars rating={processedProductData.rating} />
                    <span className="text-sm text-muted-foreground">Based on {processedProductData.reviews.toLocaleString()} reviews</span>
                  </div>
                  <Button variant="secondary">Write a review</Button>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>"Amazing camera quality and the 120Hz display is incredibly smooth. Best phone I've owned!"</p>
                  <p>"Battery easily lasts a full day even with heavy use. 5G speeds are impressive."</p>
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
      
      {/* Performance Monitor */}
      <PerformanceMonitor 
        pageName="Product Page" 
        onLoadComplete={(loadTime) => {
          console.log(`🎯 Product page performance: ${loadTime.toFixed(2)}ms`);
        }}
      />
    </div>
  );
}

// Helper function to get color hex values
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    // Basic colors
    'black': '#1a1a1a',
    'white': '#ffffff',
    'silver': '#e5e5e5',
    'gold': '#ffd700',
    'blue': '#1e40af',
    'red': '#dc2626',
    'green': '#16a34a',
    'purple': '#9333ea',
    'pink': '#ec4899',
    'orange': '#ea580c',
    'yellow': '#ca8a04',
    'gray': '#6b7280',
    'brown': '#92400e',
    
    // Extended colors
    'titanium': '#c0c0c0',
    'navy': '#000080',
    'maroon': '#800000',
    'teal': '#008080',
    'indigo': '#4b0082',
    'violet': '#8b00ff',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'cream': '#fffdd0',
    'beige': '#f5f5dc',
    'tan': '#d2b48c',
    'olive': '#808000',
    'lime': '#00ff00',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
    'plum': '#dda0dd',
    'coral': '#ff7f50',
    'salmon': '#fa8072',
    'peach': '#ffcba4',
    'mint': '#98ff98',
    'lavender': '#e6e6fa',
    'rose': '#ff007f',
    'amber': '#ffbf00',
    'emerald': '#50c878',
    'sapphire': '#0f52ba',
    'ruby': '#e0115f',
    'pearl': '#f0e68c',
    'champagne': '#f7e7ce',
    'bronze': '#cd7f32',
    'copper': '#b87333',
    'steel': '#4682b4',
    'charcoal': '#36454f',
    'ivory': '#fffff0',
    'khaki': '#c3b091',
    'turquoise': '#40e0d0',
    'crimson': '#dc143c',
    'azure': '#007fff',
    'lilac': '#c8a2c8',
    'jade': '#00a86b',
    'topaz': '#ffc87c',
    'garnet': '#733635',
    'opal': '#a8c3bc',
    'onyx': '#353839',
    'malachite': '#0bda51',
    'lapis': '#26619c',
    'obsidian': '#351e1e',
    'quartz': '#51414f',
    'diamond': '#b9f2ff',
    'crystal': '#a7d8de',
    'glass': '#e8f4f8',
    'mirror': '#c0c0c0',
    'chrome': '#e8f1f8',
    'brass': '#b5a642',
    'zinc': '#d4d4d4',
    'aluminum': '#a9a9a9',
    'platinum': '#e5e4e2',
    'palladium': '#ced0dd',
    'rhodium': '#e2e7e9',
    'iridium': '#3d3c3a',
    'osmium': '#9bc5c3',
    'ruthenium': '#c9b1b0',
    'rhenium': '#b1c4de',
    'tungsten': '#b4b4b4',
    'molybdenum': '#4b545c',
    'vanadium': '#a3a3a3',
    'chromium': '#8a9a5b',
    'manganese': '#8fce00',
    'iron': '#484848',
    'cobalt': '#0047ab',
    'nickel': '#727472',
    'sky blue': '#87ceeb',
    'turquoise green': '#40e0d0'
  };
  
  const normalizedColor = color.toLowerCase().replace(/\s+/g, '');
  return colorMap[normalizedColor] || '#6b7280'; // Default gray
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
