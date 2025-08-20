"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ImageSlider } from "./image-slider";

export function ImageGrid({ imageUrls }: { imageUrls: (string | null)[] }) {
  const [imageSliderImageIndex, setImageSliderImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const handleImageError = (index: number) => {
    // Remove failed image from the list
    console.warn(`Failed to load image at index ${index}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-foreground text-lg font-medium">Images</h3>

      {imageUrls.length > 0 ? (
        <>
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              {!loadedImages.has(0) && (
                <div className="bg-muted absolute inset-0 animate-pulse rounded-xl" />
              )}
              <Image
                onClick={() => setImageSliderImageIndex(0)}
                src={imageUrls[0] || ""}
                alt="memory-preview"
                width={400}
                height={300}
                className={`h-[300px] w-full cursor-pointer rounded-xl border object-cover shadow-md transition-all hover:scale-[1.02] hover:shadow-lg lg:h-[400px] ${
                  loadedImages.has(0) ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectFit: "cover" }}
                loading="lazy"
                onLoad={() => handleImageLoad(0)}
                onError={() => handleImageError(0)}
              />
            </div>

            {/* Thumbnail Grid under main image*/}
            <div className="flex w-full justify-center gap-3">
              {imageUrls.slice(1, 3).map((url, i) => {
                if (!url) return null;
                const imageIndex = i + 1;

                return (
                  <div key={i} className="max-w-1/2 flex-1">
                    {!loadedImages.has(imageIndex) && (
                      <div className="bg-muted absolute inset-0 flex-1 animate-pulse rounded-lg" />
                    )}

                    <img
                      onClick={() => setImageSliderImageIndex(imageIndex)}
                      src={url}
                      alt={`memory-preview-${i}`}
                      className={`h-[120px] w-full cursor-pointer rounded-lg border object-cover shadow-sm transition-all hover:scale-105 hover:shadow-md ${
                        loadedImages.has(imageIndex) ? "opacity-100" : "opacity-0"
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(imageIndex)}
                      onError={() => handleImageError(imageIndex)}
                    />
                  </div>
                );
              })}

              {imageUrls.length > 4 && (
                <div
                  onClick={() => setImageSliderImageIndex(4)}
                  className="bg-muted/50 flex h-[120px] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border transition-all hover:scale-105 hover:shadow-md"
                >
                  <Images className="mx-auto h-6 w-6 text-white" />
                  <p className="text-xs font-medium text-white">+{imageUrls.length - 3} more</p>
                </div>
              )}
            </div>
          </div>

          <ImageSlider
            imageSliderImageIndex={imageSliderImageIndex}
            setImageSliderImageIndex={setImageSliderImageIndex}
            imageUrls={imageUrls}
          />
        </>
      ) : (
        <ImageGridEmpty />
      )}
    </div>
  );
}

function ImageGridEmpty() {
  return (
    <div className="space-y-4">
      <div className="border-muted bg-muted/20 flex min-h-[400px] flex-1 items-center justify-center rounded-xl border-2 border-dashed">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-muted rounded-full p-4">
            <Images className="text-muted-foreground h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-lg font-medium">No Images</p>
            <p className="text-muted-foreground max-w-xs text-sm">
              This memory doesn&apos;t have any images attached
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="bg-muted/20 border-muted flex h-[120px] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed"
          ></div>
        ))}
      </div>
    </div>
  );
}
