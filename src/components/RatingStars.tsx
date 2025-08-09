import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number; // 0 - 5
  className?: string;
  size?: number;
  ariaLabel?: string;
};

export default function RatingStars({ rating, className, size = 16, ariaLabel }: RatingStarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5; // reserved if you later add a Half star icon

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={ariaLabel ?? `Rating ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <Star
            key={i}
            className={cn("h-4 w-4", filled ? "text-primary" : "text-muted-foreground")}
            strokeWidth={2}
            // Use fill for filled state while keeping stroke for outline
            fill={filled ? "currentColor" : "transparent"}
            width={size}
            height={size}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

