import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fallback images
import headphones from "@/assets/prod-headphones.jpg";
import sneakers from "@/assets/prod-sneakers.jpg";
import watch from "@/assets/prod-watch.jpg";
import laptop from "@/assets/prod-laptop.jpg";
import coffee from "@/assets/prod-coffeemaker.jpg";
import controller from "@/assets/prod-controller.jpg";

const fallbackImages = [headphones, sneakers, watch, laptop, coffee, controller];

export type Product = {
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
};

const storeColor: Record<string, string> = {
  NovaMart: "bg-accent",
  PriceHub: "bg-secondary",
  QuickBuy: "bg-muted",
  Shoply: "bg-secondary",
};

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase();

const ProductCard = ({ product }: { product: Product }) => {
  // Handle image URL - ensure it's a valid URL or fallback
  const fallbackImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  const imageUrl = product.image?.startsWith('http') ? product.image : fallbackImage;
  
  return (
    <Card className="overflow-hidden hover-scale shadow-subtle hover:shadow-elevated transition-shadow h-full flex flex-col">
      <div className="aspect-[4/3] bg-muted/40 relative">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={imageUrl} 
            alt={`${product.title} product image`} 
            className="h-full w-auto object-scale-down" 
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
                target.className = 'h-full w-auto object-scale-down';
                target.style.maxWidth = '100%';
                target.style.maxHeight = '100%';
              }
            }}
          />
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-medium leading-tight line-clamp-2">{product.title}</h3>
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
          )}
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-semibold">{product.lowestPrice}</div>
              {product.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {product.originalPrice}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="whitespace-nowrap">
              {product.store}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
