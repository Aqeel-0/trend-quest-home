import { useState, useMemo } from "react";
import { ProductVariantCard } from "@/components/ProductVariantCard";
import { 
  useProductVariantsWithListings, 
  sortProductVariants, 
  SORT_OPTIONS,
  ProductVariantWithListings 
} from "@/hooks/useProductVariantsWithListings";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Filter, Grid3X3, AlertCircle } from "lucide-react";

export const ProductVariantsPage = () => {
  const [sortBy, setSortBy] = useState("newest");
  
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useProductVariantsWithListings({ sortBy });

  // Flatten all pages and apply frontend sorting
  const allVariants = useMemo(() => {
    if (!data?.pages) return [];
    
    const flattened = data.pages.flat();
    return sortProductVariants(flattened, sortBy);
  }, [data?.pages, sortBy]);

  const handleVariantClick = (variant: ProductVariantWithListings) => {
    // TODO: Navigate to variant detail page or open modal
    console.log("Clicked variant:", variant);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  // Loading skeleton for initial load
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Variants</h1>
            <p className="text-gray-600 mt-1">
              Compare prices across multiple stores
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {allVariants.length} variant{allVariants.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            {allVariants.length > 0 && (
              <div className="text-sm text-gray-500">
                Total stores: {allVariants.reduce((sum, v) => sum + v.storeCount, 0)}
              </div>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load product variants. Please try again.
            {error?.message && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Error details</summary>
                <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : allVariants.length === 0 ? (
        <div className="text-center py-12">
          <Grid3X3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No product variants found
          </h3>
          <p className="text-gray-600 mb-4">
            There are currently no active product variants with listings available.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allVariants.map((variant) => (
              <ProductVariantCard
                key={variant.id}
                variant={variant}
                onClick={handleVariantClick}
              />
            ))}
          </div>

          {/* Load More Section */}
          <div className="flex flex-col items-center gap-4 py-8">
            {hasNextPage ? (
              <Button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                size="lg"
                className="min-w-48"
              >
                {isFetchingNextPage ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More Products"
                )}
              </Button>
            ) : allVariants.length > 0 ? (
              <div className="text-center text-gray-500 space-y-2">
                <p className="text-sm">You've seen all available products</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Back to Top
                </Button>
              </div>
            ) : null}
            
            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={`loading-${index}`} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
