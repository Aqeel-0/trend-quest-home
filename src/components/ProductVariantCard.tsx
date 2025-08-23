import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Store, ShoppingCart } from "lucide-react";
import { ProductVariantWithListings, formatPrice } from "@/hooks/useProductVariantsWithListings";
import { Button } from "@/components/ui/button";

interface ProductVariantCardProps {
  variant: ProductVariantWithListings;
  onClick?: (variant: ProductVariantWithListings) => void;
}

export const ProductVariantCard = ({ variant, onClick }: ProductVariantCardProps) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(variant);
    }
  };

  // Get the primary currency from the first listing
  const primaryCurrency = variant.listings[0]?.currency || "INR";

  // Format the two minimum prices
  const minPriceFormatted = formatPrice(variant.minPrice, primaryCurrency);
  const secondMinPriceFormatted = variant.secondMinPrice 
    ? formatPrice(variant.secondMinPrice, primaryCurrency)
    : null;

  // Determine stock status for display
  const inStockListings = variant.listings.filter(l => l.stock_status === "in_stock").length;
  const stockStatus = inStockListings > 0 ? "In Stock" : "Limited Stock";
  const stockStatusColor = inStockListings > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border border-gray-200 hover:border-blue-300"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-50">
          {variant.primaryImage ? (
            <img
              src={variant.primaryImage}
              alt={variant.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg"; // Fallback image
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Stock Status Badge */}
          <Badge 
            className={`absolute top-2 right-2 text-xs ${stockStatusColor}`}
          >
            {stockStatus}
          </Badge>
          
          {/* Store Count Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 text-xs bg-blue-100 text-blue-800"
          >
            <Store className="h-3 w-3 mr-1" />
            {variant.storeCount} store{variant.storeCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {variant.name}
            </h3>
            {variant.sku && (
              <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
            )}
          </div>

          {/* Rating and Reviews */}
          {variant.avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">
                  {variant.avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({variant.totalReviews.toLocaleString()} review{variant.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Best Price:</span>
              <span className="text-lg font-bold text-green-600">
                {minPriceFormatted}
              </span>
            </div>
            
            {secondMinPriceFormatted && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">2nd Best:</span>
                <span className="text-sm font-medium text-gray-700">
                  {secondMinPriceFormatted}
                </span>
              </div>
            )}
          </div>

          {/* Attributes Preview */}
          {variant.attributes && typeof variant.attributes === 'object' && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(variant.attributes)
                .slice(0, 2) // Show only first 2 attributes
                .map(([key, value]) => (
                  <Badge 
                    key={key} 
                    variant="outline" 
                    className="text-xs px-2 py-1"
                  >
                    {String(value)}
                  </Badge>
                ))}
              {Object.keys(variant.attributes).length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{Object.keys(variant.attributes).length - 2} more
                </Badge>
              )}
            </div>
          )}

          {/* Compare Prices Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs mt-3 group-hover:bg-blue-50 group-hover:border-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Compare {variant.storeCount} Price{variant.storeCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
