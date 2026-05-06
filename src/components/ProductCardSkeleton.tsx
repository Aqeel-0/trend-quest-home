interface ProductCardSkeletonProps {
  variant?: "carousel" | "grid";
}

export default function ProductCardSkeleton({ variant = "grid" }: ProductCardSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div
        className={`animate-pulse bg-muted/60 ${
          variant === "carousel" ? "aspect-[4/5]" : "aspect-square"
        }`}
      />
      <div className="space-y-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-muted/60" />
        <div className="h-4 animate-pulse rounded bg-muted/60" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted/60 mt-2" />
      </div>
    </div>
  );
}
