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

// Enhanced Types for E-commerce Features
interface StorePrice {
  storeName: string;
  price: number;
  currency: string;
}

interface CategoryProduct {
  id: string;
  title: string;
  image: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  lowestPrice: number;
  // Enhanced store data
  topStores: StorePrice[];
  otherStoresCount: number;
  rating: number; // 1-5
  available: boolean;
  shopsCount: number;
  currency: string;
  // Filter properties
  ram?: string | null;
  storage?: string | null;
  network?: string | null;
  originalVariant?: any;
  // E-commerce enhancements
  isOnSale: boolean;
  originalPrice?: number;
  discountPercentage: number;
}

const storeColor: Record<string, string> = {
  NovaMart: "bg-accent",
  PriceHub: "bg-secondary",
  QuickBuy: "bg-muted",
  Shoply: "bg-secondary",
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();

// Removed ALL_BRANDS constant - now dynamically extracted from data
import { useProductVariantsByCategory, useSmartphoneVariantsTotalCount as useProductVariantsTotalCount, sortProductVariants, ProductVariantWithListings } from "@/hooks/useProductVariantsWithListings";

// Helpers
const toTitle = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatIndianRupee = (amount: number) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

// Enhanced Product Card with E-commerce Best Practices
const CategoryProductCard: React.FC<{ product: CategoryProduct; onQuickView: (p: CategoryProduct) => void; }> = ({ product, onQuickView }) => {
  
  const formatPrice = (amount: number) => {
    try {
      // Format as Indian Rupee with proper comma separation
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };
  
  return (
            <Link to={`/product/${product.id}`} className="block">
        <Card className="group overflow-hidden bg-card border-2 border-border/40 hover:border-border/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-600/60 dark:hover:border-gray-500 dark:hover:bg-gray-900/80 h-full flex flex-col">
        {/* Image Section - Optimized for Perfect Display */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 dark:from-muted/40 dark:to-muted/60 p-3">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Sale Badge */}
          {product.isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              -{product.discountPercentage}% OFF
            </div>
          )}
          
          
          
          {/* Quick View */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
            >
              Quick View
            </Button>
          </div>
        </div>
        
        {/* Content Section - Optimized for 4-card layout */}
        <CardContent className="p-4 space-y-1.5 flex-1 flex flex-col">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40"
                  )}
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          </div>
          
          {/* Product Title - Optimized for 4-card grid */}
          <div className="flex-grow">
            <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 min-h-[1.8rem] capitalize-first">
              {product.title.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
          </div>
          
          {/* Specifications */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.ram && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700/50">
                {product.ram}
              </Badge>
            )}
            {product.storage && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-700/50">
                {product.storage}
              </Badge>
            )}
            {product.network && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700/50">
                {product.network}
              </Badge>
            )}
          </div>
          
          {/* Price Section - Show only lowest price prominently */}
          <div className="space-y-1 mt-auto">
            {/* Lowest Price Display */}
            <div className="flex flex-col">
              <div className="text-lg font-bold text-foreground">
                {formatPrice(product.lowestPrice)}
              </div>
              {/* Store Availability */}
              <div className="text-sm text-muted-foreground mt-1">
                {`Available in ${product.shopsCount} store${product.shopsCount > 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
          
          {/* Store & Availability */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {product.shopsCount > 1 ? `${product.shopsCount} stores` : `at ${product.topStores[0]?.storeName || 'Unknown'}`}
              </span>
            </div>
            
            {product.available ? (
              <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-600/50 dark:bg-green-950/50">
                ✓ In Stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50">
                Out of Stock
              </Badge>
            )}
          </div>
          
          
        </CardContent>
      </Card>
    </Link>
  );
};

const Category: React.FC = () => {
  const { slug } = useParams();
  const { toast } = useToast();

  const categoryName = useMemo(() => toTitle(slug ?? "Category"), [slug]);
  
  // Enhanced Filter State with E-commerce Best Practices
  const [price, setPrice] = useState<[number, number]>([0, 200000]); // Increased for high-end phones
  const [brands, setBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedRam, setSelectedRam] = useState<string>(""); // Single select
  const [selectedStorage, setSelectedStorage] = useState<string>(""); // Single select
  const [selectedNetwork, setSelectedNetwork] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("popular");
  
  // Will define filterOptions after categoryProducts
  
  const {
    data,
    allVariants: allStoredVariants,
    displayedVariants,
    displayedCount,
    totalCount: loadedCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    resetToFirst20,
  } = useProductVariantsByCategory(slug ?? "", sort);
  const { data: totalVariantsCount } = useProductVariantsTotalCount(slug);
  // Use all stored variants for filtering (not just displayed ones)
  const allVariants = useMemo(() => {
    return allStoredVariants || [];
  }, [allStoredVariants]);

  // Convert variants to CategoryProduct format with enhanced data
  const categoryProducts: CategoryProduct[] = useMemo(() => {
    const fallbackImages = [imgHeadphones, imgSneakers, imgWatch, imgLaptop, imgController, imgCoffee];
    
    return allVariants.map((variant, index) => {
      // Debug: Log the raw variant data
      console.log(`🔍 Variant ${index + 1}:`, {
        id: variant.id,
        name: variant.name,
        storeCount: variant.storeCount,
        listings: variant.listings,
        minPrice: variant.minPrice,
        secondMinPrice: variant.secondMinPrice
      });
      
      // Process listings to get top 2 stores with prices
      const sortedListings = variant.listings
        ?.sort((a, b) => a.price - b.price)
        .slice(0, 2) || [];
      
      console.log(`📊 Sorted listings for ${variant.name}:`, sortedListings);
      
      const topStores: StorePrice[] = sortedListings.map(listing => ({
        storeName: listing.store_name,
        price: listing.price,
        currency: listing.currency
      }));
      
      console.log(`🏪 Top stores for ${variant.name}:`, topStores);
      
      const currency = topStores[0]?.currency || 'INR';
      const otherStoresCount = Math.max(0, variant.storeCount - topStores.length);
      
      return {
        id: variant.id,
        title: variant.name,
        image: variant.primaryImage || fallbackImages[index % fallbackImages.length],
        brand: variant.brand?.name || 'Various',
        priceMin: variant.minPrice,
        priceMax: variant.secondMinPrice || variant.minPrice,
        lowestPrice: variant.minPrice,
        // Enhanced store data
        topStores,
        otherStoresCount,
        rating: variant.avgRating || 4.0,
        available: variant.storeCount > 0,
        shopsCount: variant.storeCount,
        currency: currency,
        // Enhanced filter properties
        ram: variant.attributes?.ram_gb ? `${variant.attributes.ram_gb}GB` : null,
        storage: variant.attributes?.storage_gb ? `${variant.attributes.storage_gb}GB` : null,
        network: variant.name?.includes('5g') ? '5G' : variant.name?.includes('4g') ? '4G' : null,
        originalVariant: variant,
        // E-commerce enhancements
        isOnSale: variant.listings?.some(l => l.discount_percentage > 0) || false,
        originalPrice: sortedListings[0]?.original_price,
        discountPercentage: sortedListings[0]?.discount_percentage || 0,
      };
    });
  }, [allVariants]);

  // Extract filter options from data
  const filterOptions = useMemo(() => {
    const rams = new Set<string>();
    const storages = new Set<string>();
    const networks = new Set<string>();
    const brandsSet = new Set<string>();
    
    categoryProducts.forEach(product => {
      if (product.ram) rams.add(product.ram);
      if (product.storage) storages.add(product.storage);
      if (product.network) networks.add(product.network);
      if (product.brand && product.brand !== 'Various') {
        brandsSet.add(product.brand);
      }
    });
    
    return {
      rams: Array.from(rams).sort((a, b) => parseInt(a) - parseInt(b)),
      storages: Array.from(storages).sort((a, b) => parseInt(a) - parseInt(b)),
      networks: Array.from(networks).sort(),
      brands: Array.from(brandsSet).sort(),
    };
  }, [categoryProducts]);

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

  // This useEffect is no longer needed since we removed the visible state

  const filtered = useMemo(() => {
    let list = [...categoryProducts];

    // Price filter
    list = list.filter((p) => p.priceMin >= price[0] && p.priceMax <= price[1]);
    
    // Brand filter using real brand data
    if (brands.length) {
      list = list.filter((p) => brands.includes(p.brand));
    }
    
    // Rating filter
    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }
    
    // Stock availability filter
    if (inStockOnly) {
      list = list.filter((p) => p.available);
    }
    
    // RAM filter (single select)
    if (selectedRam) {
      list = list.filter((p) => p.ram === selectedRam);
    }
    
    // Storage filter (single select)
    if (selectedStorage) {
      list = list.filter((p) => p.storage === selectedStorage);
    }
    
    // Network filter
    if (selectedNetwork.length > 0) {
      list = list.filter((p) => p.network && selectedNetwork.includes(p.network));
    }

    // Sorting
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.originalVariant?.created_at || 0).getTime() - new Date(a.originalVariant?.created_at || 0).getTime());
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        list.sort((a, b) => (b.originalVariant?.totalReviews || 0) - (a.originalVariant?.totalReviews || 0));
        break;
      case "stores":
        list.sort((a, b) => b.shopsCount - a.shopsCount);
        break;
      default:
        // popular - sort by rating then lowest price
        list.sort((a, b) => b.rating - a.rating || a.lowestPrice - b.lowestPrice);
    }

    return list;
  }, [brands, inStockOnly, minRating, price, selectedRam, selectedStorage, selectedNetwork, sort, categoryProducts]);

  // Get visible products (first N filtered results for display)
  const [visibleCount, setVisibleCount] = useState(20);
  const visibleProducts = filtered.slice(0, visibleCount);

  // When filters change, reset visible count and go back to first 20
  useEffect(() => {
    setVisibleCount(20);
  }, [brands, inStockOnly, minRating, price, selectedRam, selectedStorage, selectedNetwork, sort]);

  const onQuickView = (p: CategoryProduct) => {
    const storeName = p.topStores[0]?.storeName || 'Unknown store';
    toast({ title: p.title, description: `${formatIndianRupee(p.lowestPrice)} at ${storeName}` });
  };

  // Load more function for client-side pagination
  const loadMoreFiltered = () => {
    const newCount = Math.min(visibleCount + 20, filtered.length);
    setVisibleCount(newCount);
  };

  const hasMoreFiltered = visibleCount < filtered.length;

  // Enhanced Sidebar filters
  const Filters = (
    <div className="space-y-4 p-2">
      <Accordion type="multiple" className="w-full" defaultValue={["price", "availability"]}>
        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-3">
              <Slider 
                value={price} 
                onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} 
                min={0} 
                max={200000} 
                step={5000} 
                className="mt-2" 
              />
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>{formatIndianRupee(price[0])}</span>
                <span>{formatIndianRupee(price[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* RAM Filter - Multiple Select with Checkboxes */}
        {filterOptions.rams.length > 0 && (
          <AccordionItem value="ram">
            <AccordionTrigger>RAM</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {filterOptions.rams.map((ram) => (
                  <div key={ram} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200",
                        selectedRam === ram
                          ? "border-primary bg-primary"
                          : "border-muted-foreground hover:border-foreground"
                      )}
                      onClick={() => {
                        setSelectedRam(selectedRam === ram ? "" : ram);
                      }}
                    >
                      {selectedRam === ram && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Label
                      className={cn(
                        "cursor-pointer text-sm font-medium transition-colors duration-200",
                        selectedRam === ram
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => {
                        setSelectedRam(selectedRam === ram ? "" : ram);
                      }}
                    >
                      {ram}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Storage Filter - Multiple Select with Checkboxes */}
        {filterOptions.storages.length > 0 && (
          <AccordionItem value="storage">
            <AccordionTrigger>Storage</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {filterOptions.storages.map((storage) => (
                  <div key={storage} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200",
                        selectedStorage === storage
                          ? "border-primary bg-primary"
                          : "border-muted-foreground hover:border-foreground"
                      )}
                      onClick={() => {
                        setSelectedStorage(selectedStorage === storage ? "" : storage);
                      }}
                    >
                      {selectedStorage === storage && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Label
                      className={cn(
                        "cursor-pointer text-sm font-medium transition-colors duration-200",
                        selectedStorage === storage
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => {
                        setSelectedStorage(selectedStorage === storage ? "" : storage);
                      }}
                    >
                      {storage}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Network Filter */}
        {filterOptions.networks.length > 0 && (
          <AccordionItem value="network">
            <AccordionTrigger>Network</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-2">
                {filterOptions.networks.map((network) => (
                  <Label key={network} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedNetwork.includes(network)}
                      onCheckedChange={(c) =>
                        setSelectedNetwork((prev) => (c ? [...prev, network] : prev.filter((x) => x !== network)))
                      }
                    />
                    {network}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Brand Filter */}
        {filterOptions.brands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger>Brands</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {filterOptions.brands.map((brand) => (
                  <Label key={brand} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={brands.includes(brand)}
                      onCheckedChange={(c) =>
                        setBrands((prev) => (c ? [...prev, brand] : prev.filter((x) => x !== brand)))
                      }
                    />
                    {brand}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Rating Filter */}
        <AccordionItem value="rating">
          <AccordionTrigger>Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {[0, 3, 4, 4.5, 5].map((r) => (
                <Button 
                  key={r} 
                  variant={minRating === r ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setMinRating(r)}
                  className="text-xs"
                >
                  {r === 0 ? "Any" : `${r}+ ⭐`}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="in-stock" className="text-sm">In stock only</Label>
              <Switch id="in-stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Clear Filters */}
        <AccordionItem value="clear">
          <AccordionTrigger>Clear Filters</AccordionTrigger>
          <AccordionContent>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setPrice([0, 200000]);
                setBrands([]);
                setMinRating(0);
                setInStockOnly(false);
                setSelectedRam("");
                setSelectedStorage("");
                setSelectedNetwork([]);
                setVisibleCount(20); // Reset visible count when clearing filters
              }}
              className="w-full"
            >
              Reset All Filters
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden dark:border-gray-700/50">
                <div className="aspect-[4/3] bg-muted animate-pulse dark:bg-muted/50" />
                <div className="p-4 space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted animate-pulse rounded w-12 dark:bg-muted/50" />
                    <div className="h-3 bg-muted animate-pulse rounded w-8 dark:bg-muted/50" />
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded dark:bg-muted/50" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4 dark:bg-muted/50" />
                  <div className="flex gap-1">
                    <div className="h-5 bg-muted animate-pulse rounded w-10 dark:bg-muted/50" />
                    <div className="h-5 bg-muted animate-pulse rounded w-12 dark:bg-muted/50" />
                  </div>
                  <div className="h-6 bg-muted animate-pulse rounded w-16 dark:bg-muted/50" />
                  <div className="h-8 bg-muted animate-pulse rounded w-full dark:bg-muted/50" />
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
          <p className="text-muted-foreground mt-2">
            {isLoading
              ? "Loading products..."
              : `Showing ${visibleProducts.length} of ${filtered.length} results ${totalVariantsCount !== undefined ? `(${totalVariantsCount} total in ${categoryName})` : ''}`
            }
          </p>
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
                <SheetContent side="left" className="w-96">
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
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rating</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="stores">Most Stores</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8 max-w-none">
          {/* Sidebar - Wider */}
          <aside className="hidden lg:block w-52 shrink-0">
            {Filters}
          </aside>

          {/* Products - Wider Section */}
          <section className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
              {visibleProducts.map((p) => (
                <CategoryProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>

            {/* Client-side Load More Button */}
            <div className="mt-8">
              {hasMoreFiltered && (
                <div className="flex justify-center">
                  <Button
                    variant="default"
                    onClick={loadMoreFiltered}
                    disabled={isFetchingNextPage}
                    className="px-8 py-3 text-base font-medium transition-all duration-200 hover:opacity-90"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more..."}
                  </Button>
                </div>
              )}
              
              {/* End of results message */}
              {!hasMoreFiltered && filtered.length > 0 && (
                <div className="text-center text-muted-foreground space-y-2">
                  <p className="text-sm">✨ You've seen all {filtered.length} products matching your filters</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Back to Top ↑
                  </Button>
                </div>
              )}

              {/* No results message */}
              {filtered.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground space-y-2">
                  <p className="text-sm">No products match your current filters</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setPrice([0, 200000]);
                      setBrands([]);
                      setMinRating(0);
                      setInStockOnly(false);
                      setSelectedRam("");
                      setSelectedStorage("");
                      setSelectedNetwork([]);
                      setVisibleCount(20);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Category;
