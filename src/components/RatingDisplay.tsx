import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  reviews?: number;
  className?: string;
}

export default function RatingDisplay({ rating, reviews, className }: RatingDisplayProps) {
  if (rating <= 0) return null;
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviews != null && reviews > 0 && (
        <span className="text-muted-foreground/70">({reviews.toLocaleString()})</span>
      )}
    </div>
  );
}
