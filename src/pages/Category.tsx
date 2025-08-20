import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Star, Filter } from "lucide-react";
import imgHeadphones from "@/assets/prod-headphones.jpg";
import imgSneakers from "@/assets/prod-sneakers.jpg";
import imgWatch from "@/assets/prod-watch.jpg";
import imgLaptop from "@/assets/prod-laptop.jpg";
import imgController from "@/assets/prod-controller.jpg";
import imgCoffee from "@/assets/prod-coffeemaker.jpg";

// Types
interface CategoryProduct {
  id: string;
  title: string;
  image: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  lowestPrice: number;
  store: string;
  rating: number; // 1-5
  available: boolean;
  shopsCount: number;
}

const storeColor: Record<string, string> = {
  NovaMart: "bg-accent",
  PriceHub: "bg-secondary",
  QuickBuy: "bg-muted",
  Shoply: "bg-secondary",
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();

const ALL_BRANDS = ["Acme", "Orion", "Zenith", "Pulse", "Nimbus"] as const;

import { useProductsByCategory } from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/currency";

// Helpers
const currency = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
const toTitle = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryProductCard: React.FC<{ product: CategoryProduct; onQuickView: (p: CategoryProduct) => void; }> = ({ product, onQuickView }) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <Card className="group relative overflow-hidden shadow-subtle transition-shadow hover:shadow-elevated h-full flex flex-col">
        <div className="aspect-[3/2] bg-muted/40 overflow-hidden">
          <img src={product.image} alt={`${product.title} product image`} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-medium leading-tight line-clamp-2 mb-2">{product.title}</h3>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-primary">{currency(product.lowestPrice)}</div>
              <div className="text-xs text-muted-foreground">Available in {product.shopsCount} shops</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm" aria-label={`Rating ${product.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3 w-3", i + 1 <= Math.round(product.rating) ? "text-primary" : "text-muted-foreground")} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
            </div>
            <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", storeColor[product.store] ?? "bg-muted")} aria-label={`Store ${product.store}`}>
              {initials(product.store)}
            </span>
          </div>
        </CardContent>
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }} 
            aria-label={`Quick view ${product.title}`}
          >
            Quick view
          </Button>
        </div>
      </Card>
    </Link>
  );
};

const Category: React.FC = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  const categoryName = useMemo(() => toTitle(slug ?? "Category"), [slug]);
  const { data: products, isLoading } = useProductsByCategory(slug ?? "");

  // Convert Supabase products to CategoryProduct format
  const categoryProducts: CategoryProduct[] = useMemo(() => {
    if (!products) return [];
    
    const fallbackImages = [imgHeadphones, imgSneakers, imgWatch, imgLaptop, imgController, imgCoffee];
    
    return products.map((product, index) => ({
      id: product.id,
      title: product.model_name,
      image: fallbackImages[index % fallbackImages.length],
      brand: product.brands.name,
      priceMin: product.min_price || 0,
      priceMax: product.max_price || product.min_price || 0,
      lowestPrice: product.min_price || 0,
      store: "Multiple stores",
      rating: product.rating || 4.0,
      available: product.is_active,
      shopsCount: Math.floor(Math.random() * 15) + 1, // Random for demo
    }));
  }, [products]);

  // SEO updates
  useEffect(() => {
    const title = `${categoryName} Deals – Compare Prices`;
    const description = `Browse ${categoryName} across stores. Filter by price, brand, rating, and availability to find the best deals.`;
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMeta("description", description);

    // canonical
    let link = document.querySelector("link[rel=canonical]") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", window.location.href);

    // Breadcrumb structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin + "/" },
        { "@type": "ListItem", "position": 2, "name": categoryName, "item": window.location.href }
      ]
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [categoryName]);

  // Filter State
  const [price, setPrice] = useState<[number, number]>([0, 1500]);
  const [brands, setBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("popular");
  const [visible, setVisible] = useState<number>(6);

  const filtered = useMemo(() => {
    let list = [...categoryProducts];

    list = list.filter((p) => p.priceMin >= price[0] && p.priceMax <= price[1]);
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => p.available);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case "newest":
        list.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        // popular - sort by rating then lowest price
        list.sort((a, b) => b.rating - a.rating || a.lowestPrice - b.lowestPrice);
    }

    return list;
  }, [brands, inStockOnly, minRating, price, sort, categoryProducts]);

  const onQuickView = (p: CategoryProduct) => {
    toast({ title: p.title, description: `${currency(p.lowestPrice)} at ${p.store}` });
  };

  // Sidebar filters (Accordion)
  const Filters = (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-3">
              <Slider value={price} onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} min={0} max={1500} step={10} className="mt-2" />
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>{currency(price[0])}</span>
                <span>{currency(price[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {ALL_BRANDS.map((b) => (
                <Label key={b} className="flex items-center gap-3">
                  <Checkbox
                    checked={brands.includes(b)}
                    onCheckedChange={(c) =>
                      setBrands((prev) => (c ? [...prev, b] : prev.filter((x) => x !== b)))
                    }
                  />
                  {b}
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Minimum rating</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {[0, 3, 4, 5].map((r) => (
                <Button key={r} variant={minRating === r ? "secondary" : "outline"} size="sm" onClick={() => setMinRating(r)}>
                  {r === 0 ? "Any" : `${r}+`}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="in-stock">In stock only</Label>
              <Switch id="in-stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const visibleProducts = filtered.slice(0, visible);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-background">
          <div className="container py-6">
            <div className="h-4 bg-muted animate-pulse rounded w-40 mb-4" />
            <div className="h-8 bg-muted animate-pulse rounded w-60" />
          </div>
        </header>
        <main className="container py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="aspect-[3/2] bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-6 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="container py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-2xl md:text-3xl font-semibold">{categoryName}</h1>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">{filtered.length} results</div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {Filters}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            {Filters}
          </aside>

          {/* Products */}
          <section className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {visibleProducts.map((p) => (
                <CategoryProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>

            {visible < filtered.length && (
              <div className="mt-8 flex justify-center">
                <Button variant="secondary" onClick={() => setVisible((v) => v + 6)}>Load more</Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Category;
