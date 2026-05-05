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
  const thumbnailsToShow = 5; // Show 5 thumbnails at once

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
    <div className="flex gap-4 mt-[30px]">
      {/* Thumbnails on the left with Flipkart-style navigation */}
      <div className="relative flex flex-col items-center w-24">
        {/* Top arrow container */}
        <div className="w-20 h-8 mb-2 flex items-center justify-center">
          {canScrollLeft && (
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="h-8 w-8 p-0 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm flex items-center justify-center"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="h-4 w-4 rotate-90 text-black" />
            </Button>
          )}
        </div>

        {/* Thumbnail container with smooth scrolling */}
        <div className="relative overflow-hidden w-20" style={{ height: `${thumbnailsToShow * 90 + (thumbnailsToShow - 1) * 8}px` }}>
          <ul 
            className="transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateY(-${thumbnailStart * 98}px)`,
              height: `${images.length * 98}px`
            }}
          >
            {images.map((src, idx) => {
              const isSelected = idx === current;
              const isHovered = src === hoveredImage;
              const isActive = isHovered || isSelected;
              
              return (
                <li 
                  key={src + idx} 
                  className="last:mb-0"
                  style={{ width: '80px', height: '90px', margin: '0 auto 8px' }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrent(idx)}
                    onMouseEnter={() => setHoveredImage(src)}
                    onMouseLeave={() => setHoveredImage(null)}
                    className={cn(
                      "w-full h-full overflow-hidden rounded-md border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive
                        ? "border-blue-500 ring-0"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${alt} thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain bg-gray-50 p-1"
                      loading="lazy"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom arrow container */}
        <div className="w-20 h-8 mt-2 flex items-center justify-center">
          {canScrollRight && (
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="h-8 w-8 p-0 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm flex items-center justify-center"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="h-4 w-4 rotate-90 text-black" />
            </Button>
          )}
        </div>
      </div>

      {/* Main image on the right */}
      <div className="group overflow-hidden rounded-lg bg-white flex-1 max-w-md shadow-sm">
        <AspectRatio ratio={1}>
          <img
            src={mainImage}
            alt={alt}
            className="h-full w-full object-contain bg-gray-50 transition-all duration-300 group-hover:scale-105 mt-7"
            loading="eager"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
