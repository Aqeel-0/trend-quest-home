import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex gap-4">
      {/* Thumbnails on the left */}
      <div className="flex flex-col gap-2 sm:gap-3 w-20">
        {images.map((src, idx) => (
          <button
            key={src + idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={cn(
              "overflow-hidden rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              idx === current
                ? "ring-2 ring-primary border-transparent"
                : "border-transparent hover:border-accent"
            )}
            aria-label={`Show image ${idx + 1}`}
          >
            <AspectRatio ratio={1}>
              <img
                src={src}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </AspectRatio>
          </button>
        ))}
      </div>

      {/* Main image on the right */}
      <div className="group overflow-hidden rounded-lg bg-muted/40 flex-1 max-w-md">
        <AspectRatio ratio={1}>
          <img
            src={images[current]}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="eager"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
