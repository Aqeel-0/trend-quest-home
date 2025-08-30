import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const thumbnailsToShow = 5;

  // Calculate if we can scroll left or right
  const canScrollLeft = thumbnailStart > 0;
  const canScrollRight = thumbnailStart + thumbnailsToShow < images.length;

  // Get visible thumbnails
  const visibleThumbnails = images.slice(thumbnailStart, thumbnailStart + thumbnailsToShow);

  const scrollLeft = () => {
    setThumbnailStart(Math.max(0, thumbnailStart - 1));
  };

  const scrollRight = () => {
    setThumbnailStart(Math.min(images.length - thumbnailsToShow, thumbnailStart + 1));
  };

  // Get the image to display in main section
  const mainImage = hoveredImage || images[current];

  // Get the index of the currently hovered or selected image
  const getCurrentIndex = () => {
    if (hoveredImage) {
      return images.indexOf(hoveredImage);
    }
    return current;
  };

  // Get the visual index for the current image within visible thumbnails
  const getVisualIndex = () => {
    const currentIndex = getCurrentIndex();
    return currentIndex - thumbnailStart;
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnails on the left with Flipkart-style navigation */}
      <div className="relative flex flex-col gap-2 sm:gap-3 w-20">
        {/* Left arrow (top) */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="h-8 w-full p-0 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
          </Button>
        )}

        {/* Thumbnail container with smooth scrolling */}
        <div className="relative overflow-hidden" style={{ height: `${thumbnailsToShow * 64 + (thumbnailsToShow - 1) * 8}px` }}>
          <ul 
            className="transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateY(-${thumbnailStart * 72}px)`,
              height: `${images.length * 72}px`
            }}
          >
            {images.map((src, idx) => {
              const isSelected = idx === current;
              const isHovered = src === hoveredImage;
              const isActive = isHovered || isSelected;
              
              return (
                <li 
                  key={src + idx} 
                  className="mb-2 last:mb-0"
                  style={{ height: '64px' }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrent(idx)}
                    onMouseEnter={() => setHoveredImage(src)}
                    onMouseLeave={() => setHoveredImage(null)}
                    className={cn(
                      "w-full h-full overflow-hidden rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                    )}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${alt} thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain bg-gray-50"
                      loading="lazy"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right arrow (bottom) */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="h-8 w-full p-0 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
        )}
      </div>

      {/* Main image on the right */}
      <div className="group overflow-hidden rounded-lg bg-muted/40 flex-1 max-w-md">
        <AspectRatio ratio={1}>
          <img
            src={mainImage}
            alt={alt}
            className="h-full w-full object-contain bg-gray-50 transition-all duration-300 group-hover:scale-105"
            loading="eager"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
