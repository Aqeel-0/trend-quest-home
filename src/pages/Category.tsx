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
}

const storeColor: Record<string, string> = {
  NovaMart: "bg-accent",
  PriceHub: "bg-secondary",
  QuickBuy: "bg-muted",
  Shoply: "bg-secondary",
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();

const ALL_BRANDS = ["Acme", "Orion", "Zenith", "Pulse", "Nimbus"] as const;

// Mock data for demo
const MOCK_PRODUCTS: CategoryProduct[] = [
  { id: "1", title: "Acme Nova Smartphone X", image: imgSneakers, brand: "Acme", priceMin: 699, priceMax: 799, lowestPrice: 699, store: "NovaMart", rating: 4.5, available: true },
  { id: "2", title: "Orion Ultra Laptop 14\"", image: imgLaptop, brand: "Orion", priceMin: 999, priceMax: 1299, lowestPrice: 999, store: "PriceHub", rating: 4.2, available: true },
  { id: "3", title: "Zenith NoiseCancel Headphones", image: imgHeadphones, brand: "Zenith", priceMin: 149, priceMax: 199, lowestPrice: 149, store: "QuickBuy", rating: 4.7, available: true },
  { id: "4", title: "Pulse Action Game Controller", image: imgController, brand: "Pulse", priceMin: 49, priceMax: 79, lowestPrice: 49, store: "Shoply", rating: 4.0, available: false },
  { id: "5", title: "Nimbus Smartwatch Pro", image: imgWatch, brand: "Nimbus", priceMin: 199, priceMax: 249, lowestPrice: 199, store: "NovaMart", rating: 4.3, available: true },
  { id: "6", title: "Acme Barista Coffee Maker", image: imgCoffee, brand: "Acme", priceMin: 89, priceMax: 129, lowestPrice: 89, store: "PriceHub", rating: 3.9, available: true },
];

// Helpers
const currency = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
const toTitle = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryProductCard: React.FC<{ product: CategoryProduct; onQuickView: (p: CategoryProduct) => void; }> = ({ product, onQuickView }) => {
  return (
    <Card className="group relative overflow-hidden shadow-subtle transition-shadow hover:shadow-elevated">
      <div className="aspect-[4/3] bg-muted/40 overflow-hidden">
        <img src={product.image} alt={`${product.title} product image`} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight line-clamp-2">{product.title}</h3>
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", storeColor[product.store] ?? "bg-muted")} aria-label={`Store ${product.store}`}>
            {initials(product.store)}
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-sm text-muted-foreground">Price range</div>
          <div className="text-lg font-semibold">{currency(product.priceMin)} – {currency(product.priceMax)}</div>
          <div className="text-xs text-muted-foreground">Lowest at <span className="font-medium text-foreground">{product.store}</span></div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm" aria-label={`Rating ${product.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("h-4 w-4", i + 1 <= Math.round(product.rating) ? "text-primary" : "text-muted-foreground")} />
            ))}
          </div>
          <Badge variant="secondary">{currency(product.lowestPrice)}</Badge>
        </div>
      </CardContent>
      <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="sm" variant="secondary" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.title}`}>
          Quick view
        </Button>
      </div>
    </Card>
  );
};

const Category: React.FC = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  const categoryName = useMemo(() => toTitle(slug ?? "Category"), [slug]);

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
    let list = [...MOCK_PRODUCTS];

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
  }, [brands, inStockOnly, minRating, price, sort]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
